from bson import ObjectId
from bson.errors import InvalidId
from flask import Blueprint, request
from werkzeug.security import generate_password_hash

from auth_utils import admin_required, get_current_user_id
from database import get_db
from utils.responses import success_response, error_response


admin_bp = Blueprint('admin', __name__)


def _to_object_id(user_id: str):
    try:
        return ObjectId(user_id)
    except (InvalidId, TypeError, ValueError):
        return None


def _safe_user_projection(user_doc):
    if not user_doc:
        return None
    user = dict(user_doc)
    user['_id'] = str(user.get('_id'))
    user.pop('password', None)
    return user


@admin_bp.route('/overview', methods=['GET'])
@admin_required
def get_admin_overview():
    database = get_db()
    if database is None:
        return error_response('Database not available', 500)

    try:
        users_count = database.users.count_documents({})
        admin_count = database.users.count_documents({'is_admin': True})
        comparisons_count = database.comparisons.count_documents({})
        itineraries_count = database.itineraries.count_documents({})

        return success_response(
            {
                "metrics": {
                    "users": users_count,
                    "admins": admin_count,
                    "comparisons": comparisons_count,
                    "itineraries": itineraries_count,
                }
            },
            'Admin overview fetched',
        )
    except Exception as e:
        return error_response(str(e), 500)


@admin_bp.route('/users', methods=['GET'])
@admin_required
def list_users():
    database = get_db()
    if database is None:
        return error_response('Database not available', 500)

    try:
        users_cursor = database.users.find({}, {"password": 0}).sort("created_at", -1)
        users = []
        for user in users_cursor:
            user_id_str = str(user['_id'])
            users.append(
                {
                    **_safe_user_projection(user),
                    'is_blocked': bool(user.get('is_blocked', False)),
                    'blocked_reason': user.get('blocked_reason'),
                    'wishlist_count': len(user.get('wishlist', []) or []),
                    'comparison_count': database.comparisons.count_documents({'user_id': user_id_str}),
                    'itinerary_count': database.itineraries.count_documents({'user_id': user_id_str}),
                }
            )
        return success_response({"users": users}, 'Users fetched')
    except Exception as e:
        return error_response(str(e), 500)


@admin_bp.route('/users/<user_id>/role', methods=['PATCH'])
@admin_required
def update_user_role(user_id):
    database = get_db()
    if database is None:
        return error_response('Database not available', 500)

    payload = request.get_json() or {}
    is_admin = payload.get('is_admin')
    if not isinstance(is_admin, bool):
        return error_response('is_admin must be a boolean', 400)

    current_user_id = get_current_user_id()
    if str(current_user_id) == str(user_id) and not is_admin:
        return error_response('You cannot remove your own admin access', 400)

    object_id = _to_object_id(user_id)
    if object_id is None:
        return error_response('Invalid user id', 400)

    try:
        user = database.users.find_one({'_id': object_id})
        if not user:
            return error_response('User not found', 404)

        database.users.update_one({'_id': object_id}, {'$set': {'is_admin': is_admin}})
        updated = database.users.find_one({'_id': object_id}, {'password': 0})
        return success_response({'user': _safe_user_projection(updated)}, 'User role updated')
    except Exception as e:
        return error_response(str(e), 500)


@admin_bp.route('/users/<user_id>', methods=['DELETE'])
@admin_required
def delete_user(user_id):
    database = get_db()
    if database is None:
        return error_response('Database not available', 500)

    current_user_id = get_current_user_id()
    if str(current_user_id) == str(user_id):
        return error_response('You cannot delete your own account from admin panel', 400)

    object_id = _to_object_id(user_id)
    if object_id is None:
        return error_response('Invalid user id', 400)

    try:
        user = database.users.find_one({'_id': object_id}, {'password': 0})
        if not user:
            return error_response('User not found', 404)

        user_id_str = str(object_id)
        database.users.delete_one({'_id': object_id})
        comparisons_deleted = database.comparisons.delete_many({'user_id': user_id_str}).deleted_count
        itineraries_deleted = database.itineraries.delete_many({'user_id': user_id_str}).deleted_count

        return success_response(
            {
                'deleted_user': _safe_user_projection(user),
                'cleanup': {
                    'comparisons_deleted': comparisons_deleted,
                    'itineraries_deleted': itineraries_deleted,
                },
            },
            'User deleted',
        )
    except Exception as e:
        return error_response(str(e), 500)


