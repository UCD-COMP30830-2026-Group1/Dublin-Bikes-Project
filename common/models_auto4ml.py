# model_auto4ml.py
from sqlalchemy import Integer, Column, String, Float, BigInteger, create_engine, DateTime
from sqlalchemy.orm import declarative_base

Base = declarative_base()

# 1.Static station table -- fetch 1 time
class Station(Base):
    __tablename__ = 'station'
    number = Column(Integer,primary_key=True)
    address = Column(String(128))
    banking = Column(Integer)
    bike_stands = Column(Integer)
    name = Column(String(128))
    position_lat = Column(Float)
    position_lng = Column(Float)

# 2.Dynamic bikes availability table -- fetch every 5 mins
class Availability(Base):
    __tablename__ = 'availability'
    # Composite primary key: Ensures that there is only one record for the same site at any given time.
    number = Column(Integer,primary_key=True)
    last_update = Column(DateTime, primary_key=True)
    available_bikes = Column(Integer)
    available_bike_stands = Column(Integer)
    status = Column(String(128))

# 3. Real-time weather forecast (saves every hour)
class WeatherCurrent(Base):
    __tablename__='weather_current'
    dt = Column(DateTime,primary_key=True)
    feels_like = Column(Float)
    humidity = Column(Integer)
    pressure = Column(Integer)
    sunrise = Column(DateTime)
    sunset = Column(DateTime)
    temp = Column(Float)
    uvi = Column(Float)
    weather_id = Column(Integer)
    wind_gust = Column(Float)
    wind_speed = Column(Float)
    rain_1h = Column(Float)
    snow_1h = Column(Float)

# 4. Hourly Forecast
class WeatherHourly(Base):
    __tablename__='weather_hourly'
    dt = Column(DateTime,primary_key=True)
    future_dt = Column(DateTime,primary_key=True)
    feels_like = Column(Float)
    humidity = Column(Integer)
    pop = Column(Float)
    pressure = Column(Integer)
    temp = Column(Float)
    uvi = Column(Float)
    weather_id = Column(Integer)
    wind_speed = Column(Float)
    wind_gust = Column(Float)
    rain_1h = Column(Float)
    snow_1h = Column(Float)


# 5. Daily Forecast
class WeatherDaily(Base):
    __tablename__ = 'weather_daily'
    dt = Column(DateTime,primary_key = True)
    future_dt = Column(DateTime,primary_key = True)
    humidity = Column(Integer)
    pop = Column(Float)
    pressure = Column(Integer)
    temp_max = Column(Float)
    temp_min = Column(Float)
    uvi = Column(Float)
    weather_id = Column(Integer)
    wind_speed = Column(Float)
    wind_gust = Column(Float)
    rain = Column(Float)
    snow = Column(Float)

def init_db(db_uri):
    """
        Initializes the database schema based on the defined ORM models.
    """
    # 1. Establish the connection 'bridge' to the database
    engine = create_engine(db_uri)
    # 2. Automatically create all tables defined in the 'Base' metadata
    # It won't overwrite existing data or recreate tables if they exist.
    Base.metadata.create_all(engine)
    return engine

if __name__=="__main__":
    import sys
    import os

    current_path = os.path.abspath(__file__)
    common_dir = os.path.dirname(current_path)
    root_dir = os.path.dirname(common_dir)
    sys.path.append(root_dir)
    import dbinfo

    # Initialize the Machine Learning database
    try:
        engine1 = init_db(dbinfo.URI_ML)

    except Exception as e:
        print(f"ML database initialization failed: {e}")

    # Initialize the 2-day database
    try:
        engine2 = init_db(dbinfo.URI_2DAY)

    except Exception as e:
        print(f"2-day database initialization failed: {e}")

