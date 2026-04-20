from flask import Flask, jsonify, Blueprint
from datetime import datetime,timezone

from sqlalchemy import func

from common.database import SessionLocal
from common.api_response import ApiResponse
from common.extensions import cache
from common.models import WeatherCurrent, WeatherHourly
import dbinfo

# Delete "app = Flask(__name__)" and replace with weather_bp
weather_bp = Blueprint('weather', __name__,url_prefix='/api/weather')

# Dublin coordinates
LAT = 53.3498
LON = -6.2603

### get current weather
# @app.route("/api/weather/current")
@weather_bp.route("/current")
@cache.cached(timeout=300) #Cache for 5 minutes to prevent exceeding the weather API quota.
def get_weather():
    session = SessionLocal()
    try:
        current = session.query(WeatherCurrent).order_by(WeatherCurrent.dt.desc()).first()
        if not current:
            return ApiResponse.error(message="No current weather data in database.", code=404)

        now = datetime.now(timezone.utc)


        record = {
            "record_id": now.strftime("%Y%m%d%H%M%S"),
            "location": {
                "city": dbinfo.NAME,
                "lat": LAT,
                "lon": LON,
            },
            "timestamp": current.dt.isoformat() if hasattr(current.dt, 'isoformat') else current.dt,
            "weather_data": {
                "temp": current.temp,
                "humidity": current.humidity,
                "wind_speed": current.wind_speed,
                "rain": getattr(current, 'rain_1h', 0.0),
                "snow": getattr(current, 'snow_1h', 0.0),
            },
        }

        return ApiResponse.ok(record,"Current weather fetched successfully.")
    except Exception as e:
        return ApiResponse.error(message=f"Database query error: {str(e)}")
    finally:
        session.close()

### get 24hours weather data
# @app.route("/api/weather/24h")
@weather_bp.route("/forecast")
@cache.cached(timeout=3000)
def get_weather_24hours():
    session = SessionLocal()
    try:
        now = datetime.now(timezone.utc)
        latest_scrape_time = session.query(func.max(WeatherHourly.dt)).scalar()

        if not latest_scrape_time:
            return ApiResponse.error(message="No forecast data in database.", code=404)

        upcoming_forecasts=(
            session.query(WeatherHourly)
            .filter(WeatherHourly.dt == latest_scrape_time)
            .filter(WeatherHourly.future_dt > now)
            .order_by(WeatherHourly.future_dt.asc())
            .limit(24)
            .all()
        )
        if not upcoming_forecasts:
            return ApiResponse.error(message="No forecast data in database.", code=404)

        hourly_data = []

        # get24 hours data
        for hour in upcoming_forecasts:
            hourly_record = {
                "time": hour.future_dt.isoformat() if hasattr(hour.future_dt, 'isoformat') else hour.future_dt,
                "temp": hour.temp,
                "humidity": hour.humidity,
                "wind_speed": hour.wind_speed,
                "rain": getattr(hour, 'rain_1h', 0.0),
                "snow": getattr(hour, 'snow_1h', 0.0)
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
        return ApiResponse.error(message=f"Database query error: {str(e)}")
    finally:
        session.close()