import settings as dbconfig
import requests
import json
import time
import traceback
from datetime import datetime, timezone

FILENAME = "weather-realtime.json"

def write_to_file(data):
    """
    Extracts only the required fields and appends to the JSON file.
    """
    # Create a unique ID based on the current time (e.g., 202602092012)
    now = datetime.now(timezone.utc)
    record_id = now.strftime("%Y%m%d%H%M%S")

    clean_record = {
        "record_id": record_id,
        "location": {
            "city": "Dublin",
            "lat": 53.3498,
            "lon": -6.2603
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
    
    # 2. Append to file
    with open(FILENAME, "a", encoding="utf-8") as f:
        f.write(json.dumps(clean_record) + "\n")

def main():
    print(f"Scraper started. Collecting Temp, Rain, Snow, Wind, Humidity into {FILENAME}")
    while True:
        try:
            r = requests.get("https://api.openweathermap.org/data/2.5/weather", params={
                "lat": 53.3498, 
                "lon": -6.2603,
                "appid": "d92ff70eef512e7502d589d7fd360ac9",
                "units": "metric"
            }, timeout=30)
            r.raise_for_status()

            write_to_file(r.json())
            print(f"Clean record logged at {datetime.now()}")

        except Exception:
            print(traceback.format_exc())
            time.sleep(60)
        
        time.sleep(3600) # Every hour

if __name__ == "__main__":
    main()