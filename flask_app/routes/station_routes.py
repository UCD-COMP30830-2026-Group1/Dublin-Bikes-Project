import os

import os
import json
import joblib
import requests
import numpy as np
import pandas as pd
from datetime import datetime, timedelta
from flask import Blueprint, request

import dbinfo
from common.api_response import ApiResponse
from common.extensions import cache
from common.models import Station, Availability, WeatherCurrent
from common.database import SessionLocal
from flask_app.ml.feature_engineering import FEATURE_COLUMNS, build_features

station_bp = Blueprint('station', __name__, url_prefix="/api/stations")

_ML_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "ml")
_MODEL_PATH = os.path.join(_ML_DIR, "model.pkl")
_METRICS_PATH = os.path.join(_ML_DIR, "metrics.json")

# ── ML Model Initialization ───────────────────────────────────────────
def _load_model():
    if not os.path.exists(_MODEL_PATH):
        return None
    return joblib.load(_MODEL_PATH)


_model = _load_model()

# ── API Routes ────────────────────────────────────────────────────────
@station_bp.route('/realtime')
@cache.cached(timeout=60)  # caching for 1 minute
def get_realtime_stations():
    try:
        url = "https://api.jcdecaux.com/vls/v1/stations"
        params = {"contract": dbinfo.NAME, "apiKey": dbinfo.JCKEY}
        response = requests.get(url, params=params, timeout=30)
        response.raise_for_status()
        stations_data = response.json()
        return ApiResponse.ok(data=stations_data, message=f"Successfully fetched {len(stations_data)} stations.")
    except requests.exceptions.RequestException as e:
        return ApiResponse.error(message=str(e))


@station_bp.route('/static', methods=["GET"])
@cache.cached(timeout=3600)  # caching for 1 hour to reduce the database load
def get_static_stations():
    session = SessionLocal()
    try:
        stations = session.query(Station).all()
        station_list = []
        for s in stations:
            station_list.append({
                'number': s.number,
                'address': s.address,
                'banking': s.banking,
                'bike_stands': s.bike_stands,
                'name': s.name,
                'position_lat': s.position_lat,
                'position_lng': s.position_lng,
            })
        return ApiResponse.ok(data=station_list, message=f"Successfully fetched {len(station_list)} stations.")
    except Exception as e:
        return ApiResponse.error(message=str(e))
    finally:
        session.close()


# NEW: Merges Station (static) + latest Availability (live) into one response.
# This is what the frontend MapView should call.
# Modification: cut down the time & space complexity from O(N^2) -> O(N)
@station_bp.route('/live', methods=["GET"])
@cache.cached(timeout=60)
def get_live_stations():
    session = SessionLocal()
    try:
        # Step 1: Get the most recent last_update timestamp per station number
        # Modified step1: Query all the static stations(115 stations->only 115)
        stations = session.query(Station).all()

        # Step 2: Join Station + latest Availability row
        # Modified step2: Only query dynamic data within the past 15 minutes,
        # avoiding full table scans, space consuming= 115 stations * 3 times=345 (worst case)
        fifteen_minutes_ago = datetime.now() - timedelta(minutes=15)
        recent_avails = session.query(Availability).filter(
            Availability.last_update >= fifteen_minutes_ago
        ).order_by(Availability.last_update.desc()).all()

        # Modified step3: Build a dictionary mapping in memory
        avail_dict = {}
        for avail in recent_avails:
            if avail.number not in avail_dict:
                avail_dict[
                    avail.number] = avail  # Because recent_avails are sorted in descending order of last update time,

        # Modified step4: compose the results
        station_list = []
        for station in stations:
            # dictionary query -> time complexity: O(1)
            avail = avail_dict.get(station.number)
            station_list.append({
                'number': station.number,
                'name': station.name,
                'address': station.address,
                'banking': station.banking,
                'bike_stands': station.bike_stands,
                'position_lat': station.position_lat,
                'position_lng': station.position_lng,
                # Availability fields — None if no data scraped yet
                'available_bikes': avail.available_bikes if avail else None,
                'available_bike_stands': avail.available_bike_stands if avail else None,
                'status': avail.status if avail else 'UNKNOWN',
                'last_update': avail.last_update.isoformat() if avail else None,
            })

        return ApiResponse.ok(
            data=station_list,
            message=f"Successfully fetched {len(station_list)} live stations."
        )
    except Exception as e:
        return ApiResponse.error(message=str(e))
    finally:
        session.close()

