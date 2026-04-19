import os
from typing import Any, Dict, Optional

import requests
from flask import Blueprint, jsonify, request

route_planning_bp = Blueprint(
    "route_planning",
    __name__,
    url_prefix="/api/routes",
)

ROUTES_API_URL = "https://routes.googleapis.com/directions/v2:computeRoutes"


def _validate_point(point: Optional[Dict[str, Any]], name: str) -> Optional[str]:
    if not point:
        return f"Missing {name}."

    lat = point.get("lat")
    lng = point.get("lng")

    if lat is None or lng is None:
        return f"{name} must include 'lat' and 'lng'."

    try:
        float(lat)
        float(lng)
    except (TypeError, ValueError):
        return f"{name} coordinates must be numeric."

    return None


def _extract_station_position(station: Optional[Dict[str, Any]], name: str) -> Dict[str, float]:
    if not station:
        raise ValueError(f"Missing {name}.")

    position = station.get("position")
    if not position:
        raise ValueError(f"{name} must include 'position'.")

    lat = position.get("lat")
    lng = position.get("lng")

    if lat is None or lng is None:
        raise ValueError(f"{name}.position must include 'lat' and 'lng'.")

    return {
        "lat": float(lat),
        "lng": float(lng),
    }


def _build_request_body(origin: Dict[str, float], destination: Dict[str, float], travel_mode: str) -> Dict[str, Any]:
    body: Dict[str, Any] = {
        "origin": {
            "location": {
                "latLng": {
                    "latitude": origin["lat"],
                    "longitude": origin["lng"],
                }
            }
        },
        "destination": {
            "location": {
                "latLng": {
                    "latitude": destination["lat"],
                    "longitude": destination["lng"],
                }
            }
        },
        "travelMode": travel_mode,
        "computeAlternativeRoutes": False,
        "languageCode": "en-US",
        "units": "METRIC",
    }

    # Google only allows routingPreference for some motorized modes.
    if travel_mode not in {"WALK", "BICYCLE"}:
        body["routingPreference"] = "TRAFFIC_UNAWARE"

    return body


def _parse_duration_to_seconds(duration_value: Optional[str]) -> Optional[int]:
    """
    Routes API returns duration strings like '532s'.
    """
    if not duration_value or not isinstance(duration_value, str):
        return None

    if duration_value.endswith("s"):
        try:
            return int(float(duration_value[:-1]))
        except ValueError:
            return None

    return None


def _compute_route(origin: Dict[str, float], destination: Dict[str, float], travel_mode: str) -> Dict[str, Any]:
    api_key = os.getenv("GOOGLE_ROUTES_API_KEY")
    if not api_key:
        raise RuntimeError("GOOGLE_ROUTES_API_KEY is not set.")

    headers = {
        "Content-Type": "application/json",
        "X-Goog-Api-Key": api_key,
        "X-Goog-FieldMask": "routes.distanceMeters,routes.duration,routes.polyline.encodedPolyline",
        "Referer": "http://localhost:5173",
    }

    body = _build_request_body(origin, destination, travel_mode)

    response = requests.post(
        ROUTES_API_URL,
        headers=headers,
        json=body,
        timeout=20,
    )

    if not response.ok:
        raise RuntimeError(
            f"Routes API error {response.status_code}: {response.text}"
        )

    data = response.json()
    route = (data.get("routes") or [None])[0]
    if not route:
        raise RuntimeError("No route returned from Google Routes API.")

    duration_raw = route.get("duration")
    distance_meters = route.get("distanceMeters")
    encoded_polyline = (route.get("polyline") or {}).get("encodedPolyline")

    return {
        "travelMode": travel_mode,
        "distanceMeters": distance_meters,
        "duration": duration_raw,
        "durationSeconds": _parse_duration_to_seconds(duration_raw),
        "encodedPolyline": encoded_polyline,
    }


@route_planning_bp.route("/plan", methods=["POST"])
def plan_route():
    try:
        payload = request.get_json(silent=True) or {}

        user_location = payload.get("userLocation")
        destination_location = payload.get("destinationLocation")
        start_station = payload.get("startStation")
        end_station = payload.get("endStation")

        error = _validate_point(user_location, "userLocation")
        if error:
            return jsonify({"error": error}), 400

        error = _validate_point(destination_location, "destinationLocation")
        if error:
            return jsonify({"error": error}), 400

        user_point = {
            "lat": float(user_location["lat"]),
            "lng": float(user_location["lng"]),
        }
        destination_point = {
            "lat": float(destination_location["lat"]),
            "lng": float(destination_location["lng"]),
        }
        start_station_point = _extract_station_position(start_station, "startStation")
        end_station_point = _extract_station_position(end_station, "endStation")

        walk_to_start = _compute_route(
            origin=user_point,
            destination=start_station_point,
            travel_mode="WALK",
        )

        bike_leg = _compute_route(
            origin=start_station_point,
            destination=end_station_point,
            travel_mode="BICYCLE",
        )

        walk_to_destination = _compute_route(
            origin=end_station_point,
            destination=destination_point,
            travel_mode="WALK",
        )

        total_distance = sum(
            value.get("distanceMeters") or 0
            for value in [walk_to_start, bike_leg, walk_to_destination]
        )
        total_duration_seconds = sum(
            value.get("durationSeconds") or 0
            for value in [walk_to_start, bike_leg, walk_to_destination]
        )

        return jsonify({
            "walkToStart": walk_to_start,
            "bikeLeg": bike_leg,
            "walkToDestination": walk_to_destination,
            "summary": {
                "totalDistanceMeters": total_distance,
                "totalDurationSeconds": total_duration_seconds,
            },
        })

    except ValueError as exc:
        return jsonify({"error": str(exc)}), 400
    except requests.RequestException as exc:
        return jsonify({"error": f"Network error while calling Routes API: {exc}"}), 502
    except Exception as exc:
        return jsonify({"error": str(exc)}), 500