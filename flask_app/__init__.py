from flask import Flask

from flask_app.routes.station_routes import station_bp
from flask_app.routes.weather_routes import weather_bp


def create_app():
    app = Flask(__name__)

    # Import routes
    app.register_blueprint(weather_bp)

    app.register_blueprint(station_bp)

    return app