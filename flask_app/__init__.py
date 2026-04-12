from flask import Flask
from flask_cors import CORS

from common.extensions import cache
from flask_app.routes.station_routes import station_bp
from flask_app.routes.weather_routes import weather_bp


def create_app():
    app = Flask(__name__)
    CORS(app)

    # Inject the app into the cache for initialization.
    cache.init_app(app)

    # Import routes
    app.register_blueprint(weather_bp)

    app.register_blueprint(station_bp)

    return app