from flask import jsonify, Blueprint
import requests
from datetime import datetime, timezone
from data_scripts.settings import dbconfig


# Create a Blueprint for the realtime API
realtime_bp = Blueprint('realtime', __name__)

@realtime_bp.route('/api/stations/realtime')
def get_realtime_stations():
    try:
        url = "https://api.jcdecaux.com/vls/v1/stations"

        params = {
            "contract": dbconfig.NAME,
            "apiKey": dbconfig.JCKEY,
        }

        response = requests.get(url, params=params, timeout=30)
        response.raise_for_status()
        stations_data = response.json()

        snapshot = {
            "timestamp": datetime.now(timezone.utc).isoformat(),
            "status": "success",
            "count": len(stations_data),
            "data": stations_data
        }

        return jsonify(snapshot)

    except requests.exceptions.RequestException as e:
        return jsonify({
            "status": "error",
            "message": str(e)
        }), 500