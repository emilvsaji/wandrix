from functools import wraps
from datetime import datetime, timedelta

import jwt
from bson import ObjectId
from bson.errors import InvalidId
from flask import request, g

from config import Config
from database import get_users_collection
from utils.responses import error_response


JWT_SECRET = Config.JWT_SECRET
JWT_EXPIRATION_HOURS = Config.JWT_EXPIRATION_HOURS


def generate_token(user_id, is_admin=False):
    payload = {
        "user_id": str(user_id),
        "is_admin": bool(is_admin),
        "exp": datetime.utcnow() + timedelta(hours=JWT_EXPIRATION_HOURS),
        "iat": datetime.utcnow(),
    }
    return jwt.encode(payload, JWT_SECRET, algorithm="HS256")


def _decode_token(token):
    return jwt.decode(token, JWT_SECRET, algorithms=["HS256"])


def _extract_bearer_token():
    auth_header = request.headers.get("Authorization", "")
    if not auth_header.startswith("Bearer "):
        return None
    return auth_header.split(" ", 1)[1].strip()


def jwt_required(fn):
    @wraps(fn)
    def wrapper(*args, **kwargs):
        token = _extract_bearer_token()
        if not token:
            return error_response("Authorization token is required", 401)

        try:
            payload = _decode_token(token)
            g.current_user_id = payload.get("user_id")
            g.current_user_is_admin = bool(payload.get("is_admin", False))
            if not g.current_user_id:
                return error_response("Invalid token payload", 401)
        except jwt.ExpiredSignatureError:
            return error_response("Token has expired", 401)
        except jwt.InvalidTokenError:
            return error_response("Invalid token", 401)

        return fn(*args, **kwargs)

    return wrapper


def admin_required(fn):
    @wraps(fn)
    @jwt_required
    def wrapper(*args, **kwargs):
        if not get_current_user_is_admin():
            return error_response("Admin access required", 403)
        return fn(*args, **kwargs)

    return wrapper


def get_current_user_id():
    return getattr(g, "current_user_id", None)


def get_current_user_is_admin():
    return bool(getattr(g, "current_user_is_admin", False))


def get_current_user():
    user_id = get_current_user_id()
    if not user_id:
        return None

    users = get_users_collection()
    if users is None:
        return None

    try:
        try:
            user = users.find_one({"_id": ObjectId(user_id)})
        except (InvalidId, TypeError, ValueError):
            user = users.find_one({"_id": user_id})
        if user and "_id" in user:
            user["_id"] = str(user["_id"])
        return user
    except Exception:
        return None
