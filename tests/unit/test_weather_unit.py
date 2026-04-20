# tests/unit/test_weather_unit.py
from unittest.mock import patch, MagicMock

class TestWeatherUnit:
# 1. Test /api/weather/current endpoint
    @patch('flask_app.routes.weather_routes.SessionLocal')
    def test_current_weather_success(self, mock_session_maker, client):
        """Happy Path: Real-time weather data exists in the DB, successfully retrieved and formatted."""

        # 1. Clear the cache completely to prevent state bleeding between tests
        with client.application.app_context():
            from common.extensions import cache
            cache.clear()

        # 2. Arrange: Construct a Mock object with all necessary attributes to prevent JSON serialization errors
        mock_current = MagicMock()
        mock_current.dt.isoformat.return_value = "2026-04-19T10:00:00"
        mock_current.temp = 10.5
        mock_current.humidity = 82
        mock_current.wind_speed = 4.2
        mock_current.rain_1h = 0.0
        mock_current.snow_1h = 0.0

        mock_session = MagicMock()
        # Simulate chained calls: query().order_by().first()
        mock_session.query.return_value.order_by.return_value.first.return_value = mock_current
        mock_session_maker.return_value = mock_session

        # 3. Act
        response = client.get('/api/weather/current')

        # 4. Assert
        assert response.status_code == 200, response.get_json()
        data = response.get_json()

        # Validate the custom ApiResponse structure
        assert "weather_data" in data["data"]
        assert data["data"]["weather_data"]["temp"] == 10.5
        assert data["data"]["location"]["city"] == "Dublin"

    @patch('flask_app.routes.weather_routes.SessionLocal')
    def test_current_weather_empty_db(self, mock_session_maker, client):
        """Sad Path: Database is empty (e.g., scraper just deployed, no data yet)."""
        with client.application.app_context():
            from common.extensions import cache
            cache.clear()

        mock_session = MagicMock()
        mock_session.query.return_value.order_by.return_value.first.return_value = None
        mock_session_maker.return_value = mock_session

        response = client.get('/api/weather/current')

        # Logical check: Ensure it returns a 404 gracefully rather than crashing
        assert response.status_code == 404
        assert "No current weather data" in response.get_json()["message"]

# class TestWeatherForecastEndpoint:
    # 2. Test /api/weather/forecast endpoint
    @patch('flask_app.routes.weather_routes.SessionLocal')
    def test_forecast_weather_success(self, mock_session_maker, client):
        """Happy Path: Successfully retrieve the 24-hour weather forecast."""
        with client.application.app_context():
            from common.extensions import cache
            cache.clear()

        # Arrange: Construct 1 future forecast record (representing the 24 records)
        mock_hour = MagicMock()
        mock_hour.dt.isoformat.return_value = "2026-04-19T12:00:00"
        mock_hour.temp = 12.0
        mock_hour.humidity = 75
        mock_hour.wind_speed = 5.0
        mock_hour.rain_1h = 0.5
        mock_hour.snow_1h = 0.0

        mock_session = MagicMock()
        # Simulate the long chained call: query().filter().order_by().limit().all()
        # Logical highlight: The Mock bypasses the filter(dt >= now) logic and directly returns the mocked list.
        mock_query = mock_session.query.return_value
        mock_query.filter.return_value.order_by.return_value.limit.return_value.all.return_value = [mock_hour]
        mock_session_maker.return_value = mock_session

        # Act
        response = client.get('/api/weather/forecast')

        # Assert
        assert response.status_code == 200, response.get_json()
        data = response.get_json()

        assert "24_hour_forecast" in data["data"]
        forecast_list = data["data"]["24_hour_forecast"]
        assert len(forecast_list) == 1
        assert forecast_list[0]["temp"] == 12.0
        assert forecast_list[0]["rain"] == 0.5

    @patch('flask_app.routes.weather_routes.SessionLocal')
    def test_forecast_weather_empty_db(self, mock_session_maker, client):
        """Sad Path: No forecast data in DB (or all data is expired and caught by the filter)."""
        with client.application.app_context():
            from common.extensions import cache
            cache.clear()

        mock_session = MagicMock()
        mock_session.query.return_value.filter.return_value.order_by.return_value.limit.return_value.all.return_value = []
        mock_session_maker.return_value = mock_session

        response = client.get('/api/weather/forecast')

        assert response.status_code == 404
        assert "No forecast data" in response.get_json()["message"]

    # Exception Handling Defense Tests
    @patch('flask_app.routes.weather_routes.SessionLocal')
    def test_database_crash(self, mock_session_maker, client):
        """Verify that the 'except Exception as e:' block can catch underlying system crashes."""
        with client.application.app_context():
            from common.extensions import cache
            cache.clear()

        # Simulate a severe database disconnection error
        mock_session = MagicMock()
        mock_session.query.side_effect = Exception("OperationalError: Lost connection to MySQL server")
        mock_session_maker.return_value = mock_session

        response = client.get('/api/weather/current')

        # Without try/except, this would crash with a 500 Internal Server Error.
        # Since it is caught and wrapped in ApiResponse, it will gracefully return an error message.
        data = response.get_json()
        assert "Database query error" in data["message"]