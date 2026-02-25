from datetime import datetime

from bson import ObjectId
from bson.errors import InvalidId
from flask import Blueprint, request
from pydantic import ValidationError
from werkzeug.security import generate_password_hash, check_password_hash

from auth_utils import generate_token, get_current_user, get_current_user_id, jwt_required
from database import get_users_collection
from models import AddWishlistRequest, RemoveWishlistRequest, ProfileUpdateRequest
from utils.responses import success_response, error_response


auth_bp = Blueprint('auth', __name__)


def _user_query_from_id(user_id: str):
    try:
        return {"_id": ObjectId(user_id)}
    except (InvalidId, TypeError, ValueError):
        return {"_id": user_id}


@auth_bp.route('/register', methods=['POST'])
def register():
    try:
        data = request.get_json() or {}
        name = (data.get('name') or '').strip()
        email = (data.get('email') or '').lower().strip()
        password = data.get('password') or ''

        if not name or not email or not password:
            return error_response('Name, email and password are required', 400)

        if '@' not in email or '.' not in email:
            return error_response('Invalid email format', 400)

        if len(password) < 6:
            return error_response('Password must be at least 6 characters', 400)

        users = get_users_collection()
        if users is None:
            return error_response('Database not available', 500)

        if users.find_one({"email": email}):
            return error_response('Email already registered', 409)

        user_doc = {
            "email": email,
            "password": generate_password_hash(password),
            "name": name,
            "wishlist": [],
            "is_admin": False,
            "created_at": datetime.utcnow(),
        }

        result = users.insert_one(user_doc)
        user_id = str(result.inserted_id)
        token = generate_token(user_id, is_admin=user_doc['is_admin'])

        return success_response(
            {
                "token": token,
                "user": {
                    "id": user_id,
                    "email": email,
                    "name": name,
                    "wishlist": [],
                    "avatar_url": None,
                    "is_admin": user_doc['is_admin'],
                    "is_blocked": False,
                    "blocked_reason": None,
                },
            },
            "Registration successful",
            201,
        )
    except Exception:
        return error_response('Registration failed. Please try again.', 500)


@auth_bp.route('/login', methods=['POST'])
def login():
    try:
        data = request.get_json() or {}
        email = (data.get('email') or '').lower().strip()
        password = data.get('password') or ''

        if not email or not password:
            return error_response('Email and password are required', 400)

        users = get_users_collection()
        if users is None:
            return error_response('Database not available', 500)

        user = users.find_one({"email": email})
        if not user or not check_password_hash(user.get('password', ''), password):
            return error_response('Invalid email or password', 401)
        if bool(user.get('is_blocked', False)):
            return error_response('Your account is blocked. Contact support.', 403)

        user_id = str(user['_id'])
        is_admin = bool(user.get('is_admin', False))
        token = generate_token(user_id, is_admin=is_admin)

        return success_response(
            {
                "token": token,
                "user": {
                    "id": user_id,
                    "email": user.get('email'),
                    "name": user.get('name'),
                    "wishlist": user.get('wishlist', []),
                    "avatar_url": user.get('avatar_url'),
                    "is_admin": is_admin,
                    "is_blocked": bool(user.get('is_blocked', False)),
                    "blocked_reason": user.get('blocked_reason'),
                    "created_at": user.get('created_at'),
                },
            },
            'Login successful',
        )
    except Exception:
        return error_response('Login failed. Please try again.', 500)


@auth_bp.route('/me', methods=['GET'])
@jwt_required
def get_me():
    user = get_current_user()
    if not user:
        return error_response('Unauthorized', 401)

    return success_response(
        {
            "user": {
                "id": user['_id'],
                "email": user.get('email'),
                "name": user.get('name'),
                "wishlist": user.get('wishlist', []),
                "avatar_url": user.get('avatar_url'),
                "is_admin": bool(user.get('is_admin', False)),
                "is_blocked": bool(user.get('is_blocked', False)),
                "blocked_reason": user.get('blocked_reason'),
                "created_at": user.get('created_at'),
            }
        },
        'User profile fetched',
    )


