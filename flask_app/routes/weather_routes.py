from flask import Blueprint
import requests
import dbinfo
from datetime import datetime, timezone

from common.api_response import ApiResponse

weather_bp = Blueprint('weather', __name__, url_prefix='/api/weather')

LAT = 53.3498
LON = -6.2603


@weather_bp.route("/current")
def get_weather():
    try:
        r = requests.get(
            dbinfo.WEATHER_URI,
            params={
                "lat": LAT,
                "lon": LON,
                "appid": dbinfo.WEATHER_KEY,
                "units": "metric",
                "exclude": "minutely,hourly,daily,alerts",
            },
            timeout=30,
        )

        r.raise_for_status()
        data = r.json()

        now = datetime.now(timezone.utc)
        current = data.get("current", {})

        record = {
            "record_id": now.strftime("%Y%m%d%H%M%S"),
            "location": {
                "city": dbinfo.NAME,
                "lat": LAT,
                "lon": LON,
            },
            "timestamp": now.isoformat(),
            "weather_data": {
                "temp": current.get("temp"),
                "humidity": current.get("humidity"),
                "wind_speed": current.get("wind_speed"),
                "rain": current.get("rain", {}).get("1h", 0.0),
                "snow": current.get("snow", {}).get("1h", 0.0),
            },
        }

        return ApiResponse.ok(record, "Current weather fetched successfully.")
    except Exception as e:
        return ApiResponse.error(message=str(e))


@weather_bp.route("/forecast")
def get_weather_forecast():
    try:
        r = requests.get(
            dbinfo.WEATHER_URI,
            params={
                "lat": LAT,
                "lon": LON,
                "appid": dbinfo.WEATHER_KEY,
                "units": "metric",
                "exclude": "current,minutely,daily,alerts"
            },
            timeout=30
        )

        r.raise_for_status()
        data = r.json()

        now = datetime.now(timezone.utc)
        hourly_data = []

        for hour in data.get("hourly", [])[:4]:
            hourly_data.append({
                "time": datetime.fromtimestamp(hour["dt"], timezone.utc).isoformat(),
                "temp": hour.get("temp"),
                "humidity": hour.get("humidity"),
                "wind_speed": hour.get("wind_speed"),
                "rain": hour.get("rain", {}).get("1h", 0.0),
                "snow": hour.get("snow", {}).get("1h", 0.0),
            })

        current_wind = hourly_data[0]["wind_speed"] if hourly_data else 0
        alert = None
        if current_wind and current_wind >= 6:
            alert = f"Strong winds expected this evening ({round(current_wind * 3.6)} km/h)"
        elif hourly_data and hourly_data[0]["rain"] > 0:
            alert = "Rain expected. Roads may be slippery."

        response = {
            "record_id": now.strftime("%Y%m%d%H%M%S"),
            "location": {
                "city": dbinfo.NAME,
                "lat": LAT,
                "lon": LON
            },
            "current": hourly_data[0] if hourly_data else None,
            "hourly_forecast": hourly_data,
            "alert": alert
        }

        return ApiResponse.ok(response, "Weather forecast fetched successfully.")
    except Exception as e:
        return ApiResponse.error(message=str(e))