import pytest
from unittest.mock import patch, MagicMock
from common.extensions import cache
import requests


class TestStationUnit:
    """
    Station module Unit Tests
    """
    # 1. /realtime route
    @patch('flask_app.routes.station_routes.requests.get')
    def test_realtime_success_mock(self, mock_get, client):
        """realtime endpoint happy path:JCDecaux API returns successfully"""
        with client.application.app_context():
            cache.clear()

        # 1. arrange
        mock_response = MagicMock()
        mock_response.json.return_value = [{"number": 1, "name": "Station A"}, {"number": 2, "name": "Station B"}]
        mock_response.raise_for_status.return_value = None
        mock_get.return_value = mock_response

        # 2. act
        response = client.get('/api/stations/realtime')
        data = response.get_json()

        # 3. assert
        assert response.status_code == 200,data
        assert len(data["data"]) == 2
        assert data["data"][0]["name"] == "Station A"
        #verify
        mock_get.assert_called_once()

    @patch('flask_app.routes.station_routes.requests.get')
    def test_realtime_network_failure(self, mock_get, client):
        """realtime endpoint sad path:JCDecaux API fail to retrieve data"""
        with client.application.app_context():
            cache.clear()
        # 1. arrange
        mock_get.side_effect = requests.exceptions.Timeout("Connection timed out")

        # 2. act
        response = client.get('/api/stations/realtime')
        data = response.get_json()

        # 3. assert
        assert data.get("message") == "Connection timed out"

    # 2. /historical route
    def test_historical_invalid_number_type(self, client):
        """
        Defensive test: Verify ValueError capture when int() conversion fails.
        """
        response = client.get('/api/stations/historical?number=not_a_number')

        assert response.status_code == 400
        data = response.get_json()
        assert "must be an integer" in data["message"].lower()

    @patch('flask_app.routes.station_routes.SessionLocal')
    def test_historical_with_valid_number(self, mock_session_maker, client):
        """
        When a valid number is passed in, check whether the query filter is
        called correctly and whether the data is assembled correctly.
        """

        with client.application.app_context():
            cache.clear()
        # 1. arrange
        mock_record = MagicMock()
        mock_record.number = 42
        mock_record.last_update.isoformat.return_value = "2026-04-01T12:00:00"
        mock_record.available_bikes = 10
        mock_record.available_bike_stands = 5
        mock_record.status = "OPEN"

        mock_session = MagicMock()
        # Simulate chained calls: query().filter().order_by().limit().all()
        mock_query = mock_session.query.return_value
        mock_query.filter.return_value.order_by.return_value.limit.return_value.all.return_value = [mock_record]
        mock_session_maker.return_value = mock_session

        # 2. act
        response = client.get('/api/stations/historical?number=42')

        # 3. assert
        assert response.status_code == 200,response.get_json()
        data = response.get_json()["data"]

        # validate nested_data[sid]
        assert "42" in data
        assert data["42"][0]["available_bikes"] == 10
        assert data["42"][0]["timestamp"] == "2026-04-01T12:00:00"

    # 3./static route
    @patch('flask_app.routes.station_routes.SessionLocal')
    def test_static_data_mapping(self, mock_session_maker, client):
        """
        Ensure that the ORM object is correctly mapped to a JSON dictionary.
        """

        # 1. Arrange: Mocking the ORM objects
        mock_station = MagicMock()
        mock_station.number = 42
        mock_station.name = "UCD"
        mock_station.address = "Dublin Campus"
        mock_station.banking = "Yes"
        mock_station.bike_stands = 20
        mock_station.position_lat = 53.3
        mock_station.position_lng = -6.2

        mock_session = MagicMock()
        mock_session.query.return_value.all.return_value = [mock_station]
        mock_session_maker.return_value = mock_session

        # 2. act
        response = client.get('/api/stations/static')

        # 3. assert
        assert response.status_code == 200
        data = response.get_json()["data"]
        assert len(data) == 1
        assert data[0]["number"] == 42
        assert data[0]["name"] == "UCD"

    # 4. /predict route: ML model dependency isolation and parameter testing
    def test_predict_missing_number(self, client):
        """Defensive test: Completely omit the number parameter"""
        response = client.get('/api/stations/predict')

        assert response.status_code == 400
        assert "missing required query param" in response.get_json()["message"].lower()

    def test_predict_invalid_number(self, client):
        """Defensive test: A number that cannot be converted to an integer was passed."""
        response = client.get('/api/stations/predict?number=xyz')

        assert response.status_code == 400
        assert "must be an integer" in response.get_json()["message"].lower()

    @patch('flask_app.routes.station_routes._model', None)
    def test_predict_model_not_loaded(self, client):
        """
        Simulate a disaster scenario where `model.pkl` cannot be found on the server.
        """
        response = client.get('/api/stations/predict?number=42')

        assert response.status_code == 503
        data = response.get_json()
        assert "ml model not found" in data["message"].lower()

    # 5. /live route：validate O(N) space/time complexity
    @patch('flask_app.routes.station_routes.SessionLocal')
    def test_live_stations_empty_db(self, mock_session_maker, client):
        """
        Test extreme cases: Test whether a KeyError or NullPointer error will be reported when the database is empty.
        """
        with client.application.app_context():
            cache.clear()
        # 1. Arrange a mock database session so that all its queries return an empty list.
        mock_session = MagicMock()
        mock_session.query.return_value.all.return_value = []
        mock_session.query.return_value.filter.return_value.order_by.return_value.all.return_value = []
        mock_session_maker.return_value = mock_session

        response = client.get('/api/stations/live')

        assert response.status_code == 200
        data = response.get_json()
        # Even if the database is empty, it should safely return [] instead of throwing a 500 error.
        assert data["data"] == []


    @patch('flask_app.routes.station_routes.SessionLocal')
    def test_live_perfect_match(self, mock_session_maker, client):
        """Station and real-time data are a perfect match (Happy Path)"""
        with client.application.app_context():
            cache.clear()
        # 1. Arrange mock object
        mock_station = MagicMock()
        mock_station.number = 42
        mock_station.name = "UCD"
        mock_station.address = "Dublin Campus"
        mock_station.banking = "Yes"
        mock_station.bike_stands = 20
        mock_station.position_lat = 53.3
        mock_station.position_lng = -6.2

        mock_avail = MagicMock()
        mock_avail.number = 42
        mock_avail.available_bikes = 15
        mock_avail.available_bike_stands = 5
        mock_avail.status = "OPEN"
        mock_avail.last_update.isoformat.return_value = "2026-04-19T10:00:00"

        # 2. Utilize side_effect to dynamically intercept queries
        def mock_query_behavior(model_class):
            query_mock = MagicMock()
            from common.models import Station, Availability
            if model_class == Station:
                query_mock.all.return_value = [mock_station]
            elif model_class == Availability:
                query_mock.filter.return_value.order_by.return_value.all.return_value = [mock_avail]
            return query_mock

        mock_session = MagicMock()
        mock_session.query.side_effect = mock_query_behavior
        mock_session_maker.return_value = mock_session

        # 3. Act
        response = client.get('/api/stations/live')
        data = response.get_json()["data"]

        # 4. Assert
        assert response.status_code == 200,response.get_json()
        assert len(data) == 1
        assert data[0]["number"] == 42
        assert data[0]["name"] == "UCD"
        assert data[0]["available_bikes"] == 15

    @patch('flask_app.routes.station_routes.SessionLocal')
    def test_live_missing_availability(self, mock_session_maker, client):
        """ Defensive test: if the site exists, but the scraper hasn't found any data in the past 15 minutes"""
        with client.application.app_context():
            cache.clear()

        mock_station = MagicMock()
        mock_station.number = 99
        mock_station.name = "Ghost Station"
        mock_station.address = "Unknown Address"
        mock_station.banking = "No"
        mock_station.bike_stands = 0
        mock_station.position_lat = 53.0
        mock_station.position_lng = -6.0

        def mock_query_behavior(model_class):
            query_mock = MagicMock()
            from common.models import Station, Availability
            if model_class == Station:
                query_mock.all.return_value = [mock_station]
            elif model_class == Availability:
                # Simulates a scraper failure and returns an empty list.
                query_mock.filter.return_value.order_by.return_value.all.return_value = []
            return query_mock

        mock_session = MagicMock()
        mock_session.query.side_effect = mock_query_behavior
        mock_session_maker.return_value = mock_session

        response = client.get('/api/stations/live')
        data = response.get_json()["data"]

        assert response.status_code == 200,response.get_json()
        assert len(data) == 1
        assert data[0]["number"] == 99
        assert data[0]["available_bikes"] is None
        assert data[0]["status"] == "UNKNOWN"


