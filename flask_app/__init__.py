from flask import Flask

def create_app():
    app = Flask(__name__)

    # Import Realtime Blueprint route
    from .realtime_api_stations import realtime_bp
    app.register_blueprint(realtime_bp)

    # Import Historical Blueprint route
    from .historical_stations_api import historical_bp
    app.register_blueprint(historical_bp)

    return app