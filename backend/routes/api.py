from flask import Blueprint, request, jsonify
import asyncio
from services.gemini_service import gemini_service
from database import get_comparisons_collection, get_itineraries_collection, health_check as db_health_check, get_connection_status
from datetime import datetime

api_bp = Blueprint('api', __name__)

def run_async(coro):
    """Helper to run async functions in sync context"""
    loop = asyncio.new_event_loop()
    asyncio.set_event_loop(loop)
    try:
        return loop.run_until_complete(coro)
    finally:
        loop.close()

@api_bp.route('/health', methods=['GET'])
def health_check():
    """Health check endpoint with database status"""
    db_status = db_health_check()
    return jsonify({
        "status": "healthy",
        "message": "Wandrix API is running",
        "database": db_status
    })

@api_bp.route('/db/status', methods=['GET'])
def database_status():
    """Detailed database connection status"""
    return jsonify(get_connection_status())

@api_bp.route('/destination/info', methods=['POST'])
def get_destination_info():
    """Get detailed information about a destination"""
    data = request.get_json()
    
    if not data or 'destination' not in data:
        return jsonify({"error": "Destination name is required"}), 400
    
    destination = data['destination']
    
    try:
        result = run_async(gemini_service.get_destination_info(destination))
        return jsonify(result)
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@api_bp.route('/destination/highlights', methods=['POST'])
def get_destination_highlights():
    """Get special highlights of a destination"""
    data = request.get_json()
    
    if not data or 'destination' not in data:
        return jsonify({"error": "Destination name is required"}), 400
    
    destination = data['destination']
    
    try:
        result = run_async(gemini_service.get_destination_highlights(destination))
        return jsonify(result)
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@api_bp.route('/compare', methods=['POST'])
def compare_destinations():
    """Compare two destinations based on user preferences"""
    data = request.get_json()
    
    required_fields = ['destination1', 'destination2', 'preferences']
    for field in required_fields:
        if field not in data:
            return jsonify({"error": f"Missing required field: {field}"}), 400
    
    try:
        result = run_async(gemini_service.compare_destinations(
            data['destination1'],
            data['destination2'],
            data['preferences']
        ))
        
        # Save to database
        comparison_record = {
            "destination1": data['destination1'],
            "destination2": data['destination2'],
            "preferences": data['preferences'],
            "result": result,
            "created_at": datetime.utcnow()
        }
        
        try:
            comparisons = get_comparisons_collection()
            if comparisons is not None:
                comparisons.insert_one(comparison_record)
        except Exception as db_error:
            print(f"Database save error: {db_error}")
        
        return jsonify(result)
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@api_bp.route('/itinerary/generate', methods=['POST'])
def generate_itinerary():
    """Generate a personalized travel itinerary"""
    data = request.get_json()
    
    if not data or 'destination' not in data:
        return jsonify({"error": "Destination is required"}), 400
    
    preferences = data.get('preferences', {
        'travel_duration': 7,
        'budget': 'medium',
        'interests': ['general tourism'],
        'travel_type': 'solo'
    })
    
    try:
        result = run_async(gemini_service.generate_itinerary(
            data['destination'],
            preferences
        ))
        
        # Save to database
        itinerary_record = {
            "destination": data['destination'],
            "preferences": preferences,
            "itinerary": result,
            "created_at": datetime.utcnow()
        }
        
        try:
            itineraries = get_itineraries_collection()
            if itineraries is not None:
                inserted = itineraries.insert_one(itinerary_record)
                result['itinerary_id'] = str(inserted.inserted_id)
        except Exception as db_error:
            print(f"Database save error: {db_error}")
        
        return jsonify(result)
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@api_bp.route('/itinerary/<itinerary_id>', methods=['GET'])
def get_itinerary(itinerary_id):
    """Get a saved itinerary by ID"""
    from bson import ObjectId
    
    try:
        itineraries = get_itineraries_collection()
        if itineraries is None:
            return jsonify({"error": "Database not available"}), 500
        
        itinerary = itineraries.find_one({"_id": ObjectId(itinerary_id)})
        
        if not itinerary:
            return jsonify({"error": "Itinerary not found"}), 404
        
        itinerary['_id'] = str(itinerary['_id'])
        return jsonify(itinerary)
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@api_bp.route('/comparisons/history', methods=['GET'])
def get_comparison_history():
    """Get recent comparison history"""
    try:
        comparisons = get_comparisons_collection()
        if comparisons is None:
            return jsonify({"error": "Database not available"}), 500
        
        history = list(comparisons.find().sort("created_at", -1).limit(10))
        
        for item in history:
            item['_id'] = str(item['_id'])
        
        return jsonify({"history": history})
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# Popular destinations data
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
    {"name": "Santorini", "country": "Greece", "image": "santorini.jpg", "tagline": "Jewel of the Aegean"}
]

@api_bp.route('/destinations/popular', methods=['GET'])
def get_popular_destinations():
    """Get list of popular destinations"""
    return jsonify({"destinations": POPULAR_DESTINATIONS})
