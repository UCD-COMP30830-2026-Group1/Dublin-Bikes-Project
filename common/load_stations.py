import pandas as pd
from sqlalchemy import create_engine
import dbinfo
import json

print("Connecting to database...")
engine = create_engine(dbinfo.URI_ML)

print("Reading stations.json...")
with open('data/dataset/stations.json', 'r') as f:
    data = json.load(f)

records = []
for row in data:
    records.append({
        'number': row.get('number'),
        'name': row.get('name'),
        'address': row.get('address'),
        'banking': int(row.get('banking', 0)),
        'bike_stands': row.get('bike_stands'),
        # Flatten the nested position dictionary into lat/lng floats
        'position_lat': row.get('position', {}).get('lat') if isinstance(row.get('position'), dict) else None,
        'position_lng': row.get('position', {}).get('lng') if isinstance(row.get('position'), dict) else None
    })

df = pd.DataFrame(records)
df.to_sql('station', engine, if_exists='replace', index=False)
print(f" Loaded {len(df)} stations successfully!")