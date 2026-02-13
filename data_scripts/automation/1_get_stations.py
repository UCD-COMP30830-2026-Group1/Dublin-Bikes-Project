#1_get_stations.py
import json
import os.path
import sys
import time
import traceback

import requests
from sqlalchemy.orm import sessionmaker

# 1. path fix
current_dir = os.path.dirname(os.path.abspath(__file__))#.../automation
parent_dir = os.path.dirname(current_dir) #.../data_scripts
root_dir = os.path.dirname(parent_dir) #.../Dublin_Bikes_Projects
sys.path.append(root_dir)

import dbinfo
from common.models_auto4ml import init_db,Station

# 2.API Configuration
API_KEY = dbinfo.JCKEY
CONTRACT = dbinfo.NAME
BASE_URI = dbinfo.STATIONS_URI

# 3.Automatically generate JSON save path: root/data/raw/automation/stations
SAVE_DIR = os.path.join(root_dir,"data","raw","automation","stations")
if not os.path.exists(SAVE_DIR):
    os.makedirs(SAVE_DIR)

# 4. Core logic
def get_static_stations():
    engine = init_db(dbinfo.URI_ML)
    Session = sessionmaker(bind=engine)
    session = Session()

    try:
        # Step A: ask API
        params = {"contract": CONTRACT, "apiKey": API_KEY}

        response = requests.get(BASE_URI, params=params, timeout=15)
        response.raise_for_status()  #  403/404/500

        data = response.json()
        print(f"====Successfully retrieved. A total of {len(data)} station data points were obtained.")

        # Step B: JSON backup
        json_filename = os.path.join(SAVE_DIR, "stations_static_latest.json")

        with open(json_filename, "w", encoding="utf-8") as f:
            json.dump(data, f, indent=4, ensure_ascii=False)
            print(f"====The original data has been backed up to: {json_filename}")

        # Step C: Store in the database (cleaning + upsert)
        print("====Synchronizing to the database...")
        new_count = 0
        update_count = 0

        for item in data:
            existing_station = session.query(Station).filter_by(number=item['number']).first()

            lat = item.get('position', {}).get('lat')
            lng = item.get('position', {}).get('lng')


            # Convert banking from boolean to integer (True/False -> 1/0)
            is_banking = 1 if item.get('banking') else 0

            if existing_station:
                existing_station.name = item['name']
                existing_station.address = item['address']
                existing_station.position_lat = lat
                existing_station.position_lng = lng
                existing_station.banking = is_banking
                existing_station.bike_stands = item['bike_stands']
                update_count += 1
            else:
                station = Station(
                    number=item['number'],
                    name=item['name'],
                    address=item['address'],
                    position_lat=lat,
                    position_lng=lng,
                    banking=is_banking,
                    bike_stands=item['bike_stands']
                )
                session.add(station)
                new_count += 1

        session.commit()
        print(f"====Synchronization complete. New additions: {new_count}, Updates: {update_count}.")

    except Exception as e:
        session.rollback()  # 出错就回滚，保持数据库干净
        print(e)
        traceback.print_exc()
    finally:
        session.close()

if __name__=='__main__':
    get_static_stations()