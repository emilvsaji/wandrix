from flask import Blueprint

from auth_utils import admin_required
from database import get_db
from utils.responses import success_response, error_response


admin_bp = Blueprint('admin', __name__)


@admin_bp.route('/overview', methods=['GET'])
@admin_required
def get_admin_overview():
    database = get_db()
    if database is None:
        return error_response('Database not available', 500)

    try:
        users_count = database.users.count_documents({})
        comparisons_count = database.comparisons.count_documents({})
        itineraries_count = database.itineraries.count_documents({})

        return success_response(
            {
                "metrics": {
                    "users": users_count,
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
            user['_id'] = str(user['_id'])
            users.append(user)
        return success_response({"users": users}, 'Users fetched')
    except Exception as e:
        return error_response(str(e), 500)
