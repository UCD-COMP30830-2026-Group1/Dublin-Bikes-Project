#2_scraper_bikes.py
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
from common.models_auto4ml import init_db,Availability

# 2.API Configuration
API_KEY = dbinfo.JCKEY
CONTRACT = dbinfo.NAME
BASE_URI = dbinfo.STATIONS_URI

# 3.Automatically generate JSON save path: root/data/raw/automation/stations
SAVE_DIR = os.path.join(root_dir,"data","raw","automation","bikes")
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
def scrape_bikes_automation():
    # [Startup] The dynamic bicycle crawler is ready. Target database: {dbinfo.DB_NAME_ML})
    print(f"[Startup] ====The dynamic bicycle crawler is ready. Target database: {dbinfo.DB_NAME_ML}")
    print("====This is an infinite loop script. Press Ctrl+C to stop it.\n")

    engine = init_db(dbinfo.URI_ML)
    Session = sessionmaker(bind=engine)

    while(True):
        # The beginning of the cycle
        start_time = time.time()
        timestamp_str = time.strftime("%Y%m%d_%H%M%S")
        print(f"[{timestamp_str}] ====Starting a new round of scraping...")
        session = Session() #Each cycle create a new Session instance

        try:
            # Step A: ask API
            params = {"contract": CONTRACT, "apiKey": API_KEY}

            response = requests.get(BASE_URI, params=params, timeout=15)
            response.raise_for_status()  #  403/404/500

            data = response.json()
            print(f"====Successfully retrieved. A total of {len(data)} station data points were obtained.")

            # Step B: JSON backup
            json_filename = os.path.join(SAVE_DIR, f"bikes_{timestamp_str}.json")

            with open(json_filename, "w", encoding="utf-8") as f:
                json.dump(data, f, indent=4, ensure_ascii=False)
                print(f"====JSON backed up ({len(data)} sites)")

            # After saving the new JSON file, clean up the old versions
            cleanup_old_json(SAVE_DIR, retention_days=7)

            # Step C: Store in the database
            count = 0
            for item in data:
                # data cleaning
                availability = Availability(
                    number = item.get('number'),
                    available_bikes=item.get('available_bikes',0),
                    available_bike_stands=item.get('available_bike_stands',0),
                    status=item.get('status'),
                    # item['last_update'] or datetime.now()
                    last_update=datetime.now()
                )
                session.add(availability)
                count+=1

            session.commit()
            print(f"==== New additions: {count}.")

        except Exception as e:
            session.rollback()  # Roll back if an error occurs, keeping the database clean.
            print(e)
            traceback.print_exc()
        finally:
            session.close()

#         Avoid time drift
        drift_time = time.time() - start_time
        # sleep_time = 300-drift_time
        sleep_time = max(0, 300 - drift_time) #300-10 = 290s
        print(f"==== Rest {int(sleep_time)} seconds...")
        time.sleep(sleep_time)

if __name__=='__main__':
    scrape_bikes_automation()