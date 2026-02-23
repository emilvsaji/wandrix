from datetime import datetime

from bson import ObjectId
from bson.errors import InvalidId

from database import get_comparisons_collection, get_itineraries_collection


def _serialize_document(document):
    serialized = dict(document)
    if '_id' in serialized:
        serialized['_id'] = str(serialized['_id'])
    return serialized


def save_comparison(user_id, destination1, destination2, preferences, result):
    comparisons = get_comparisons_collection()
    if comparisons is None:
        return None

    comparison_record = {
        "user_id": user_id,
        "destination1": destination1,
        "destination2": destination2,
        "preferences": preferences,
        "result": result,
        "created_at": datetime.utcnow(),
    }
    inserted = comparisons.insert_one(comparison_record)
    comparison_record['_id'] = inserted.inserted_id
    return _serialize_document(comparison_record)


def save_itinerary(user_id, destination, preferences, itinerary):
    itineraries = get_itineraries_collection()
    if itineraries is None:
        return None

    itinerary_record = {
        "user_id": user_id,
        "destination": destination,
        "preferences": preferences,
        "itinerary": itinerary,
        "created_at": datetime.utcnow(),
    }
    inserted = itineraries.insert_one(itinerary_record)
    itinerary_record['_id'] = inserted.inserted_id
    return _serialize_document(itinerary_record)


def get_user_comparison_history(user_id):
    comparisons = get_comparisons_collection()
    if comparisons is None:
        return None

    history = list(comparisons.find({"user_id": user_id}).sort("created_at", -1))
    return [_serialize_document(item) for item in history]


def get_user_itinerary_history(user_id):
    itineraries = get_itineraries_collection()
    if itineraries is None:
        return None

    history = list(itineraries.find({"user_id": user_id}).sort("created_at", -1))
    return [_serialize_document(item) for item in history]


def get_user_itinerary_by_id(user_id, itinerary_id):
    itineraries = get_itineraries_collection()
    if itineraries is None:
        return None

    try:
        object_id = ObjectId(itinerary_id)
    except (InvalidId, TypeError, ValueError):
        return False

    itinerary = itineraries.find_one({"_id": object_id, "user_id": user_id})
    if not itinerary:
        return {}

    return _serialize_document(itinerary)
