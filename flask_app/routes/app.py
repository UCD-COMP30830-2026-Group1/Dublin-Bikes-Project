from flask import Flask, jsonify
import requests
import dbinfo
from datetime import datetime,timezone
app = Flask(__name__)

# Dublin coordinates
LAT = 53.3498
LON = -6.2603

@app.route("/api/weather/current")
def get_weather():
    url = "https://api.openweathermap.org/data/2.5/weather"

    r = requests.get(url, params={
        "lat": LAT,
        "lon": LON,
        "appid": dbinfo.WEATHER_KEY,
        "units": "metric" ,
    },timeout=30,)
    r.raise_for_status()
    data = r.json()
    now = datetime.now(timezone.utc)
    record = {
            "record_id": now.strftime("%Y%m%d%H%M%S"),
            "location": {
                "city": dbinfo.NAME,
                "lat": LAT,
                "lon": LON
            },
            "timestamp": now.isoformat(),
        "weather_data": {
            "temp": data.get("main", {}).get("temp"),
            "humidity": data.get("main", {}).get("humidity"),
            "wind_speed": data.get("wind", {}).get("speed"),
            "rain": data.get("rain", {}).get("1h", 0.0),
            "snow": data.get("snow", {}).get("1h", 0.0)
        }
    }
    return jsonify(record)


if __name__ == "__main__":
    app.run(debug=True)