from flask import Flask

from flask_app.routes.station_routes import realtime_bp
from flask_app.routes.weather_routes import weather_bp


def create_app():
    app = Flask(__name__)

    # Import routes
    app.register_blueprint(realtime_bp)

    app.register_blueprint(weather_bp)

    return app