# flask_app/ml/feature_engineering.py
#
# Shared feature logic used by BOTH train_model.py AND the /predict endpoint.
# Never duplicate this in any other file.
#
# ── DB schema this is built against (from AWS RDS dump) ──────────
#
# availability:   number, last_update, available_bikes,
#                 available_bike_stands, status
#
# station:        number, address, banking, bike_stands,
#                 name, position_lat, position_lng
#
# weather_current: dt, feels_like, humidity, sunrise, sunset,
#                  temp, uvi, weather_id, wind_gust, wind_speed,
#                  rain_1h, snow_1h
#
# weather_hourly:  dt, future_dt, feels_like, humidity, pop,
#                  temp, uvi, weather_id, wind_speed, wind_gust,
#                  rain_1h, snow_1h
#
# ─────────────────────────────────────────────────────────────────

import pandas as pd


def build_features(df: pd.DataFrame) -> pd.DataFrame:
    """
    Accepts a DataFrame produced by the training SQL join or the predict
    endpoint, and adds all model feature columns.

    Expected input columns (exact names from the JOIN query):
        number          — station ID (int)
        last_update     — datetime
        available_bikes — target (int)
        bike_stands     — total capacity (int)
        temp            — °C float (from weather_current)
        humidity        — % int (from weather_current)
        wind_speed      — m/s float (from weather_current)
        rain_1h         — mm float (from weather_current, nullable)

    Features produced (FEATURE_COLUMNS order):
        station_number  — integer station ID
        hour            — 0–23
        day_of_week     — 0 (Mon) to 6 (Sun)
        is_weekend      — 1 if Sat/Sun else 0
        bike_stands     — total capacity
        temp            — air temperature °C
        humidity        — relative humidity %
        wind_speed      — wind speed m/s
        rain_1h         — precipitation mm (0 if null)
    """
    df = df.copy()

    # Datetime features
    df["last_update"]    = pd.to_datetime(df["last_update"])
    df["hour"]           = df["last_update"].dt.hour
    df["day_of_week"]    = df["last_update"].dt.dayofweek
    df["is_weekend"]     = (df["day_of_week"] >= 5).astype(int)
    df["station_number"] = df["number"].astype(int)

    # Weather features — fill nulls with safe defaults
    df["temp"]       = df["temp"].fillna(10.0)
    df["humidity"]   = df["humidity"].fillna(75)
    df["wind_speed"] = df["wind_speed"].fillna(5.0)
    df["rain_1h"]    = df["rain_1h"].fillna(0.0)
    df["bike_stands"] = df["bike_stands"].fillna(20).astype(int)

    return df


# Exact ordered feature list — NEVER change order between training and prediction
FEATURE_COLUMNS = [
    "station_number",
    "hour",
    "day_of_week",
    "is_weekend",
    "bike_stands",
    "temp",
    "humidity",
    "wind_speed",
    "rain_1h",
]

TARGET_COLUMN = "available_bikes"