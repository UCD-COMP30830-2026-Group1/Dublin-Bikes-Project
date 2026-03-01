import os
import json
from flask import Blueprint, jsonify

# Create Blueprint
historical_bp = Blueprint("historical", __name__)

@historical_bp.route("/api/stations/historical", methods=["GET"])
def get_historical_stations():
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