# tests/unit/test_ml_predict.py
# Run: pytest tests/unit/test_ml_predict.py -v

import pytest
from unittest.mock import patch, MagicMock
from datetime import datetime

class TestPredictEndpoint:

    def _station(self,number=42, bike_stands=30):
        s = MagicMock(); s.number = number
        s.bike_stands = bike_stands
        return s

    def _avail(self,available_bikes=15):
        a = MagicMock()
        a.available_bikes = available_bikes
        a.available_bike_stands = 10
        a.last_update = datetime(2024, 12, 15, 9, 0, 0)
        return a

    def _weather(self,temp=12.0, humidity=75.0):
        w = MagicMock()
        w.temp = temp
        w.humidity = humidity
        w.pressure = 1010
        w.wind_speed = 4.0
        w.rain_1h = 0.0
        w.dt = datetime(2024, 12, 15, 9, 0, 0); return w


    def _mock_estimator(self,prediction=12.0):
        e = MagicMock(); e.predict.return_value = [prediction]; return e

    def test_predict_returns_200(self,client):
        with patch("flask_app.routes.station_routes._model") as mock_model, \
             patch("flask_app.routes.station_routes.SessionLocal") as MockSession:
            mock_model.estimators_ = [self._mock_estimator(12.0)] * 10
            s = MockSession.return_value
            # Station query: filter_by().first()
            s.query.return_value.filter_by.return_value.first.return_value = self._station()
            # Availability query: filter_by().order_by().first()
            s.query.return_value.filter_by.return_value.order_by.return_value.first.return_value = self._avail()
            # Weather query: order_by().first()
            s.query.return_value.order_by.return_value.first.return_value = self._weather()

            res = client.get("/api/stations/predict?number=42")
        assert res.status_code == 200, res.get_json()
        data = res.get_json()
        assert data["code"] == 200
        assert "predicted_bikes" in data["data"]
        assert "confidence" in data["data"]
        assert data["data"]["horizon_minutes"] == 30


    def test_predicted_bikes_in_valid_range(self,client):
        with patch("flask_app.routes.station_routes._model") as mock_model, \
             patch("flask_app.routes.station_routes.SessionLocal") as MockSession:
            mock_model.estimators_ = [self._mock_estimator(8.0)] * 10
            s = MockSession.return_value
            # Station query: filter_by().first()
            s.query.return_value.filter_by.return_value.first.return_value = self._station()
            # Availability query: filter_by().order_by().first()
            s.query.return_value.filter_by.return_value.order_by.return_value.first.return_value = self._avail()
            # Weather query: order_by().first()
            s.query.return_value.order_by.return_value.first.return_value = self._weather()

            res = client.get("/api/stations/predict?number=42")
        assert res.status_code == 200, res.get_json()
        data = res.get_json()["data"]
        assert 0 <= data["predicted_bikes"] <= 20


    def test_confidence_between_0_and_1(self,client):
        with patch("flask_app.routes.station_routes._model") as mock_model, \
             patch("flask_app.routes.station_routes.SessionLocal") as MockSession:
            mock_model.estimators_ = [self._mock_estimator(8.0)] * 10
            s = MockSession.return_value
            # Station query: filter_by().first()
            s.query.return_value.filter_by.return_value.first.return_value = self._station()
            # Availability query: filter_by().order_by().first()
            s.query.return_value.filter_by.return_value.order_by.return_value.first.return_value = self._avail()
            # Weather query: order_by().first()
            s.query.return_value.order_by.return_value.first.return_value = self._weather()
            res = client.get("/api/stations/predict?number=42")

        assert res.status_code == 200, res.get_json()
        data = res.get_json()["data"]
        assert 0.0 <= data["confidence"] <= 1.0


    def test_missing_number_returns_400(self,client):
        res = client.get("/api/stations/predict")
        assert res.status_code == 400


    def test_non_integer_number_returns_400(self,client):
        res = client.get("/api/stations/predict?number=abc")
        assert res.status_code == 400


    def test_unknown_station_returns_404(self,client):
        with patch("flask_app.routes.station_routes._model") as mock_model, \
             patch("flask_app.routes.station_routes.SessionLocal") as MockSession:
            mock_model.estimators_ = [self._mock_estimator()]
            MockSession.return_value.query.return_value.filter_by.return_value.first.return_value = None
            res = client.get("/api/stations/predict?number=9999")
        assert res.status_code == 404


    def test_no_model_returns_503(self,client):
        with patch("flask_app.routes.station_routes._model", None):
            res = client.get("/api/stations/predict?number=42")
        assert res.status_code == 503


    def test_response_matches_apiresponse_shape(self,client):
        with patch("flask_app.routes.station_routes._model") as mock_model, \
             patch("flask_app.routes.station_routes.SessionLocal") as MockSession:
            mock_model.estimators_ = [self._mock_estimator(10.0)] * 5
            s = MockSession.return_value
            s.query.return_value.filter_by.return_value.first.side_effect = [self._station(), self._avail()]
            s.query.return_value.order_by.return_value.first.return_value = self._weather()
            res = client.get("/api/stations/predict?number=42")
        body = res.get_json()
        for key in ["code", "data", "message", "timestamp"]:
            assert key in body
