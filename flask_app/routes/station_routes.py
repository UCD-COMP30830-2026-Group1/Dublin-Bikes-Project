import requests
from flask import Blueprint,request
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

import dbinfo
from common.api_response import ApiResponse

from common.models import Station,Availability

# Create a Blueprint for the realtime API
station_bp = Blueprint('station', __name__,url_prefix="/api/stations")

@station_bp.route('/realtime')
def get_realtime_stations():
    try:
        url = "https://api.jcdecaux.com/vls/v1/stations"

        params = {
            "contract": dbinfo.NAME,
            "apiKey": dbinfo.JCKEY,
        }

        response = requests.get(url, params=params, timeout=30)
        response.raise_for_status()
        stations_data = response.json()

        return ApiResponse.ok(data=stations_data, message=f"Successfully fetched {len(stations_data)} stations.")

    except requests.exceptions.RequestException as e:
        return ApiResponse.error(message=str(e))


engine = create_engine(dbinfo.URI_ML)
Session = sessionmaker(bind=engine)

@station_bp.route('/static',methods=["GET"])
def get_static_stations():
    session = Session()
    try:
        stations = session.query(Station).all()
        station_list = []
        for s in stations:
            station_list.append({
                'number' : s.name,
                'address' :s.address,
                'banking' :s.banking,
                'bike_stands' : s.bike_stands,
                'name' : s.name,
                'position_lat' : s.position_lat,
                'position_lng' : s.position_lng,
            })
        return ApiResponse.ok(data=station_list, message=f"Successfully fetched {len(station_list)} stations.")
    except Exception as e:
        return ApiResponse.error(message=str(e))
    finally:
        session.close()

#Developed by Youssef Bouadara
@station_bp.route('/historical', methods=["GET"])
def get_historical_availability():
    session = Session()
    try:
        station_number = request.args.get("number")
        query = session.query(Availability)

        if station_number:
            try:
                station_number = int(station_number)
                # Filter records for this station
                query = query.filter(Availability.number==station_number)
            except ValueError:
                return ApiResponse.error("station number must be an integer", 400)

        results = query.order_by(Availability.last_update.desc()).limit(300).all()

        # Nest data by station
        nested_data = {}
        for rec in results:
            sid = rec.number
            if sid not in nested_data:
                nested_data[sid] = []
            nested_data[sid].append({
                "timestamp": rec.last_update.isoformat(),
                "available_bikes": rec.available_bikes,
                "available_bike_stands": rec.available_bike_stands,
                "status":rec.status
            })
        return ApiResponse.ok(data=nested_data,message=f"Historical data fetched for {len(nested_data)} stations.")
    except Exception as e:
        return ApiResponse.error(message=f"RDS query error: {str(e)}")
    finally:
        session.close()

