import json
import os
import sys
from datetime import datetime
from sqlalchemy.orm import sessionmaker

# Set up paths
current_dir = os.path.dirname(os.path.abspath(__file__))
# data_scripts -> root
root_dir = os.path.dirname(current_dir)
sys.path.append(root_dir)

# Add data/dataset to sys.path to find models.py
dataset_dir = os.path.join(root_dir, 'data', 'dataset')
sys.path.append(dataset_dir)

import dbinfo
# Import models
from common.models import Station, Availability, WeatherCurrent, init_db

def load_json(file_path):
    """Helper to load JSON file."""
    with open(file_path, 'r', encoding='utf-8') as f:
        return json.load(f)


def import_stations(session, file_path):
    """Import stations from stations.json."""
    if not os.path.exists(file_path):
        print(f"File not found: {file_path}")
        return

    data = load_json(file_path)
    print(f"Importing {len(data)} stations...")

    for item in data:
        station = Station(
            number=item.get('number'),
            address=item.get('address'),
            banking=1 if item.get('banking') else 0,
            bike_stands=item.get('bike_stands'),
            name=item.get('name'),
            position_lat=item.get('position', {}).get('lat'),
            position_lng=item.get('position', {}).get('lng')
        )
        # merge() handles updates for existing primary keys to prevent duplicates
        session.merge(station)

    session.commit()
    print("Stations imported successfully.")


def import_availability(session, file_path):
    """Import bike availability from bike-48h.json (NDJSON format)."""
    if not os.path.exists(file_path):
        print(f"File not found: {file_path}")
        return

    print(f"Importing availability data from {file_path}...")
    count = 0

    with open(file_path, 'r', encoding='utf-8') as f:
        for line in f:
            line = line.strip()
            if not line: continue

            # Error handling: Remove trailing commas if the file isn't perfect NDJSON
            if line.endswith(','): line = line[:-1]

            try:
                item = json.loads(line)

                # Handle timestamp (compatible with milliseconds or ISO strings)
                raw_ts = item.get('last_update')
                if isinstance(raw_ts, int):
                    # If it is a millisecond-level timestamp (e.g., 1770423360000)
                    last_update = datetime.fromtimestamp(raw_ts / 1000.0)
                else:
                    # If it is a string format
                    last_update = datetime.fromisoformat(item.get('timestamp')) if item.get(
                        'timestamp') else datetime.now()

                availability = Availability(
                    number=item.get('number'),
                    last_update=last_update,
                    available_bikes=item.get('available_bikes'),
                    available_bike_stands=item.get('available_bike_stands'),
                    status=item.get('status')
                )
                session.merge(availability)
                count += 1

                if count % 1000 == 0:
                    session.commit()
                    print(f"Imported {count} records...")

            except json.JSONDecodeError:
                pass
            except Exception as e:
                print(f"Error processing line: {e}")

    session.commit()
    print(f"Availability data imported successfully. Total records: {count}")

def import_weather(session, file_path):
    """Import weather data from a standard JSON list."""
    if not os.path.exists(file_path):
        print(f"File not found: {file_path}")
        return

    print(f"Importing weather data from {file_path}...")

    # 1. Load the entire JSON file directly
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            data = json.load(f)  # 'data' is now a list [...]
    except json.JSONDecodeError as e:
        print(f"Failed to decode JSON: {e}")
        return

    # 2. Check the data type
    if not isinstance(data, list):
        print(f"Expected a JSON list, but got {type(data)}")
        return

    count = 0
    # 3. Iterate through each item in the list
    for obj in data:
        try:
            # Data processing logic
            raw_ts = obj.get('timestamp')
            dt = datetime.now()

            if raw_ts:
                # Handle ISO format strings (e.g., 2026-02-09T20:49:58...)
                if isinstance(raw_ts, str):
                    # Replace 'Z' with '+00:00' to ensure compatibility with fromisoformat
                    dt = datetime.fromisoformat(raw_ts.replace('Z', '+00:00'))
                elif isinstance(raw_ts, (int, float)):
                    # Handle Unix timestamps
                    if raw_ts > 10000000000:  # Detect milliseconds
                        dt = datetime.fromtimestamp(raw_ts / 1000.0)
                    else:  # Standard seconds
                        dt = datetime.fromtimestamp(raw_ts)

            weather_data = obj.get('weather_data', {})

            weather_current = WeatherCurrent(
                dt=dt,
                temp=weather_data.get('temp'),
                humidity=weather_data.get('humidity'),
                wind_speed=weather_data.get('wind_speed'),
                rain_1h=weather_data.get('rain', 0.0),
                snow_1h=weather_data.get('snow', 0.0),
                # Supplementing remaining fields with None or default values
                feels_like=None,
                pressure=None,
                sunrise=None,
                sunset=None,
                uvi=None,
                weather_id=None,
                wind_gust=None
            )
            session.merge(weather_current)
            count += 1

        except Exception as e:
            print(f"Skipping row data issue: {e}")

    session.commit()
    print(f"🎉 Weather data imported successfully. Total records: {count}")

def main():
    db_uri = dbinfo.URI_2DAY
    print(f"Connecting to database: {dbinfo.DB_HOST} ({dbinfo.DB_NAME_2DAY})")
    
    engine = init_db(db_uri)
    Session = sessionmaker(bind=engine)
    session = Session()

    try:
        # Paths to data files in data/dataset
        stations_file = os.path.join(dataset_dir, 'stations.json')
        bike_file = os.path.join(dataset_dir, 'bike-48h.json')
        weather_file = os.path.join(dataset_dir, 'weather-realtime.json')


        # Now we call ALL of them
        import_stations(session, stations_file)
        import_availability(session, bike_file)
        import_weather(session, weather_file)
        
    except Exception as e:
        print(f"An error occurred: {e}")
        session.rollback()
    finally:
        session.close()

if __name__ == "__main__":
    main()
