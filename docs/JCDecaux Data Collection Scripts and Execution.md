





#### 1. API Key Request



Creat account and request API key 

https://developer.jcdecaux.com/#/account

![image-20260206220940867](/Users/yanggao/Library/Application Support/typora-user-images/image-20260206220940867.png)

API_KEY = ""



---



### 2. Environment Configuration

**Cloud Provider:** Tencent Cloud
 **Server Location:** Germany



3. #### Python Scripts 

##### Configuration File Setup

Create dbinfo.py file (following the L4 instructions )

```

####api 
JCKEY = ''
### bike location 
NAME = 'dublin'
### url
STATIONS_URI = 'https://api.jcdecaux.com/vls/v1/stations'
PARKING_URI = 'url = f"https://api.jcdecaux.com/parking/v1/contracts/{dbinfo.NAME}/parks"'

```

##### Static Station Data Collection

create get-station.py 

fetch static data of dublin exsitng station list 

```
import dbinfo
import requests
import json


### request data 
r = requests.get(dbinfo.STATIONS_URI, params={'apiKey': dbinfo.JCKEY, 'contract': dbinfo.NAME})
data = r.json()

###store data to station file(static data), only request one time 
with open("stations.json", "w", encoding="utf-8") as f:
    json.dump(data, f, ensure_ascii=False, indent=2)

print("Saved to stations.json")


```



stations.json 



![image-20260207103534986](/Users/yanggao/Library/Application Support/typora-user-images/image-20260207103534986.png)





##### Real-Time Station Data Collection

Create get-jcdoux.py 

```
import dbinfo
import requests
import json
import os
import time
import traceback
from datetime import datetime, timezone

## store data to json file 
FILENAME = "station-realtime.json"


def write_to_db(station_obj):
    """
    Append one station snapshot as JSON Lines, with timestamp (UTC).
    """
    record = dict(station_obj)  # avoid mutating original
    ## add a timestap 
    record["timestamp"] = datetime.now(timezone.utc).isoformat()
		### append record to json file 
    with open(FILENAME, "a", encoding="utf-8") as f:
        f.write(json.dumps(record, ensure_ascii=False) + "\n")


def main():
    while True:
        try:
            # Load station list
            with open("stations.json", "r", encoding="utf-8") as f:
                data = json.load(f)

            numbers = [station["number"] for station in data]

            # Fetch each station
            for number in numbers:
                url = f"https://api.jcdecaux.com/vls/v1/stations/{number}"
                params = {
                    "contract": dbinfo.NAME,
                    "apiKey": dbinfo.JCKEY,
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
```



---



#### 3. Common Bash Commands



Check File Size

```
ls -lh station-realtime.jsonl

du -h station-realtime.jsonl
```





View Recent Records

```
tail -n 5 station-realtime.json
```





Run Script in Background with Logging

```
nohup python3 get-jcdecaux.py > jcdecaux.log 2>&1 & echo $! > jcdecaux.pid
```





Verify Script Execution

```
pgrep -af get_jcdecaux.py
```



![image-20260207105550210](/Users/yanggao/Library/Application Support/typora-user-images/image-20260207105550210.png)



Show all onging process

```
ps aux

```





Check if a specific process is running

```
ps aux | grep get-jcdeux
```



![image-20260209085039176](/Users/yanggao/Library/Application Support/typora-user-images/image-20260209085039176.png)