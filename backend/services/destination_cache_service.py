from datetime import datetime

from database import get_destinations_collection


def _serialize_document(document):
    serialized = dict(document)
    if '_id' in serialized:
        serialized['_id'] = str(serialized['_id'])
    return serialized


def normalize_destination_name(name):
    return (name or '').strip().lower()


def get_destination_cache(destination_name):
    destinations = get_destinations_collection()
    if destinations is None:
        return None

    key = normalize_destination_name(destination_name)
    cached = destinations.find_one({'name_lower': key})
    if not cached:
        return {}

    return _serialize_document(cached)


def upsert_destination_cache(destination_name, country, tagline, highlights, source='ai'):
    destinations = get_destinations_collection()
    if destinations is None:
        return None

    key = normalize_destination_name(destination_name)
    now = datetime.utcnow()

    update_fields = {
        'name': destination_name,
        'name_lower': key,
        'country': country,
        'tagline': tagline,
        'highlights': highlights,
        'source': source,
        'updated_at': now,
    }

    destinations.update_one(
        {'name_lower': key},
        {
            '$set': update_fields,
            '$setOnInsert': {'created_at': now},
        },
        upsert=True,
    )

    updated = destinations.find_one({'name_lower': key})
    return _serialize_document(updated) if updated else {}


def ensure_popular_destinations_seeded(popular_destinations):
    destinations = get_destinations_collection()
    if destinations is None:
        return None

    now = datetime.utcnow()
    for item in popular_destinations:
        name = item.get('name')
        if not name:
            continue

        key = normalize_destination_name(name)
        destinations.update_one(
            {'name_lower': key},
            {
                '$setOnInsert': {
                    'name': name,
                    'name_lower': key,
                    'country': item.get('country'),
                    'tagline': item.get('tagline'),
                    'created_at': now,
                },
                '$set': {
                    'updated_at': now,
                },
            },
            upsert=True,
        )

    result = list(
        destinations.find(
            {'name_lower': {'$in': [normalize_destination_name(item.get('name')) for item in popular_destinations]}},
            {'name': 1, 'country': 1, 'tagline': 1}
        )
    )

    if result:
        mapped = [_serialize_document(item) for item in result]
        mapped.sort(key=lambda x: x.get('name', '').lower())
        return mapped

    return []
