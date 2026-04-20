import pytest
from unittest.mock import patch, MagicMock

# Import the helper function directly to test it in isolation
from flask_app.routes.route_planning import _parse_duration_to_seconds


# 1. Helper Methods Tests
class TestRouteHelpers:
    """
    Test independent helper functions.
    Logic: Pure functions (no DB, no network) should be tested independently
    to ensure the core data parsing logic is flawless.
    """

    def test_parse_duration_to_seconds(self):
        # Valid cases
        assert _parse_duration_to_seconds("532s") == 532
        assert _parse_duration_to_seconds("10s") == 10

        # Invalid/Edge cases
        assert _parse_duration_to_seconds("532") is None
        assert _parse_duration_to_seconds(None) is None
        assert _parse_duration_to_seconds("abc_s") is None


# 2. Main API Endpoint Tests
class TestRoutePlanningEndpoint:

    def test_plan_route_missing_payload(self, client):
        """Sad Path: Trigger the 400 Bad Request by sending an empty payload."""
        response = client.post('/api/routes/plan', json={})

        assert response.status_code == 400
        assert "Missing userLocation" in response.get_json()["error"]

    def test_plan_route_invalid_coordinates(self, client):
        """Sad Path: Trigger the ValueError by sending non-numeric coordinates."""
        payload = {
            "userLocation": {"lat": "invalid_string", "lng": -6.26},
            "destinationLocation": {"lat": 53.35, "lng": -6.27},
            "startStation": {"position": {"lat": 53.34, "lng": -6.25}},
            "endStation": {"position": {"lat": 53.33, "lng": -6.24}}
        }
        response = client.post('/api/routes/plan', json=payload)

        assert response.status_code == 400
        assert "must be numeric" in response.get_json()["error"]

    # patch both requests.post AND os.getenv
    @patch('flask_app.routes.route_planning.requests.post')
    @patch('flask_app.routes.route_planning.os.getenv')
    def test_plan_route_happy_path(self, mock_getenv, mock_post, client):
        """
        Happy Path: Simulate 3 successful Google Routes API calls.
        """

        # 1. Arrange: Fake the API Key to pass the first security check
        mock_getenv.return_value = "FAKE_GOOGLE_API_KEY"

        # 2. Arrange: Fake the Google API JSON response
        mock_google_response = MagicMock()
        mock_google_response.ok = True
        mock_google_response.json.return_value = {
            "routes": [
                {
                    "distanceMeters": 1000,
                    "duration": "600s",
                    "polyline": {"encodedPolyline": "fake_encoded_string"}
                }
            ]
        }
        mock_post.return_value = mock_google_response

        # 3. Arrange: Prepare a perfect frontend payload
        payload = {
            "userLocation": {"lat": 53.30, "lng": -6.20},
            "destinationLocation": {"lat": 53.40, "lng": -6.30},
            "startStation": {"position": {"lat": 53.31, "lng": -6.21}},
            "endStation": {"position": {"lat": 53.39, "lng": -6.29}}
        }

        # 4. Act
        response = client.post('/api/routes/plan', json=payload)

        # 5. Assert
        assert response.status_code == 200, response.get_json()
        data = response.get_json()

        # Verify the structure exists
        assert "walkToStart" in data
        assert "bikeLeg" in data
        assert "walkToDestination" in data

        # Mocked the API to always return 1000 meters and 600 seconds.
        # Since your code calls it 3 times (Walk -> Bike -> Walk), the sum should be perfectly multiplied by 3!
        assert data["summary"]["totalDistanceMeters"] == 3000  # 1000 * 3
        assert data["summary"]["totalDurationSeconds"] == 1800  # 600 * 3

        # Verify that `requests.post` was explicitly called exactly 3 times.
        assert mock_post.call_count == 3