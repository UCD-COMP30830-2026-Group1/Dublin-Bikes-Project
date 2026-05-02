# tests/smoke/test_smoke.py
import pytest

@pytest.mark.smoke
class TestSystemSmoke:
    # 1. Basic connectivity test
    def test_app_initialization(self,app):
        """Test that the app initializes correctly."""
        assert app is not None

    def test_db_connection(self,db_session):
        """Test if the database is reachable."""
        from sqlalchemy import text
        result = db_session.execute(text("SELECT 1")).scalar()
        assert result == 1

    # 2. API route smoke test
    # 2.1 Station module api smoke test
    def test_station_realtime_endpoint(self,client):
        """Test the /api/stations/realtime endpoint."""
        response = client.get('/api/stations/realtime')
        assert response.status_code in [200,403]
        assert response.is_json

    def test_station_static_endpoint(self,client):
        """Test the /api/stations/static endpoint."""
        response = client.get('/api/stations/static')
        assert response.status_code == 200
        data = response.get_json()
        assert "data" in data
        assert isinstance(data["data"], list)

    def test_station_live_endpoint(self,client):
        """Test the /api/stations/live endpoint."""
        response = client.get('/api/stations/live')
        assert response.status_code == 200
        assert response.is_json
        data=response.get_json()
        assert "live stations" in data["message"].lower()

    def test_station_historical_endpoint(self,client):
        """Test the /api/stations/historical endpoint."""
        response = client.get('/api/stations/historical?number=42')
        assert response.status_code == 200
        assert response.is_json

    def test_station_predict_endpoint(self, client):
        """Test the /api/stations/predict endpoint."""
        response = client.get('/api/stations/predict')
        # Returning 400 indicates the parameter validator is working correctly.
        assert response.status_code == 400

        response = client.get('/api/stations/predict?number=9999')
        # After the DB fallback mechanism was introduced, an unknown station
        # no longer returns 404. Instead, mock data is used and 200 is returned,
        # allowing the ML model to remain testable in offline environments.
        assert response.status_code == 200

    # 2.2 weather module smoke test
    def test_current_weather_alive(self, client):
        """Test the /api/weather/current endpoint."""
        response = client.get('/api/weather/current')
        assert response.status_code in [200, 404]
        assert response.is_json

    def test_forecast_weather_alive(self, client):
        """Test the /api/weather/forecast endpoint."""
        response = client.get('/api/weather/forecast')
        assert response.status_code in [200, 404]

        if response.status_code == 200:
            data = response.get_json()
            assert "24_hour_forecast" in data.get("data", {})

    # 2.3 Route planning module smoke test
    def test_plan_route_no_payload(self, client):
        """Test whether the validator works properly when no data is transmitted."""
        response = client.post('/api/routes/plan', json={})
        # if return 400, _validate_point is working
        assert response.status_code == 400
        assert "error" in response.get_json()

    def test_plan_route_invalid_coordinates(self, client):
        """Test input non-numeric latitude and longitude"""
        payload = {
            "userLocation": {"lat": "invalid", "lng": -6.26},
            "destinationLocation": {"lat": 53.35, "lng": -6.27},
            "startStation": {"position": {"lat": 53.34, "lng": -6.25}},
            "endStation": {"position": {"lat": 53.33, "lng": -6.24}}
        }
        response = client.post('/api/routes/plan', json=payload)
        assert response.status_code == 400
        assert "must be numeric" in response.get_json().get("error", "")