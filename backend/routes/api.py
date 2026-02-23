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
    get_recent_cached_comparison,
    get_user_comparison_history,
    get_user_itinerary_history,
    get_user_itinerary_by_id,
)
from services.destination_cache_service import (
    get_destination_cache,
    upsert_destination_cache,
    normalize_destination_name,
    ensure_popular_destinations_seeded,
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
        destination_name = payload.destination
        destination_key = normalize_destination_name(destination_name)

        popular_item = next(
            (item for item in POPULAR_DESTINATIONS if normalize_destination_name(item['name']) == destination_key),
            None,
        )

        cached = get_destination_cache(destination_name)
        if cached is None:
            return error_response('Database not available', 500)

        if cached and cached.get('highlights'):
            return success_response(cached.get('highlights'), 'Destination highlights fetched from cache')

        if popular_item:
            seeded = POPULAR_DESTINATION_DETAILS.get(popular_item['name'])
            if seeded:
                saved = upsert_destination_cache(
                    destination_name=popular_item['name'],
                    country=popular_item.get('country'),
                    tagline=popular_item.get('tagline'),
                    highlights=seeded,
                    source='seed',
                )
                if saved is None:
                    return error_response('Database not available', 500)
                return success_response(seeded, 'Destination highlights fetched from database')

        result = run_async(gemini_service.get_destination_highlights(destination_name))
        if result and not result.get('error'):
            upsert_destination_cache(
                destination_name=destination_name,
                country=popular_item.get('country') if popular_item else None,
                tagline=popular_item.get('tagline') if popular_item else result.get('tagline'),
                highlights=result,
                source='ai',
            )
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

        cached = get_recent_cached_comparison(
            payload.destination1,
            payload.destination2,
            limit=20,
        )
        if cached is None:
            return error_response('Database not available', 500)

        if cached:
            comparison_record = save_comparison(
                user_id=user_id,
                destination1=payload.destination1,
                destination2=payload.destination2,
                preferences=payload.preferences.model_dump(),
                result=cached.get('result'),
                source='cache',
                cache_hit=True,
            )
            if comparison_record is None:
                return error_response('Database not available', 500)

            return success_response(
                {"comparison": comparison_record, "cache_hit": True},
                'Comparison fetched from recent cache',
                200,
            )

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
            source='ai',
            cache_hit=False,
        )
        if comparison_record is None:
            return error_response('Database not available', 500)

        return success_response(
            {"comparison": comparison_record, "cache_hit": False},
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
    destinations = ensure_popular_destinations_seeded(POPULAR_DESTINATIONS)
    if destinations is None:
        return error_response('Database not available', 500)

    if not destinations:
        return success_response({"destinations": POPULAR_DESTINATIONS}, 'Popular destinations fetched')

    name_to_default = {item['name'].lower(): item for item in POPULAR_DESTINATIONS}
    merged = []
    for item in destinations:
        default = name_to_default.get(item.get('name', '').lower(), {})
        merged.append({
            "name": item.get('name') or default.get('name'),
            "country": item.get('country') or default.get('country'),
            "tagline": item.get('tagline') or default.get('tagline'),
        })

    return success_response({"destinations": merged}, 'Popular destinations fetched from database')


POPULAR_DESTINATION_DETAILS = {
    "Paris": {
        "destination": "Paris",
        "tagline": "City of Love",
        "cultural_highlights": {
            "history": "Paris is known for art, fashion, and centuries of European history.",
            "traditions": ["Café culture", "Bastille Day celebrations", "Evening Seine walks"],
            "festivals": ["Paris Fashion Week", "Fête de la Musique", "Nuit Blanche"],
            "art_and_architecture": "From the Louvre to Gothic cathedrals and Belle Époque boulevards."
        },
        "famous_attractions": [
            {"name": "Eiffel Tower", "description": "Iconic symbol of Paris.", "why_visit": "Panoramic city views", "best_time": "Sunset"},
            {"name": "Louvre Museum", "description": "World-renowned museum.", "why_visit": "Historic masterpieces", "best_time": "Morning"}
        ],
        "culinary_experiences": {
            "must_try_dishes": ["Croissant", "Crème brûlée", "French onion soup"],
            "food_markets": ["Marché Bastille", "Rue Cler"],
            "dining_experiences": ["Seine dinner cruise", "Classic bistro dining"]
        },
        "exclusive_experiences": [{"experience": "Seine cruise", "description": "Scenic city cruise", "best_for": "Couples"}],
        "hidden_gems": ["Canal Saint-Martin", "Montmartre side streets"],
        "photo_spots": ["Trocadéro", "Pont Alexandre III"],
        "local_tips": ["Book museum tickets in advance", "Use metro day passes"]
    },
    "Tokyo": {
        "destination": "Tokyo",
        "tagline": "Where Tradition Meets Future",
        "cultural_highlights": {
            "history": "Tokyo blends imperial heritage with world-leading innovation.",
            "traditions": ["Tea ceremonies", "Temple visits", "Seasonal festivals"],
            "festivals": ["Sanja Matsuri", "Sumida Fireworks", "Kanda Matsuri"],
            "art_and_architecture": "Modern skylines alongside historic shrines and neighborhoods."
        },
        "famous_attractions": [
            {"name": "Shibuya Crossing", "description": "Famous urban crossing.", "why_visit": "Electric city atmosphere", "best_time": "Evening"},
            {"name": "Senso-ji", "description": "Historic temple in Asakusa.", "why_visit": "Traditional culture", "best_time": "Morning"}
        ],
        "culinary_experiences": {
            "must_try_dishes": ["Sushi", "Ramen", "Tempura"],
            "food_markets": ["Toyosu Market", "Ameyoko"],
            "dining_experiences": ["Izakaya hopping", "Omakase dinner"]
        },
        "exclusive_experiences": [{"experience": "Anime district tour", "description": "Akihabara culture walk", "best_for": "Pop-culture travelers"}],
        "hidden_gems": ["Yanaka", "Kichijoji"],
        "photo_spots": ["Tokyo Skytree", "Shinjuku skyline"],
        "local_tips": ["Get a transit IC card", "Avoid rush hour trains"]
    },
    "Bali": {
        "destination": "Bali",
        "tagline": "Island of Gods",
        "cultural_highlights": {
            "history": "Bali is known for Hindu traditions, temples, and arts.",
            "traditions": ["Temple offerings", "Traditional dance", "Village ceremonies"],
            "festivals": ["Nyepi", "Galungan", "Kuningan"],
            "art_and_architecture": "Temple gates, stone carvings, and lush rice terrace landscapes."
        },
        "famous_attractions": [
            {"name": "Uluwatu Temple", "description": "Clifftop sea temple.", "why_visit": "Sunset and Kecak dance", "best_time": "Late afternoon"},
            {"name": "Tegallalang Rice Terrace", "description": "Iconic terraces.", "why_visit": "Scenic views", "best_time": "Morning"}
        ],
        "culinary_experiences": {
            "must_try_dishes": ["Nasi goreng", "Babi guling", "Satay"],
            "food_markets": ["Ubud Market", "Sanur Night Market"],
            "dining_experiences": ["Beachside seafood dinner", "Jungle café brunch"]
        },
        "exclusive_experiences": [{"experience": "Sunrise trek", "description": "Mount Batur hike", "best_for": "Adventure travelers"}],
        "hidden_gems": ["Sidemen Valley", "Amed"],
        "photo_spots": ["Lempuyang Gate", "Campuhan Ridge"],
        "local_tips": ["Carry cash for small vendors", "Respect temple dress codes"]
    },
    "New York": {"destination": "New York", "tagline": "The City That Never Sleeps", "cultural_highlights": {"history": "Global cultural capital with deep immigrant history.", "traditions": ["Broadway nights", "Neighborhood food tours"], "festivals": ["Macy's Parade", "Tribeca Festival"], "art_and_architecture": "Skyscrapers, museums, and iconic bridges."}, "famous_attractions": [{"name": "Central Park", "description": "Urban green landmark.", "why_visit": "Relax and explore", "best_time": "Morning"}], "culinary_experiences": {"must_try_dishes": ["Bagel", "NY pizza", "Cheesecake"], "food_markets": ["Chelsea Market"], "dining_experiences": ["Rooftop dining"]}, "exclusive_experiences": [{"experience": "Broadway show", "description": "World-class theater", "best_for": "Culture lovers"}], "hidden_gems": ["DUMBO waterfront"], "photo_spots": ["Top of the Rock"], "local_tips": ["Use subway for speed"]},
    "Rome": {"destination": "Rome", "tagline": "Eternal City", "cultural_highlights": {"history": "Center of the Roman Empire and Renaissance heritage.", "traditions": ["Piazza gatherings", "Sunday passeggiata"], "festivals": ["Estate Romana"], "art_and_architecture": "Ancient ruins and Baroque churches."}, "famous_attractions": [{"name": "Colosseum", "description": "Ancient amphitheater.", "why_visit": "Historic significance", "best_time": "Morning"}], "culinary_experiences": {"must_try_dishes": ["Carbonara", "Cacio e pepe"], "food_markets": ["Campo de' Fiori"], "dining_experiences": ["Trattoria dinner"]}, "exclusive_experiences": [{"experience": "Vatican tour", "description": "Art and history", "best_for": "History enthusiasts"}], "hidden_gems": ["Trastevere alleys"], "photo_spots": ["Pincian Terrace"], "local_tips": ["Prebook major attractions"]},
    "Dubai": {"destination": "Dubai", "tagline": "City of Gold", "cultural_highlights": {"history": "From trading port to futuristic metropolis.", "traditions": ["Souk shopping", "Desert hospitality"], "festivals": ["Dubai Shopping Festival"], "art_and_architecture": "Skyscrapers and contemporary design."}, "famous_attractions": [{"name": "Burj Khalifa", "description": "World's tallest tower.", "why_visit": "Skyline views", "best_time": "Sunset"}], "culinary_experiences": {"must_try_dishes": ["Machboos", "Luqaimat"], "food_markets": ["Global Village"], "dining_experiences": ["Desert dinner safari"]}, "exclusive_experiences": [{"experience": "Desert safari", "description": "Dunes and camp dinner", "best_for": "Adventure + families"}], "hidden_gems": ["Al Seef"], "photo_spots": ["Dubai Marina"], "local_tips": ["Plan indoor activities in summer"]},
    "Sydney": {"destination": "Sydney", "tagline": "Harbor City", "cultural_highlights": {"history": "Coastal city with indigenous and colonial heritage.", "traditions": ["Beach culture", "Harbor walks"], "festivals": ["Vivid Sydney"], "art_and_architecture": "Opera House and modern waterfront design."}, "famous_attractions": [{"name": "Sydney Opera House", "description": "Architectural icon.", "why_visit": "Culture and views", "best_time": "Evening"}], "culinary_experiences": {"must_try_dishes": ["Meat pie", "Barramundi"], "food_markets": ["The Rocks Market"], "dining_experiences": ["Harbor-side dining"]}, "exclusive_experiences": [{"experience": "BridgeClimb", "description": "Harbor Bridge climb", "best_for": "Thrill seekers"}], "hidden_gems": ["Wendy's Secret Garden"], "photo_spots": ["Mrs Macquarie's Chair"], "local_tips": ["Use Opal card for transit"]},
    "Maldives": {"destination": "Maldives", "tagline": "Paradise on Earth", "cultural_highlights": {"history": "Island nation known for reefs and luxury escapes.", "traditions": ["Island crafts", "Fishing culture"], "festivals": ["National Day events"], "art_and_architecture": "Overwater villas and tropical seascapes."}, "famous_attractions": [{"name": "Baa Atoll", "description": "UNESCO biosphere reserve.", "why_visit": "Marine life", "best_time": "Nov-Apr"}], "culinary_experiences": {"must_try_dishes": ["Mas huni", "Garudhiya"], "food_markets": ["Malé fish market"], "dining_experiences": ["Underwater restaurant"]}, "exclusive_experiences": [{"experience": "Snorkeling safari", "description": "Coral reef discovery", "best_for": "Couples + families"}], "hidden_gems": ["Local island guesthouses"], "photo_spots": ["Sandbanks"], "local_tips": ["Book transfers in advance"]},
    "Barcelona": {"destination": "Barcelona", "tagline": "City of Gaudi", "cultural_highlights": {"history": "Mediterranean city rich in Catalan culture.", "traditions": ["Tapas evenings", "La Mercè festivities"], "festivals": ["La Mercè"], "art_and_architecture": "Gaudí masterpieces and Gothic Quarter."}, "famous_attractions": [{"name": "Sagrada Família", "description": "Gaudí basilica.", "why_visit": "Unique architecture", "best_time": "Morning"}], "culinary_experiences": {"must_try_dishes": ["Paella", "Patatas bravas"], "food_markets": ["La Boqueria"], "dining_experiences": ["Tapas crawl"]}, "exclusive_experiences": [{"experience": "Montserrat day trip", "description": "Mountain monastery", "best_for": "Nature and culture"}], "hidden_gems": ["Bunkers del Carmel"], "photo_spots": ["Park Güell"], "local_tips": ["Watch for pickpockets in busy areas"]},
    "Singapore": {"destination": "Singapore", "tagline": "Garden City", "cultural_highlights": {"history": "Multicultural city-state and global trade hub.", "traditions": ["Hawker dining", "Festive light-ups"], "festivals": ["Chinese New Year", "Deepavali"], "art_and_architecture": "Futuristic skyline with green urbanism."}, "famous_attractions": [{"name": "Gardens by the Bay", "description": "Futuristic garden park.", "why_visit": "Iconic supertrees", "best_time": "Evening"}], "culinary_experiences": {"must_try_dishes": ["Hainanese chicken rice", "Laksa"], "food_markets": ["Maxwell Food Centre"], "dining_experiences": ["Rooftop skyline dining"]}, "exclusive_experiences": [{"experience": "Night Safari", "description": "After-dark wildlife park", "best_for": "Families"}], "hidden_gems": ["Tiong Bahru"], "photo_spots": ["Marina Bay"], "local_tips": ["Use MRT for fast travel"]},
    "London": {"destination": "London", "tagline": "The Great Wen", "cultural_highlights": {"history": "Historic capital with global arts and finance influence.", "traditions": ["Afternoon tea", "Pub culture"], "festivals": ["Notting Hill Carnival"], "art_and_architecture": "Historic landmarks and modern towers."}, "famous_attractions": [{"name": "Tower Bridge", "description": "Iconic river bridge.", "why_visit": "City views", "best_time": "Golden hour"}], "culinary_experiences": {"must_try_dishes": ["Fish and chips", "Sunday roast"], "food_markets": ["Borough Market"], "dining_experiences": ["West End dinner + show"]}, "exclusive_experiences": [{"experience": "Museum late hours", "description": "After-hours exhibits", "best_for": "Culture lovers"}], "hidden_gems": ["Little Venice"], "photo_spots": ["Primrose Hill"], "local_tips": ["Use contactless card on transport"]},
    "Santorini": {"destination": "Santorini", "tagline": "Jewel of the Aegean", "cultural_highlights": {"history": "Volcanic island with Cycladic heritage.", "traditions": ["Sunset viewing", "Island village life"], "festivals": ["Ifestia Festival"], "art_and_architecture": "Whitewashed cliffside architecture."}, "famous_attractions": [{"name": "Oia", "description": "Cliffside village.", "why_visit": "Sunset panoramas", "best_time": "Evening"}], "culinary_experiences": {"must_try_dishes": ["Fava", "Tomatokeftedes"], "food_markets": ["Fira local shops"], "dining_experiences": ["Caldera-view dinner"]}, "exclusive_experiences": [{"experience": "Catamaran cruise", "description": "Volcanic beaches and sunset", "best_for": "Couples"}], "hidden_gems": ["Pyrgos"], "photo_spots": ["Oia blue domes"], "local_tips": ["Visit early to avoid crowds"]}
}