@auth_bp.route('/wishlist', methods=['GET'])
@jwt_required
def get_wishlist():
    user = get_current_user()
    if not user:
        return error_response('Unauthorized', 401)

    return success_response({"wishlist": user.get('wishlist', [])}, 'Wishlist fetched')


@auth_bp.route('/wishlist/add', methods=['POST'])
@jwt_required
def add_to_wishlist():
    users = get_users_collection()
    if users is None:
        return error_response('Database not available', 500)

    user = get_current_user()
    if not user:
        return error_response('Unauthorized', 401)

    try:
        payload = AddWishlistRequest.model_validate(request.get_json() or {})
    except ValidationError as e:
        return error_response(f'Validation error: {e.errors()}', 400)

    destination = payload.destination.model_dump()
    destination['added_at'] = datetime.utcnow().isoformat()

    if any(item.get('name') == destination['name'] for item in user.get('wishlist', [])):
        return error_response('Destination already in wishlist', 409)

    user_id = get_current_user_id()
    query = _user_query_from_id(user_id)

    result = users.update_one(query, {"$push": {"wishlist": destination}})
    if result.modified_count == 0:
        return error_response('Failed to update wishlist', 500)

    refreshed_user = users.find_one(query)
    wishlist = refreshed_user.get('wishlist', []) if refreshed_user else []
    return success_response(
        {"wishlist": wishlist, "destination": destination},
        'Added to wishlist',
    )


@auth_bp.route('/wishlist/remove', methods=['POST'])
@jwt_required
def remove_from_wishlist():
    users = get_users_collection()
    if users is None:
        return error_response('Database not available', 500)

    try:
        payload = RemoveWishlistRequest.model_validate(request.get_json() or {})
    except ValidationError as e:
        return error_response(f'Validation error: {e.errors()}', 400)

    user_id = get_current_user_id()
    query = _user_query_from_id(user_id)

    result = users.update_one(query, {"$pull": {"wishlist": {"name": payload.name}}})
    if result.matched_count == 0:
        return error_response('User not found', 404)

    refreshed_user = users.find_one(query)
    wishlist = refreshed_user.get('wishlist', []) if refreshed_user else []
    return success_response(
        {"wishlist": wishlist, "removed_name": payload.name},
        'Removed from wishlist',
    )


@auth_bp.route('/wishlist/check/<destination_name>', methods=['GET'])
@jwt_required
def check_in_wishlist(destination_name):
    user = get_current_user()
    if not user:
        return error_response('Unauthorized', 401)

    in_wishlist = any(item.get('name') == destination_name for item in user.get('wishlist', []))
    return success_response({"in_wishlist": in_wishlist}, 'Wishlist check complete')


@auth_bp.route('/profile', methods=['PUT'])
@jwt_required
def update_profile():
    users = get_users_collection()
    if users is None:
        return error_response('Database not available', 500)

    user_id = get_current_user_id()
    query = _user_query_from_id(user_id)

    try:
        payload = ProfileUpdateRequest.model_validate(request.get_json() or {})
    except ValidationError as e:
        return error_response(f'Validation error: {e.errors()}', 400)

    update_fields = {}
    if payload.name is not None:
        update_fields['name'] = payload.name
    if payload.avatar_url is not None:
        update_fields['avatar_url'] = payload.avatar_url

    if not update_fields:
        return error_response('No profile fields provided', 400)

    update_fields['updated_at'] = datetime.utcnow()
    result = users.update_one(query, {'$set': update_fields})

    if result.matched_count == 0:
        return error_response('User not found', 404)

    updated_user = users.find_one(query)
    if not updated_user:
        return error_response('Failed to fetch updated profile', 500)

    return success_response(
        {
            'user': {
                'id': str(updated_user.get('_id')),
                'email': updated_user.get('email'),
                'name': updated_user.get('name'),
                'wishlist': updated_user.get('wishlist', []),
                'avatar_url': updated_user.get('avatar_url'),
                'is_admin': bool(updated_user.get('is_admin', False)),
                'is_blocked': bool(updated_user.get('is_blocked', False)),
                'blocked_reason': updated_user.get('blocked_reason'),
                'created_at': updated_user.get('created_at'),
            }
        },
        'Profile updated successfully',
    )
