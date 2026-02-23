from datetime import datetime
import hashlib
import json

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


def _normalize_preferences(preferences):
    prefs = dict(preferences or {})
    normalized = {}
    for key in sorted(prefs.keys()):
        value = prefs.get(key)
        if isinstance(value, str):
            normalized[key] = value.strip().lower()
        elif isinstance(value, list):
            normalized[key] = sorted([
                item.strip().lower() if isinstance(item, str) else item
                for item in value
            ])
        else:
            normalized[key] = value
    return normalized


def _build_preferences_key(preferences):
    normalized = _normalize_preferences(preferences)
    raw = json.dumps(normalized, sort_keys=True, separators=(",", ":"), default=str)
    return hashlib.sha256(raw.encode("utf-8")).hexdigest(), normalized


def save_comparison(user_id, destination1, destination2, preferences, result, source='ai', cache_hit=False):
    comparisons = get_comparisons_collection()
    if comparisons is None:
        return None

    preferences_key, normalized_preferences = _build_preferences_key(preferences)

    comparison_record = {
        "user_id": user_id,
        "destination1": destination1,
        "destination2": destination2,
        "destination1_normalized": _normalize_destination_name(destination1),
        "destination2_normalized": _normalize_destination_name(destination2),
        "comparison_key": _build_comparison_key(destination1, destination2),
        "preferences": preferences,
        "preferences_normalized": normalized_preferences,
        "preferences_key": preferences_key,
        "result": result,
        "source": source,
        "cache_hit": cache_hit,
        "created_at": datetime.utcnow(),
    }
    inserted = comparisons.insert_one(comparison_record)
    comparison_record['_id'] = inserted.inserted_id
    return _serialize_document(comparison_record)


def get_cached_comparison(user_id, destination1, destination2, preferences):
    comparisons = get_comparisons_collection()
    if comparisons is None:
        return None

    key = _build_comparison_key(destination1, destination2)
    preferences_key, _ = _build_preferences_key(preferences)

    cached = comparisons.find_one(
        {
            "user_id": user_id,
            "comparison_key": key,
            "preferences_key": preferences_key,
        },
        sort=[("created_at", -1)],
    )

    if not cached:
        return {}

    result = cached.get('result')
    if not result or (isinstance(result, dict) and result.get('error')):
        return {}

    return _serialize_document(cached)


def get_cached_itinerary(user_id, destination, preferences):
    itineraries = get_itineraries_collection()
    if itineraries is None:
        return None

    preferences_key, _ = _build_preferences_key(preferences)
    destination_key = _normalize_destination_name(destination)

    cached = itineraries.find_one(
        {
            "user_id": user_id,
            "destination_normalized": destination_key,
            "preferences_key": preferences_key,
        },
        sort=[("created_at", -1)],
    )

    if not cached:
        return {}

    itinerary = cached.get('itinerary')
    if not itinerary or (isinstance(itinerary, dict) and itinerary.get('error')):
        return {}

    return _serialize_document(cached)


def save_itinerary(user_id, destination, preferences, itinerary):
    itineraries = get_itineraries_collection()
    if itineraries is None:
        return None

    preferences_key, normalized_preferences = _build_preferences_key(preferences)

    itinerary_record = {
        "user_id": user_id,
        "destination": destination,
        "destination_normalized": _normalize_destination_name(destination),
        "preferences": preferences,
        "preferences_normalized": normalized_preferences,
        "preferences_key": preferences_key,
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