@admin_bp.route('/users/<user_id>/activity', methods=['GET'])
@admin_required
def get_user_activity(user_id):
    database = get_db()
    if database is None:
        return error_response('Database not available', 500)

    object_id = _to_object_id(user_id)
    if object_id is None:
        return error_response('Invalid user id', 400)

    try:
        user = database.users.find_one({'_id': object_id}, {'password': 0})
        if not user:
            return error_response('User not found', 404)

        user_id_str = str(object_id)
        comparisons = list(
            database.comparisons.find(
                {'user_id': user_id_str},
                {'destination1': 1, 'destination2': 1, 'created_at': 1},
            )
            .sort('created_at', -1)
            .limit(10)
        )
        itineraries = list(
            database.itineraries.find(
                {'user_id': user_id_str},
                {'destination': 1, 'created_at': 1},
            )
            .sort('created_at', -1)
            .limit(10)
        )

        for record in comparisons:
            record['_id'] = str(record['_id'])
        for record in itineraries:
            record['_id'] = str(record['_id'])

        return success_response(
            {
                'user': _safe_user_projection(user),
                'activity': {
                    'recent_comparisons': comparisons,
                    'recent_itineraries': itineraries,
                },
            },
            'User activity fetched',
        )
    except Exception as e:
        return error_response(str(e), 500)


@admin_bp.route('/users/<user_id>/status', methods=['PATCH'])
@admin_required
def update_user_status(user_id):
    database = get_db()
    if database is None:
        return error_response('Database not available', 500)

    payload = request.get_json() or {}
    is_blocked = payload.get('is_blocked')
    blocked_reason = (payload.get('blocked_reason') or '').strip()

    if not isinstance(is_blocked, bool):
        return error_response('is_blocked must be a boolean', 400)

    current_user_id = get_current_user_id()
    if str(current_user_id) == str(user_id):
        return error_response('You cannot change your own blocked status', 400)

    object_id = _to_object_id(user_id)
    if object_id is None:
        return error_response('Invalid user id', 400)

    try:
        user = database.users.find_one({'_id': object_id})
        if not user:
            return error_response('User not found', 404)

        updates = {
            'is_blocked': is_blocked,
            'blocked_reason': blocked_reason if is_blocked and blocked_reason else None,
        }
        database.users.update_one({'_id': object_id}, {'$set': updates})
        updated = database.users.find_one({'_id': object_id}, {'password': 0})
        return success_response({'user': _safe_user_projection(updated)}, 'User status updated')
    except Exception as e:
        return error_response(str(e), 500)


@admin_bp.route('/users/<user_id>/password', methods=['PATCH'])
@admin_required
def reset_user_password(user_id):
    database = get_db()
    if database is None:
        return error_response('Database not available', 500)

    payload = request.get_json() or {}
    new_password = payload.get('new_password') or ''
    if len(new_password) < 6:
        return error_response('new_password must be at least 6 characters', 400)

    object_id = _to_object_id(user_id)
    if object_id is None:
        return error_response('Invalid user id', 400)

    try:
        user = database.users.find_one({'_id': object_id})
        if not user:
            return error_response('User not found', 404)

        database.users.update_one(
            {'_id': object_id},
            {'$set': {'password': generate_password_hash(new_password)}},
        )
        return success_response({}, 'User password reset successfully')
    except Exception as e:
        return error_response(str(e), 500)
