# common/api_response.py
from datetime import datetime, timezone

from flask import jsonify

class ApiResponse:
    """
    A utility class to standardize all HTTP JSON responses across the application.
    This ensures the frontend (e.g., React) always receives a predictable data contract.
    """
    @staticmethod
    def ok(data=None, message:str="Success"):
        """
        Generates a standardized successful HTTP response (200 OK).
        :param data:(any, optional) The main payload/data to be returned to the client. Defaults to None.
        :param message:(str, optional) A descriptive success message. Defaults to "Success".
        :return: tuple: A Flask JSON response object and the HTTP status code 200.
        """
        return jsonify({
            "timestamp": datetime.now(timezone.utc).isoformat(),
            "code": 200,
            "message": message,
            "data": data
        }), 200

    @staticmethod
    def error(message:str="Internal Server Error", code:int=500):
        """
        Generates a standardized error HTTP response.
        :param message:(str, optional): A description of the error encountered. Defaults to "Internal Server Error".
        :param code:(int, optional): The specific HTTP status code representing the error (e.g., 400 for Bad Request, 404 for Not Found, 500 for Server Error). Defaults to 500.
        :return: tuple: A Flask JSON response object containing the error message and the specified HTTP status code.
        """
        status_code = int(code) if str(code).isdigit() else 500
        return jsonify({
            "timestamp": datetime.now(timezone.utc).isoformat(),
            "code": code,
            "message": message,
            "data": None
        }), status_code