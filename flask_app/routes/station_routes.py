import requests
from flask import Blueprint,request
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from collections import defaultdict
import dbinfo
from common.api_response import ApiResponse
from common.models import Station,Availability

# Create a Blueprint for the realtime API
station_bp = Blueprint('station', __name__,url_prefix="/api/stations")

engine = create_engine(dbinfo.URI_ML)
Session = sessionmaker(bind=engine)

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



@station_bp.route('/static',methods=["GET"])
def get_static_stations():
    session = Session()
    try:
        stations = session.query(Station).all()
        latest_availability_rows = (
            session.query(Availability)
            .order_by(Availability.number.asc(), Availability.last_update.desc())
            .all()
        )

        latest_map = {}
        for row in latest_availability_rows:
            if row.number not in latest_map:
                latest_map[row.number] = row

        station_list = []
        for s in stations:
            latest = latest_map.get(s.number)

            station_list.append({
                'number': s.number,
                'address': s.address,
                'banking': s.banking,
                'bike_stands': s.bike_stands,
                'name': s.name,
                'position_lat': s.position_lat,
                'position_lng': s.position_lng,
                'available_bikes': latest.available_bikes if latest else 0,
                'available_bike_stands': latest.available_bike_stands if latest else s.bike_stands,
                'status': latest.status if latest else 'UNKNOWN',
                'last_update': latest.last_update.isoformat() if latest else None,
            })

        return ApiResponse.ok(
            data=station_list,
            message=f"Successfully fetched {len(station_list)} stations."
        )
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
        nested_data = defaultdict(list)
        for rec in results:
            nested_data[rec.number].append({
                "timestamp": rec.last_update.isoformat(),
                "available_bikes": rec.available_bikes,
                "available_bike_stands": rec.available_bike_stands,
                "status": rec.status
            })

        return ApiResponse.ok(
            data=nested_data if not station_number else nested_data.get(station_number, []),
            message="Historical data fetched successfully."
        )

    except Exception as e:
        return ApiResponse.error(message=f"RDS query error: {str(e)}")
    finally:
        session.close()

@station_bp.route('/detail/<int:station_number>', methods=["GET"])
def get_station_detail(station_number):
    """
    Station detail 页面专用接口：
    - 基本信息
    - 当前 bikes/docks
    - hourly pattern
    - daily pattern
    - usage insights
    """
    session = Session()
    try:
        station = session.query(Station).filter(Station.number == station_number).first()
        if not station:
            return ApiResponse.error(message="Station not found", code=404)

        records = (
            session.query(Availability)
            .filter(Availability.number == station_number)
            .order_by(Availability.last_update.asc())
            .limit(300)
            .all()
        )

        if not records:
            return ApiResponse.error(message="No availability data found", code=404)

        latest = records[-1]

        hourly_groups = defaultdict(list)
        weekday_groups = defaultdict(list)

        for rec in records:
            hour_label = rec.last_update.strftime('%H:00')
            weekday_label = rec.last_update.strftime('%a')

            hourly_groups[hour_label].append(rec)
            weekday_groups[weekday_label].append(rec)

        hourly_pattern = []
        for hour in range(24):
            label = f"{hour:02d}:00"
            rows = hourly_groups.get(label, [])
            if rows:
                avg_bikes = round(sum(r.available_bikes for r in rows) / len(rows), 1)
                avg_docks = round(sum(r.available_bike_stands for r in rows) / len(rows), 1)
            else:
                avg_bikes = 0
                avg_docks = 0
            hourly_pattern.append({
                "label": label,
                "bikes": avg_bikes,
                "docks": avg_docks
            })

        weekday_order = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
        daily_pattern = []
        for label in weekday_order:
            rows = weekday_groups.get(label, [])
            if rows:
                avg_bikes = round(sum(r.available_bikes for r in rows) / len(rows), 1)
                avg_docks = round(sum(r.available_bike_stands for r in rows) / len(rows), 1)
            else:
                avg_bikes = 0
                avg_docks = 0
            daily_pattern.append({
                "label": label,
                "bikes": avg_bikes,
                "docks": avg_docks
            })

        best_hours = sorted(hourly_pattern, key=lambda x: x["bikes"], reverse=True)[:3]
        peak_hours = [item["label"] for item in best_hours if item["bikes"] > 0]

        avg_turnover = round(
            sum(abs(records[i].available_bikes - records[i - 1].available_bikes) for i in range(1, len(records)))
            / max(len(records) - 1, 1),
            1
        )

        response = {
            "station": {
                "number": station.number,
                "name": station.name,
                "address": station.address,
                "bike_stands": station.bike_stands,
                "available_bikes": latest.available_bikes,
                "available_bike_stands": latest.available_bike_stands,
                "status": latest.status,
                "last_update": latest.last_update.isoformat()
            },
            "hourly_pattern": hourly_pattern,
            "daily_pattern": daily_pattern,
            "insights": {
                "peak_hours": ", ".join(peak_hours[:2]) if peak_hours else "No data",
                "best_time": ", ".join(peak_hours[:2]) if peak_hours else "No data",
                "average_turnover": avg_turnover
            }
        }

        return ApiResponse.ok(data=response, message="Station detail fetched successfully.")
    except Exception as e:
        return ApiResponse.error(message=str(e))
    finally:
        session.close()