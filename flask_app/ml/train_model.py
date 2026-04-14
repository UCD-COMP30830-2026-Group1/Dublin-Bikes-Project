# flask_app/ml/train_model.py
#
# Trains the RandomForest model using the live AWS RDS database.
# Can also fall back to final_merged_data.csv with --csv flag.
#
# Usage (from project root):
#   python flask_app/ml/train_model.py              # uses live DB
#   python flask_app/ml/train_model.py --csv path/to/final_merged_data.csv
#
# Output:
#   flask_app/ml/model.pkl     — serialised RandomForestRegressor
#   flask_app/ml/metrics.json  — RMSE, R², feature importances

import os
import sys
import json
import argparse
import joblib
import logging
import numpy as np
import pandas as pd
from datetime import datetime, timedelta
from sklearn.ensemble import RandomForestRegressor
from sklearn.model_selection import train_test_split
from sklearn.metrics import mean_squared_error, r2_score

# ── Path fix ──────────────────────────────────────────────────────
current_dir = os.path.dirname(os.path.abspath(__file__))   # flask_app/ml/
flask_dir   = os.path.dirname(current_dir)                  # flask_app/
root_dir    = os.path.dirname(flask_dir)                    # project root
sys.path.append(root_dir)
sys.path.append(current_dir)  # so feature_engineering imports cleanly

from feature_engineering import build_features, FEATURE_COLUMNS, TARGET_COLUMN

MODEL_PATH    = os.path.join(current_dir, "model.pkl")
METRICS_PATH  = os.path.join(current_dir, "metrics.json")
TRAINING_DAYS = 90
MIN_ROWS      = 500

logging.basicConfig(level=logging.INFO, format="%(asctime)s  %(message)s")
log = logging.getLogger(__name__)


def load_from_db(engine) -> pd.DataFrame:
    """
    Joins availability + station + weather_current by matching on hour.

    Availability is scraped every 5 minutes.
    weather_current is stored once per hour.
    We match them by truncating availability.last_update to the hour.

    Returns a flat DataFrame ready for build_features().
    """
    cutoff = datetime.now() - timedelta(days=TRAINING_DAYS)
    cutoff_str = cutoff.strftime("%Y-%m-%d %H:%M:%S")

    query = f"""
        SELECT
            a.number,
            a.last_update,
            a.available_bikes,
            s.bike_stands,
            w.temp,
            w.humidity,
            w.pressure,
            w.wind_speed,
            COALESCE(w.rain_1h, 0.0) AS rain_1h
        FROM availability a
        JOIN station s
            ON a.number = s.number
        LEFT JOIN weather_current w
            ON DATE_FORMAT(a.last_update, '%%Y-%%m-%%d %%H:00:00') =
               DATE_FORMAT(w.dt,          '%%Y-%%m-%%d %%H:00:00')
        WHERE a.last_update >= '{cutoff_str}'
          AND a.available_bikes IS NOT NULL
        ORDER BY a.last_update DESC
    """
    log.info(f"Querying DB for last {TRAINING_DAYS} days...")
    df = pd.read_sql(query, engine)
    log.info(f"  Loaded {len(df):,} rows, {df['number'].nunique()} stations.")
    return df


def load_from_csv(csv_path: str) -> pd.DataFrame:
    """
    Loads final_merged_data.csv and maps its columns to match
    the DB schema expected by build_features().

    CSV columns used:
        station_id          → number
        last_reported       → last_update
        num_bikes_available → available_bikes
        capacity            → bike_stands
        max_air_temperature_celsius + min → averaged → temp
        max_relative_humidity_percent     → humidity
        max_barometric_pressure_hpa       → pressure
        (no wind_speed / rain_1h in CSV — filled with 0)
    """
    log.info(f"Loading from CSV: {csv_path}")
    df = pd.read_csv(csv_path)
    log.info(f"  Loaded {len(df):,} rows.")

    df = df.rename(columns={
        "station_id":          "number",
        "last_reported":       "last_update",
        "num_bikes_available": "available_bikes",
        "capacity":            "bike_stands",
    })

    df["temp"]       = (df["max_air_temperature_celsius"] + df["min_air_temperature_celsius"]) / 2
    df["humidity"]   = df["max_relative_humidity_percent"]
    df["pressure"]   = df["max_barometric_pressure_hpa"]
    df["wind_speed"] = 0.0   # not in CSV
    df["rain_1h"]    = 0.0   # not in CSV

    return df[["number", "last_update", "available_bikes",
               "bike_stands", "temp", "humidity", "pressure",
               "wind_speed", "rain_1h"]]


def train(df: pd.DataFrame) -> dict:
    """Core training logic. Accepts a DataFrame from any source."""

    if len(df) < MIN_ROWS:
        log.error(f"Only {len(df)} rows — need at least {MIN_ROWS}. Aborting.")
        sys.exit(1)

    df = build_features(df)
    df = df.dropna(subset=FEATURE_COLUMNS + [TARGET_COLUMN])

    X = df[FEATURE_COLUMNS]
    y = df[TARGET_COLUMN]

    log.info(f"Training on {len(X):,} rows, {len(FEATURE_COLUMNS)} features.")

    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, random_state=42
    )

    log.info("Fitting RandomForestRegressor...")
    model = RandomForestRegressor(
        n_estimators=100,
        max_depth=12,
        min_samples_leaf=5,
        random_state=42,
        n_jobs=-1,
    )
    model.fit(X_train, y_train)

    y_pred = model.predict(X_test)
    rmse   = float(np.sqrt(mean_squared_error(y_test, y_pred)))
    r2     = float(r2_score(y_test, y_pred))
    log.info(f"  RMSE: {rmse:.3f}   R²: {r2:.3f}")

    log.info("Feature importances:")
    for feat, imp in sorted(zip(FEATURE_COLUMNS, model.feature_importances_), key=lambda x: -x[1]):
        log.info(f"  {feat}: {imp:.3f}")

    joblib.dump(model, MODEL_PATH)
    log.info(f"Model saved → {MODEL_PATH}")

    metrics = {
        "trained_at":    datetime.now().isoformat(),
        "training_rows": int(len(X_train)),
        "test_rows":     int(len(X_test)),
        "rmse":          round(rmse, 4),
        "r2":            round(r2, 4),
        "features":      FEATURE_COLUMNS,
        "importances":   {f: round(float(i), 4)
                          for f, i in zip(FEATURE_COLUMNS, model.feature_importances_)},
    }
    with open(METRICS_PATH, "w") as f:
        json.dump(metrics, f, indent=2)
    log.info(f"Metrics saved → {METRICS_PATH}")

    return metrics


if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("--csv", type=str, default=None,
                        help="Path to final_merged_data.csv (optional, uses DB by default)")
    args = parser.parse_args()

    if args.csv:
        df = load_from_csv(args.csv)
    else:
        try:
            import dbinfo
            from sqlalchemy import create_engine
            engine = create_engine(dbinfo.URI_ML)
            df = load_from_db(engine)
        except Exception as e:
            log.error(f"DB load failed: {e}")
            log.error("Tip: use --csv final_merged_data.csv to train from file instead.")
            sys.exit(1)

    metrics = train(df)
    log.info(f"Done. RMSE={metrics['rmse']}  R²={metrics['r2']}")