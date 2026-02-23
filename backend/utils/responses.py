from flask import jsonify


def success_response(data=None, message="Request successful", status_code=200):
    payload = {
        "success": True,
        "data": data if data is not None else {},
        "message": message,
    }
    return jsonify(payload), status_code


def error_response(message="Request failed", status_code=400):
    payload = {
        "success": False,
        "message": message,
    }
    return jsonify(payload), status_code
