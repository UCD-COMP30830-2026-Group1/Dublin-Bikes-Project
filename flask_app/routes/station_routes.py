from datetime import datetime, timedelta

import requests
from flask import Blueprint, request
from sqlalchemy import create_engine, func
from sqlalchemy.orm import sessionmaker

import dbinfo
from common.api_response import ApiResponse
from common.models import Station, Availability

station_bp = Blueprint('station', __name__, url_prefix="/api/stations")

engine = create_engine(dbinfo.URI_ML)
Session = sessionmaker(bind=engine)


@station_bp.route('/realtime')
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
def get_static_stations():
    session = Session()
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
def get_live_stations():
    session = Session()
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
        avail_dict={}
        for avail in recent_avails:
            if avail.number not in avail_dict:
                avail_dict[avail.number] = avail #Because recent_avails are sorted in descending order of last update time,

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
def get_historical_availability():
    session = Session()
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