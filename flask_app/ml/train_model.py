import os
import sys
import joblib
import logging
import pandas as pd
from datetime import datetime
from sklearn.ensemble import RandomForestRegressor

# ── Path Setup (Ensures Python can find feature_engineering.py) ──
current_dir = os.path.dirname(os.path.abspath(__file__))   # flask_app/ml/
flask_dir   = os.path.dirname(current_dir)                  # flask_app/
root_dir    = os.path.dirname(flask_dir)                    # project root
sys.path.append(root_dir)
sys.path.append(current_dir)

# ── Import Shared Features ──
from feature_engineering import build_features, FEATURE_COLUMNS, TARGET_COLUMN

# ── Configuration & Logging Setup ──
logging.basicConfig(level=logging.INFO, format="%(asctime)s  %(message)s")
log = logging.getLogger(__name__) # <--- This fixes your NameError!

MODEL_PATH = os.path.join(current_dir, "model.pkl")


def load_from_csv(folder_path: str) -> pd.DataFrame:
    """
    Simulates the DB join by merging availability.csv and weather_hourly.csv
    """
    log.info(f"Loading and merging CSVs from: {folder_path}")
    
    # 1. Load the core files
    avail = pd.read_csv(os.path.join(folder_path, 'availability.csv'))
    weather = pd.read_csv(os.path.join(folder_path, 'weather_hourly.csv'))
    
    # 2. Convert Timestamps
    avail['last_update'] = pd.to_datetime(avail['last_update'])
    weather['dt'] = pd.to_datetime(weather['dt'], unit='s', errors='coerce')

    # 3. Perform the "Virtual Join"
    log.info("Aligning bike data with weather timestamps...")
    df = pd.merge_asof(
        avail.sort_values('last_update'),
        weather.sort_values('dt'),
        left_on='last_update',
        right_on='dt',
        direction='backward'
    )

    # 4. Handle Missing Columns & Fill Gaps
    df = df.rename(columns={
        "temp_max": "temp", 
    })
    
    # Carry forward the last known weather
    df = df.sort_values('last_update').ffill().fillna(0)

    # 5. Final Column Selection
    if 'bike_stands' not in df.columns and 'available_bike_stands' in df.columns:
        df['bike_stands'] = df['available_bikes'] + df['available_bike_stands']

    log.info(f"Merged result: {len(df):,} rows ready for feature engineering.")
    
    return df[["number", "last_update", "available_bikes",
               "bike_stands", "temp", "humidity",
               "wind_speed", "rain_1h"]]


def train_local_model():
    """
    Orchestrates the local training flow: 
    Load Folder -> Merge CSVs -> Build Features -> Train & Save.
    """
    # 1. Path to 4 CSVs (Running from root directory)
    data_path = "data/dataset/ml_training_data/"
    
    # 2. Load the raw merged dataframe from the folder
    raw_df = load_from_csv(data_path) 
    
    # 3. Transform raw data into ML features (hour, day_of_week, etc.)
    log.info("Transforming raw data into model features...")
    processed_df = build_features(raw_df)
    
    # 4. Drop any rows with missing required columns
    processed_df = processed_df.dropna(subset=FEATURE_COLUMNS + [TARGET_COLUMN])
    
    # 5. Define X (features) and y (target)
    X = processed_df[FEATURE_COLUMNS]
    y = processed_df[TARGET_COLUMN]
    
    log.info(f"Training RandomForest model on {len(X):,} rows. This might take a minute...")
    
    # 6. Initialize and Fit
    model = RandomForestRegressor(
        n_estimators=100, 
        max_depth=12,      
        random_state=42, 
        n_jobs=-1          
    )
    model.fit(X, y)
    
    # 7. Save the model
    joblib.dump(model, MODEL_PATH)
    log.info(f"Model saved successfully to: {MODEL_PATH}")


if __name__ == "__main__":
    train_local_model()