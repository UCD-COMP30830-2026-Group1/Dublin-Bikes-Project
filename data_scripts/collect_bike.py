from data_scripts.settings import dbconfig
import requests
import json
import os
import time
import traceback
from datetime import datetime, timezone

FILENAME = "station-realtime.json"


def write_to_db(station_obj):
    """
    Append one station snapshot as JSON Lines, with timestamp (UTC).
    """
    record = dict(station_obj)  # avoid mutating original
    record["timestamp"] = datetime.now(timezone.utc).isoformat()

    with open(FILENAME, "a", encoding="utf-8") as f:
        f.write(json.dumps(record, ensure_ascii=False) + "\n")


def main():
    while True:
        try:
            # Load station list
            with open("data_scripts/reference_data/stations.json", "r", encoding="utf-8") as f:
                data = json.load(f)

            numbers = [station["number"] for station in data]

            # Fetch each station
            for number in numbers:
                url = f"https://api.jcdecaux.com/vls/v1/stations/{number}"
                params = {
                    "contract": dbconfig.NAME,
                    "apiKey": dbconfig.JCKEY,
                }

                r = requests.get(url, params=params, timeout=30)
                r.raise_for_status()

                write_to_db(r.json())

                # small delay
                time.sleep(2)

            # wait 5 minutes after one full cycle
            time.sleep(5 * 60)

        except Exception:
            # log error but keep process alive
            print(traceback.format_exc())
            time.sleep(30)


if __name__ == "__main__":
    main()