from flask import Flask, jsonify, Blueprint
import requests
import dbinfo
from datetime import datetime,timezone

from common.api_response import ApiResponse

# Delete "app = Flask(__name__)" and replace with weather_bp
weather_bp = Blueprint('weather', __name__,url_prefix='/api/weather')

# Dublin coordinates
LAT = 53.3498
LON = -6.2603


### get current weather
# @app.route("/api/weather/current")
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

        return ApiResponse.ok(record,"Current weather fetched successfully.")
    except Exception as e:
        return ApiResponse.error(message=str(e))


### get 24hours weather data
# @app.route("/api/weather/24h")
@weather_bp.route("/forecast")
def get_weather_24hours():

    try:
        r = requests.get(dbinfo.WEATHER_URI, params={
            "lat": LAT,
            "lon": LON,
            "appid": dbinfo.WEATHER_KEY,
            "units": "metric",
            "exclude": "current,minutely,daily,alerts"
        }, timeout=30)

        r.raise_for_status()
        data = r.json()

        now = datetime.now(timezone.utc)

        hourly_data = []

        # get24 hours data
        for hour in data.get("hourly", [])[:24]:
            hourly_record = {
                "time": datetime.fromtimestamp(hour["dt"], timezone.utc).isoformat(),
                "temp": hour.get("temp"),
                "humidity": hour.get("humidity"),
                "wind_speed": hour.get("wind_speed"),
                "rain": hour.get("rain", {}).get("1h", 0.0),
                "snow": hour.get("snow", {}).get("1h", 0.0)
            }
            hourly_data.append(hourly_record)

        response = {
            "record_id": now.strftime("%Y%m%d%H%M%S"),
            "location": {
                "city": dbinfo.NAME,
                "lat": LAT,
                "lon": LON
            },
            "24_hour_forecast": hourly_data
        }

        return ApiResponse.ok(response,"24h weather forecast fetched successfully")
    except Exception as e:
        return ApiResponse.error(message=str(e))
