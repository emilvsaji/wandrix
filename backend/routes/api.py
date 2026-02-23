import asyncio

from flask import Blueprint, request
from pydantic import ValidationError

from auth_utils import jwt_required, get_current_user_id
from database import health_check as db_health_check, get_connection_status
from models import ComparisonRequest, DestinationRequest, ItineraryGenerateRequest
from services.gemini_service import gemini_service
from services.user_data_service import (
    save_comparison,
    save_itinerary,
    get_user_comparison_history,
    get_user_itinerary_history,
    get_user_itinerary_by_id,
)
from utils.responses import success_response, error_response


api_bp = Blueprint('api', __name__)


def run_async(coro):
    loop = asyncio.new_event_loop()
    asyncio.set_event_loop(loop)
    try:
        return loop.run_until_complete(coro)
    finally:
        loop.close()


@api_bp.route('/health', methods=['GET'])
def health_check():
    db_status = db_health_check()
    return success_response(
        {
            "status": "healthy",
            "database": db_status,
        },
        "Wandrix API is running",
    )


@api_bp.route('/db/status', methods=['GET'])
def database_status():
    return success_response(get_connection_status(), 'Database status fetched')


@api_bp.route('/destination/info', methods=['POST'])
def get_destination_info():
    try:
        payload = DestinationRequest.model_validate(request.get_json() or {})
        result = run_async(gemini_service.get_destination_info(payload.destination))
        return success_response(result, 'Destination information fetched')
    except ValidationError as e:
        return error_response(f'Validation error: {e.errors()}', 400)
    except Exception as e:
        return error_response(str(e), 500)


@api_bp.route('/destination/highlights', methods=['POST'])
def get_destination_highlights():
    try:
        payload = DestinationRequest.model_validate(request.get_json() or {})
        result = run_async(gemini_service.get_destination_highlights(payload.destination))
        return success_response(result, 'Destination highlights fetched')
    except ValidationError as e:
        return error_response(f'Validation error: {e.errors()}', 400)
    except Exception as e:
        return error_response(str(e), 500)


@api_bp.route('/compare', methods=['POST'])
@jwt_required
def compare_destinations():
    try:
        payload = ComparisonRequest.model_validate(request.get_json() or {})
        user_id = get_current_user_id()

        result = run_async(
            gemini_service.compare_destinations(
                payload.destination1,
                payload.destination2,
                payload.preferences.model_dump(),
            )
        )

        comparison_record = save_comparison(
            user_id=user_id,
            destination1=payload.destination1,
            destination2=payload.destination2,
            preferences=payload.preferences.model_dump(),
            result=result,
        )
        if comparison_record is None:
            return error_response('Database not available', 500)

        return success_response(
            {"comparison": comparison_record},
            'Comparison created successfully',
            201,
        )
    except ValidationError as e:
        return error_response(f'Validation error: {e.errors()}', 400)
    except Exception as e:
        return error_response(str(e), 500)


@api_bp.route('/itinerary/generate', methods=['POST'])
@jwt_required
def generate_itinerary():
    try:
        payload = ItineraryGenerateRequest.model_validate(request.get_json() or {})
        user_id = get_current_user_id()

        result = run_async(
            gemini_service.generate_itinerary(
                payload.destination,
                payload.preferences.model_dump(),
            )
        )

        itinerary_record = save_itinerary(
            user_id=user_id,
            destination=payload.destination,
            preferences=payload.preferences.model_dump(),
            itinerary=result,
        )
        if itinerary_record is None:
            return error_response('Database not available', 500)

        return success_response(
            {"itinerary": itinerary_record},
            'Itinerary generated successfully',
            201,
        )
    except ValidationError as e:
        return error_response(f'Validation error: {e.errors()}', 400)
    except Exception as e:
        return error_response(str(e), 500)


@api_bp.route('/itinerary/<itinerary_id>', methods=['GET'])
@jwt_required
def get_itinerary(itinerary_id):
    user_id = get_current_user_id()
    try:
        itinerary = get_user_itinerary_by_id(user_id, itinerary_id)
        if itinerary is None:
            return error_response('Database not available', 500)
        if itinerary is False:
            return error_response('Invalid itinerary id', 400)
        if not itinerary:
            return error_response('Itinerary not found', 404)
        return success_response({"itinerary": itinerary}, 'Itinerary fetched')
    except Exception as e:
        return error_response(str(e), 500)


@api_bp.route('/comparisons/history', methods=['GET'])
@jwt_required
def get_comparison_history():
    user_id = get_current_user_id()

    try:
        history = get_user_comparison_history(user_id)
        if history is None:
            return error_response('Database not available', 500)
        return success_response(
            {"comparisons": history},
            'Comparison history fetched',
        )
    except Exception as e:
        return error_response(str(e), 500)


@api_bp.route('/itineraries/history', methods=['GET'])
@jwt_required
def get_itineraries_history():
    user_id = get_current_user_id()

    try:
        history = get_user_itinerary_history(user_id)
        if history is None:
            return error_response('Database not available', 500)
        return success_response(
            {"itineraries": history},
            'Itinerary history fetched',
        )
    except Exception as e:
        return error_response(str(e), 500)


POPULAR_DESTINATIONS = [
    {"name": "Paris", "country": "France", "image": "paris.jpg", "tagline": "City of Love"},
    {"name": "Tokyo", "country": "Japan", "image": "tokyo.jpg", "tagline": "Where Tradition Meets Future"},
    {"name": "Bali", "country": "Indonesia", "image": "bali.jpg", "tagline": "Island of Gods"},
    {"name": "New York", "country": "USA", "image": "newyork.jpg", "tagline": "The City That Never Sleeps"},
    {"name": "Rome", "country": "Italy", "image": "rome.jpg", "tagline": "Eternal City"},
    {"name": "Dubai", "country": "UAE", "image": "dubai.jpg", "tagline": "City of Gold"},
    {"name": "Sydney", "country": "Australia", "image": "sydney.jpg", "tagline": "Harbor City"},
    {"name": "Maldives", "country": "Maldives", "image": "maldives.jpg", "tagline": "Paradise on Earth"},
    {"name": "Barcelona", "country": "Spain", "image": "barcelona.jpg", "tagline": "City of Gaudi"},
    {"name": "Singapore", "country": "Singapore", "image": "singapore.jpg", "tagline": "Garden City"},
    {"name": "London", "country": "UK", "image": "london.jpg", "tagline": "The Great Wen"},
    {"name": "Santorini", "country": "Greece", "image": "santorini.jpg", "tagline": "Jewel of the Aegean"},
]


@api_bp.route('/destinations/popular', methods=['GET'])
def get_popular_destinations():
    return success_response({"destinations": POPULAR_DESTINATIONS}, 'Popular destinations fetched')
