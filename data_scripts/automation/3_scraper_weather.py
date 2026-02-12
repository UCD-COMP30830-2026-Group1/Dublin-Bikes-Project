# 3_scraper_weather.py
import json
import os.path
import sys
import time
import traceback
import requests
from datetime import datetime
from sqlalchemy.orm import sessionmaker

from dbinfo import CITY_LAT

# 1. path fix
current_dir = os.path.dirname(os.path.abspath(__file__))#.../automation
parent_dir = os.path.dirname(current_dir) #.../data_scripts
root_dir = os.path.dirname(parent_dir) #.../Dublin_Bikes_Projects
sys.path.append(root_dir)

import dbinfo
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
    # [Startup] The dynamic bicycle crawler is ready. Target database: {dbinfo.DB_NAME_ML})
    print(f"[Startup] ====The dynamic bicycle crawler is ready. Target database: {dbinfo.DB_NAME_ML}")
    print("====This is an infinite loop script. It runs once per hour. Press Ctrl+C to stop it.\n")

    engine = init_db(dbinfo.URI_ML)
    Session = sessionmaker(bind=engine)

    while(True):
        # The beginning of the cycle
        start_time = time.time()
        timestamp_str = time.strftime("%Y%m%d_%H%M%S")
        print(f"[{timestamp_str}] ====Starting a new round of weather scraping...")
        session = Session() #Each cycle create a new Session instance

        try:
            # Step A: ask API
            # https://api.openweathermap.org/data/3.0/onecall?lat={lat}&lon={lon}&exclude={part}&appid={API key}
            params = {
                "lat":LAT,
                "lon":LNG,
                "appid":WEATHER_KEY,
                "exclude":"minutely,alerts",
                "units":"metric"
            }

            response = requests.get(WEATHER_URI, params=params, timeout=30)
            response.raise_for_status()  #  403/404/500

            data = response.json()
            # print(json.dumps(data, indent=4, ensure_ascii=False))
            print(f"====Successfully retrieved. A total of {len(data)} station data points were obtained.")

            # Step B: JSON backup
            json_filename = os.path.join(SAVE_DIR, f"weather_{timestamp_str}.json")

            with open(json_filename, "w", encoding="utf-8") as f:
                json.dump(data, f, indent=4, ensure_ascii=False)
                print(f"====Weather data has been backed up")

            # Step C: Store in the database
            # C.1 current weather data
            # If empty data is found, it is placed in an empty dictionary {}.
            current = data.get('current',{})
            weather_now = WeatherCurrent(
                dt=datetime.now(),
                temp=current.get('temp'),
                feels_like=current.get('feels_like'),
                pressure=current.get('pressure'),
                humidity=current.get('humidity'),
                uvi=current.get('uvi'),
                wind_speed=current.get('wind_speed'),
                wind_gust=current.get('wind_gust'),
                weather_id=current['weather'][0]['id'],
                sunrise=timestamp_2_dt(current.get('sunrise')),
                sunset=timestamp_2_dt(current.get('sunset')),
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
                    feels_like = item.get('feels_like'),
                    humidity = item.get('humidity'),
                    pop = item.get('pop'),
                    pressure = item.get('pressure'),
                    temp = item.get('temp'),
                    uvi = item.get('uvi'),
                    weather_id = item['weather'][0]['id'],
                    wind_speed = item.get('wind_speed'),
                    wind_gust = item.get('wind_gust'),
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
                    humidity = item.get('humidity'),
                    pop = item.get('pop'),
                    pressure = item.get('pressure'),
                    temp_max = item.get('temp').get('max'),
                    temp_min = item.get('temp').get('min'),
                    uvi = item.get('uvi'),
                    weather_id = item['weather'][0]['id'],
                    wind_speed = item.get('wind_speed'),
                    wind_gust = item.get('wind_gust'),
                    rain = item.get('rain',0),
                    snow = item.get('snow',0)
                )
                session.add(weather_daily)
            session.commit()
            print(f"====Weather data successfully added: Current(1) + Hourly({len(hourly_list)}) + Daily({len(daily_list)})")
        except requests.exceptions.ConnectionError:
            print("[Network Error] Unable to connect to OpenWeatherMap, skip this cycle.")
        except Exception as e:
            session.rollback()

            print(f"Weather fetching failed: {e}")
            traceback.print_exc()
        finally:
            session.close()

        drift_time = time.time()-start_time
        sleep_time = max(0, 3600 - drift_time)
        print(f"==== Rest {int(sleep_time/60)} minutes...")
        time.sleep(sleep_time)

if __name__=='__main__':
    scrape_weather_automation()