from flask import Flask, jsonify
import requests
import dbinfo
from datetime import datetime,timezone
app = Flask(__name__)

# Dublin coordinates
LAT = 53.3498
LON = -6.2603


### get current weather
@app.route("/api/weather/current")
def get_weather():

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

    return jsonify(record)


### get 24hours weather data


@app.route("/api/weather/24h")
def get_weather_24hours():

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
        "timestamp": now.isoformat(),
        "24_hour_forecast": hourly_data
    }

    return jsonify(response)

if __name__ == "__main__":
    app.run(debug=True)