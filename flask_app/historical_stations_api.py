import os
import json
from flask import Blueprint, jsonify, request

"""
historical_api.py

This blueprint handles all endpoints related to historical data for Dublin Bikes:

1. Static Historical Stations List:
   - Endpoint: /api/stations/historical
   - Returns a snapshot of all stations from a local JSON file.
   - This is used for frontend dropdown logic and station metadata.

2. Historical Availability:
   - Endpoint: /api/stations/historical/availability
   - Returns past bike availability for all stations or a specific station.
   - Data is read from a local JSON file.
   - Supports optional filtering by station number.
"""

# Create Blueprint
historical_bp = Blueprint("historical", __name__)

# ------------------------------
# Static Historical Stations List
# ------------------------------
@historical_bp.route("/api/stations/historical", methods=["GET"])
def get_historical_stations():
    """
    Returns a static snapshot of all stations from stations.json.
    """
    try:
        # Build path to stations.json relative to project root
        base_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
        file_path = os.path.join(base_dir, "data", "dataset", "stations.json")

        if not os.path.exists(file_path):
            return jsonify({
                "status": "error",
                "message": "stations.json file not found"
            }), 404

        with open(file_path, "r") as f:
            stations_data = json.load(f)

        return jsonify({
            "status": "success",
            "count": len(stations_data),
            "data": stations_data
        })

    except Exception as e:
        return jsonify({
            "status": "error",
            "message": str(e)
        }), 500

# ------------------------------
# Historical Availability
# ------------------------------

@historical_bp.route("/api/stations/historical/availability", methods=["GET"])
def get_historical_availability():
    """
    Returns historical availability for all stations or a specific station.
    Optional query parameter: station number (station_id) to filter results.
    """
    try:
        # Build file path
        base_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
        file_path = os.path.join(base_dir, "data", "dataset", "historical_availability.json")

        if not os.path.exists(file_path):
            return jsonify({
                "status": "error",
                "message": "historical_availability.json file not found"
            }), 404

        with open(file_path, "r") as f:
            historical_data = json.load(f)  # List of records

        # Optional filtering by station number
        station_number = request.args.get("number")
        if station_number:
            try:
                station_number = int(station_number)
            except ValueError:
                return jsonify({"status": "error", "message": "station number must be an integer"}), 400

            # Filter records for this station
            historical_data = [rec for rec in historical_data if rec.get("station_number") == station_number]

        # Nest data by station
        nested_data = {}
        for rec in historical_data:
            sid = rec["station_number"]
            if sid not in nested_data:
                nested_data[sid] = []
            nested_data[sid].append({
                "timestamp": rec["timestamp"],
                "available_bikes": rec["available_bikes"],
                "available_bike_stands": rec["available_bike_stands"]
            })

        return jsonify({
            "status": "success",
            "stations_count": len(nested_data),
            "data": nested_data
        })

    except Exception as e:
        return jsonify({
            "status": "error",
            "message": str(e)
        }), 500