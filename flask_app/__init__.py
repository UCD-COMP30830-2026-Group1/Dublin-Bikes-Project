from flask import Flask
from flask_cors import CORS
from dotenv import load_dotenv

from common.extensions import cache
from flask_app.routes.station_routes import station_bp
from flask_app.routes.weather_routes import weather_bp
from flask_app.routes.route_planning import route_planning_bp

load_dotenv()

def create_app():
    app = Flask(__name__)
    CORS(app)

    # Inject the app into the cache for initialization.
    cache.init_app(app)

    # Import routes
    app.register_blueprint(weather_bp)
    app.register_blueprint(station_bp)
    app.register_blueprint(route_planning_bp)

    return app