@station_bp.route('/historical', methods=["GET"])
@cache.cached(timeout=300, query_string=True)
def get_historical_availability():
    session = SessionLocal()
    try:
        station_number = request.args.get("number")
        query = session.query(Availability)

        if station_number:
            try:
                station_number = int(station_number)
                query = query.filter(Availability.number == station_number)
            except ValueError:
                return ApiResponse.error("station number must be an integer", 400)

        results = query.order_by(Availability.last_update.desc()).limit(300).all()

        nested_data = {}
        for rec in results:
            sid = rec.number
            if sid not in nested_data:
                nested_data[sid] = []
            nested_data[sid].append({
                "timestamp": rec.last_update.isoformat(),
                "available_bikes": rec.available_bikes,
                "available_bike_stands": rec.available_bike_stands,
                "status": rec.status
            })
        return ApiResponse.ok(
            data=nested_data,
            message=f"Historical data fetched for {len(nested_data)} stations."
        )
    except Exception as e:
        return ApiResponse.error(message=f"RDS query error: {str(e)}")
    finally:
        session.close()


@station_bp.route('/predict', methods=["GET"])
def predict_availability():
    """
    GET /api/stations/predict?number={station_id}

    Predicts available bikes at a station for the next 30 minutes
    using the trained RandomForestRegressor model.

    Uses:
      - availability table  → latest bike count for this station
      - station table       → bike_stands (total capacity)
      - weather_current     → latest temp, humidity, pressure, wind_speed, rain_1h

    Response shape:
    {
      "code": 200,
      "data": {
        "station_number": 42,
        "predicted_bikes": 12,
        "confidence": 0.78,
        "horizon_minutes": 30,
        "low_confidence": false,
        "model_rmse": 5.97,
        "model_r2": 0.623,
        "trained_at": "2026-04-07T10:00:00"
      }
    }
    """
    # ── Validate query param ──────────────────────────────────────
    raw = request.args.get("number")
    if not raw:
        return ApiResponse.error("Missing required query param: number", 400)
    try:
        station_number = int(raw)
    except ValueError:
        return ApiResponse.error("station number must be an integer", 400)

    # ── Check model is loaded ─────────────────────────────────────
    if _model is None:
        return ApiResponse.error(
            "ML model not found — run flask_app/ml/train_model.py first.", 503
        )

    session = SessionLocal()
    try:
        # ── 1. Station static info (bike_stands = total capacity) ──
        station = session.query(Station).filter_by(number=station_number).first()
        if not station:
            return ApiResponse.error(f"Station {station_number} not found", 404)

        # ── 2. Latest availability snapshot for this station ───────
        latest_avail = (
            session.query(Availability)
            .filter_by(number=station_number)
            .order_by(Availability.last_update.desc())
            .first()
        )
        if not latest_avail:
            return ApiResponse.error(
                f"No availability data for station {station_number}", 404
            )

        # ── 3. Most recent weather observation ─────────────────────
        # weather_current stores one row per hour — get the latest
        latest_weather = (
            session.query(WeatherCurrent)
            .order_by(WeatherCurrent.dt.desc())
            .first()
        )

        # ── 4. Build feature row matching training schema ──────────
        row = {
            "number": station_number,
            "last_update": latest_avail.last_update,
            "available_bikes": latest_avail.available_bikes,
            "bike_stands": station.bike_stands,
            # weather fields — use sensible Dublin defaults if no weather row
            "temp": (latest_weather.temp if latest_weather else 10.0),
            "humidity": (latest_weather.humidity if latest_weather else 75),
            "pressure": (latest_weather.pressure if latest_weather else 1013),
            "wind_speed": (latest_weather.wind_speed if latest_weather else 5.0),
            "rain_1h": (latest_weather.rain_1h if latest_weather and latest_weather.rain_1h else 0.0),
        }

        df = pd.DataFrame([row])
        df = build_features(df)
        X = df[FEATURE_COLUMNS]

        # ── 5. Predict with confidence from tree spread ────────────
        # Each tree gives an independent prediction.
        # Low spread between trees = high confidence.
        tree_preds = np.array([tree.predict(X)[0] for tree in _model.estimators_])
        predicted = float(np.mean(tree_preds))
        std_dev = float(np.std(tree_preds))

        # Normalise: std_dev 0 → 1.0 confidence, std_dev ≥ 8 → 0.0
        confidence = round(float(np.clip(1.0 - (std_dev / 8.0), 0.0, 1.0)), 2)
        predicted_bikes = int(round(np.clip(predicted, 0, station.bike_stands)))

        # ── 6. Attach training metrics for UI display ──────────────
        model_info = {}
        if os.path.exists(_METRICS_PATH):
            with open(_METRICS_PATH) as f:
                model_info = json.load(f)

        return ApiResponse.ok(data={
            "station_number": station_number,
            "predicted_bikes": predicted_bikes,
            "confidence": confidence,
            "horizon_minutes": 30,
            "low_confidence": confidence < 0.60,
            "model_rmse": model_info.get("rmse"),
            "model_r2": model_info.get("r2"),
            "trained_at": model_info.get("trained_at"),
        }, message=f"Prediction for station {station_number}")

    except Exception as e:
        return ApiResponse.error(message=f"Prediction error: {str(e)}", code=500)
    finally:
        session.close()
