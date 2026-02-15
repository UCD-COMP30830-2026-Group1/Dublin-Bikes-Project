# 3_scraper_weather.py
import json
import os.path
import sys
import time
import traceback
import requests
from datetime import datetime
from sqlalchemy.orm import sessionmaker



# 1. path fix
current_dir = os.path.dirname(os.path.abspath(__file__))#.../automation
parent_dir = os.path.dirname(current_dir) #.../data_scripts
root_dir = os.path.dirname(parent_dir) #.../Dublin_Bikes_Projects
sys.path.append(root_dir)

import dbinfo
from dbinfo import CITY_LAT
from common.models_auto4ml import init_db,WeatherDaily,WeatherHourly,WeatherCurrent

# 2.API Configuration
WEATHER_KEY = dbinfo.WEATHER_KEY
WEATHER_URI = dbinfo.WEATHER_URI
LAT = dbinfo.CITY_LAT
LNG = dbinfo.CITY_LNG

# 3.Automatically generate JSON save path: root/data/raw/automation/weather
SAVE_DIR = os.path.join(root_dir,"data","raw","automation","weather")
if not os.path.exists(SAVE_DIR):
    os.makedirs(SAVE_DIR)


# 5.Since EC2 ran out of memory, the following defensive code was added to periodically delete JSON files.
def cleanup_old_json(directory, retention_days=7):
    """
    Delete JSON files older than retention_days.
    """
    now = time.time()
    cutoff = now - (retention_days * 86400)  # 86400 seconds = 1 day

    if not os.path.exists(directory):
        return

    print(f"====Checking for files older than {retention_days} days to delete...")
    deleted_count = 0

    try:
        for filename in os.listdir(directory):
            if not filename.endswith(".json"):
                continue

            filepath = os.path.join(directory, filename)
            # Check file modification time
            if os.path.getmtime(filepath) < cutoff:
                try:
                    os.remove(filepath)
                    deleted_count += 1
                    # Optional: print(f"Deleted old file: {filename}")
                except OSError as e:
                    print(f"Error deleting {filename}: {e}")

        if deleted_count > 0:
            print(f"====Cleanup complete. Deleted {deleted_count} old JSON files.")

    except Exception as e:
        print(f"Cleanup failed: {e}")

# 4. Core logic
def timestamp_2_dt(timestamp):
    return datetime.fromtimestamp(timestamp)

def get_rain_snow(item,key):
    """
    Rain and snow data are sometimes represented in the form of {'1h': 0.5}, and sometimes they are completely missing.
    This function is used to safely extract numerical values.
    """
    entry = item.get(key,{}) # {'1h': 0.5} or {}
    if isinstance(entry,dict):
        return entry.get('1h',0)
    return 0


