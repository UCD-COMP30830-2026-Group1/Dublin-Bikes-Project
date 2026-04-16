import os
import sys
sys.path.append(os.path.dirname(os.path.abspath(__file__)))
import pandas as pd
from sqlalchemy import create_engine
import dbinfo
from common.models import init_db

# Define the directory where the CSV files are located
csv_dir = "data/dataset/ml_training_data/"

print("Initializing database tables...")
engine = init_db(dbinfo.URI_ML)

print("Loading availability.csv...")
pd.read_csv(csv_dir + 'availability.csv').to_sql('availability', engine, if_exists='append', index=False)

print("Loading weather_current.csv...")
pd.read_csv(csv_dir + 'weather_current.csv').to_sql('weather_current', engine, if_exists='append', index=False)

print("Loading weather_daily.csv...")
pd.read_csv(csv_dir + 'weather_daily.csv').to_sql('weather_daily', engine, if_exists='append', index=False)

print("Loading weather_hourly.csv...")
pd.read_csv(csv_dir + 'weather_hourly.csv').to_sql('weather_hourly', engine, if_exists='append', index=False)

print(" All CSV data successfully loaded into MySQL!")