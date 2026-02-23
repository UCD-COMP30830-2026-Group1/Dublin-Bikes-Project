from flask import Flask

def create_app():
    app = Flask(__name__)

    # Import routes
    from .realtime_api_stations import realtime_bp
    app.register_blueprint(realtime_bp)

    return app