def scrape_weather_automation():
    print(f"[Startup] ====The dynamic weather crawler is ready. Target database: {dbinfo.DB_NAME_ML}")
    print("====This is an infinite loop script. It runs once per hour. Press Ctrl+C to stop it.\n")

    engine = init_db(dbinfo.URI_ML)
    Session = sessionmaker(bind=engine)

    while(True):
        # The beginning of the cycle
        start_time = time.time()
        timestamp_str = time.strftime("%Y%m%d_%H%M%S")
        print(f"[{timestamp_str}] ====Starting a new round of weather scraping...")
        session = Session() #Each cycle create a new Session instance

        data = None

        # ==========================================
        # Add network request retry mechanism
        max_retries = 3
        for attempt in range(max_retries):
            # Step A: ask API
            try:
                params = {
                    "lat": LAT,
                    "lon": LNG,
                    "appid": WEATHER_KEY,
                    "exclude": "minutely,alerts",
                    "units": "metric"
                }

                print(f"====Requesting API (Attempt {attempt + 1}/{max_retries})...")
                response = requests.get(WEATHER_URI, params=params, timeout=30)
                response.raise_for_status()

                data = response.json()
                print(f"Successfully retrieved. Got {len(data)} root keys.")
                # print(json.dumps(data, indent=4, ensure_ascii=False))
                break  # If successful, break out of the retry loop

            except (requests.exceptions.ConnectionError, requests.exceptions.Timeout) as e:
                print(f"!!!!Network Error (Attempt {attempt + 1}): {e}")
                if attempt < max_retries - 1:
                    time.sleep(10)
                else:
                    print("!!!!Max retries exceeded. Skipping this round.")
            except Exception as e:
                print(f"Unexpected Error: {e}")
                break

        if data:
            try:
                # Step B: JSON backup
                json_filename = os.path.join(SAVE_DIR, f"weather_{timestamp_str}.json")

                with open(json_filename, "w", encoding="utf-8") as f:
                    json.dump(data, f, indent=4, ensure_ascii=False)
                    print(f"====Weather data has been backed up")

                cleanup_old_json(SAVE_DIR, retention_days=7)


                # Step C: Store in the database
                # C.1 current weather data
                # If empty data is found, it is placed in an empty dictionary {}.
                current = data.get('current',{})
                weather_now = WeatherCurrent(
                    dt=datetime.now(),
                    temp=current.get('temp'),
                    feels_like=current.get('feels_like'),
                    # Use standard atmospheric pressure 1013 as the default value to prevent null values.
                    pressure=current.get('pressure',1013),
                    humidity=current.get('humidity',0),
                    uvi=current.get('uvi',0),
                    wind_speed=current.get('wind_speed',0),
                    wind_gust=current.get('wind_gust',0),
                    # 800 (sunny day) is used as the default value.
                    weather_id=current.get('weather', [{}])[0].get('id', 800),
                    sunrise=timestamp_2_dt(current.get('sunrise',int(time.time()))),
                    sunset=timestamp_2_dt(current.get('sunset',int(time.time()))),
                    # Avoiding the rain/snow field from being empty.
                    rain_1h=get_rain_snow(current, 'rain'),
                    snow_1h=get_rain_snow(current, 'snow')
                )
                session.add(weather_now)

                # C.2 Hourly weather data
                hourly_list = data.get('hourly',[])
                for item in hourly_list:
                    weather_hourly = WeatherHourly(
                        dt=datetime.now(),
                        future_dt = timestamp_2_dt(item.get('dt')), #future timestamp
                        feels_like = item.get('feels_like',0),
                        humidity = item.get('humidity',0),
                        pop = item.get('pop',0),
                        # Use standard atmospheric pressure 1013 as the default value
                        pressure = item.get('pressure',1013),
                        temp = item.get('temp',0),
                        uvi = item.get('uvi',0),
                        # 800 (sunny day) is used as the default value.
                        weather_id = item.get('weather', [{}])[0].get('id', 800),
                        wind_speed = item.get('wind_speed',0),
                        wind_gust = item.get('wind_gust',0),
                        rain_1h = get_rain_snow(item,'rain'),
                        snow_1h = get_rain_snow(item,'snow')
                    )
                    session.add(weather_hourly)

                # C.3 7-day weather data
                daily_list = data.get('daily',[])
                for item in daily_list:
                    weather_daily = WeatherDaily(
                        dt=datetime.now(),
                        future_dt = timestamp_2_dt(item.get('dt')),
                        humidity = item.get('humidity',0),
                        pop = item.get('pop',0),
                        pressure = item.get('pressure',1013),
                        temp_max = item.get('temp',{}).get('max',0),
                        temp_min = item.get('temp',{}).get('min',0),
                        uvi = item.get('uvi',0),
                        # 800 (sunny day) is used as the default value.
                        weather_id = item.get('weather',[{}])[0].get('id',800),
                        wind_speed = item.get('wind_speed',0),
                        wind_gust = item.get('wind_gust',0),
                        rain = item.get('rain',0),
                        snow = item.get('snow',0)
                    )
                    session.add(weather_daily)
                session.commit()
                print(f"====Weather data successfully added: Current(1) + Hourly({len(hourly_list)}) + Daily({len(daily_list)})")
            except Exception as e:
                session.rollback()

                print(f"Weather fetching failed: {e}")
                traceback.print_exc()

        session.close()

        drift_time = time.time()-start_time
        sleep_time = max(0, 3600 - drift_time)
        print(f"==== Rest {int(sleep_time/60)} minutes...")
        time.sleep(sleep_time)

if __name__=='__main__':
    scrape_weather_automation()