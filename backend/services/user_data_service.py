from datetime import datetime

from bson import ObjectId
from bson.errors import InvalidId

from database import get_comparisons_collection, get_itineraries_collection


def _serialize_document(document):
    serialized = dict(document)
    if '_id' in serialized:
        serialized['_id'] = str(serialized['_id'])
    return serialized


def _normalize_destination_name(value):
    return (value or '').strip().lower()


def _build_comparison_key(destination1, destination2):
    ordered = sorted([
        _normalize_destination_name(destination1),
        _normalize_destination_name(destination2),
    ])
    return f"{ordered[0]}::{ordered[1]}"


def save_comparison(user_id, destination1, destination2, preferences, result, source='ai', cache_hit=False):
    comparisons = get_comparisons_collection()
    if comparisons is None:
        return None

    comparison_record = {
        "user_id": user_id,
        "destination1": destination1,
        "destination2": destination2,
        "comparison_key": _build_comparison_key(destination1, destination2),
        "preferences": preferences,
        "result": result,
        "source": source,
        "cache_hit": cache_hit,
        "created_at": datetime.utcnow(),
    }
    inserted = comparisons.insert_one(comparison_record)
    comparison_record['_id'] = inserted.inserted_id
    return _serialize_document(comparison_record)


def get_recent_cached_comparison(destination1, destination2, limit=20):
    comparisons = get_comparisons_collection()
    if comparisons is None:
        return None

    key = _build_comparison_key(destination1, destination2)
    recent_records = list(
        comparisons.find({}, {"result": 1, "comparison_key": 1, "destination1": 1, "destination2": 1, "created_at": 1})
        .sort("created_at", -1)
        .limit(limit)
    )

    for item in recent_records:
        item_key = item.get('comparison_key')
        if not item_key:
            item_key = _build_comparison_key(item.get('destination1'), item.get('destination2'))

        if item_key == key and item.get('result'):
            return _serialize_document(item)

    return {}


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
