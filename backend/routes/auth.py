from flask import Blueprint, request, jsonify
from werkzeug.security import generate_password_hash, check_password_hash
from database import get_users_collection, get_db
from config import Config
from datetime import datetime, timedelta
from bson import ObjectId
from bson.errors import InvalidId
import jwt
import os
import traceback

auth_bp = Blueprint('auth', __name__)

# Secret key for JWT - use from config
JWT_SECRET = Config.JWT_SECRET
JWT_EXPIRATION_HOURS = Config.JWT_EXPIRATION_HOURS

def generate_token(user_id):
    """Generate JWT token for user"""
    payload = {
        'user_id': str(user_id),
        'exp': datetime.utcnow() + timedelta(hours=JWT_EXPIRATION_HOURS),
        'iat': datetime.utcnow()
    }
    return jwt.encode(payload, JWT_SECRET, algorithm='HS256')

def verify_token(token):
    """Verify JWT token and return user_id"""
    try:
        payload = jwt.decode(token, JWT_SECRET, algorithms=['HS256'])
        return payload['user_id']
    except jwt.ExpiredSignatureError:
        print("[AUTH] Token expired")
        return None
    except jwt.InvalidTokenError as e:
        print(f"[AUTH] Invalid token: {e}")
        return None

def get_current_user():
    """Get current user from Authorization header"""
    auth_header = request.headers.get('Authorization')
    if not auth_header or not auth_header.startswith('Bearer '):
        return None
    
    token = auth_header.split(' ')[1]
    user_id = verify_token(token)
    
    if not user_id:
        return None
    
    users = get_users_collection()
    if users is None:
        print("[AUTH] Users collection not available")
        return None
    
    try:
        # Try with ObjectId for MongoDB
        try:
            user = users.find_one({"_id": ObjectId(user_id)})
        except (InvalidId, Exception):
            # Fall back to string for file-based storage
            user = users.find_one({"_id": user_id})
        
        if user:
            user['_id'] = str(user['_id'])
        return user
    except Exception as e:
        print(f"[AUTH] Error getting user: {e}")
        return None

@auth_bp.route('/register', methods=['POST'])
def register():
    """Register a new user"""
    try:
        data = request.get_json()
        
        if not data:
            return jsonify({"error": "No data provided"}), 400
        
        required_fields = ['email', 'password', 'name']
        for field in required_fields:
            if field not in data or not data[field]:
                return jsonify({"error": f"Missing required field: {field}"}), 400
        
        email = data['email'].lower().strip()
        password = data['password']
        name = data['name'].strip()
        
        # Validate email format
        if '@' not in email or '.' not in email:
            return jsonify({"error": "Invalid email format"}), 400
        
        # Validate password length
        if len(password) < 6:
            return jsonify({"error": "Password must be at least 6 characters"}), 400
        
        users = get_users_collection()
        if users is None:
            print("[AUTH] Database not available for registration")
            return jsonify({"error": "Database not available. Please try again later."}), 500
        
        # Check if user already exists
        existing_user = users.find_one({"email": email})
        if existing_user:
            return jsonify({"error": "Email already registered"}), 409
        
        # Create new user document
        user_doc = {
            "email": email,
            "password": generate_password_hash(password),
            "name": name,
            "wishlist": [],
            "created_at": datetime.utcnow()
        }
        
        result = users.insert_one(user_doc)
        user_id = result.inserted_id
        token = generate_token(user_id)
        
        print(f"[AUTH] User registered successfully: {email}")
        
        return jsonify({
            "message": "Registration successful",
            "token": token,
            "user": {
                "id": str(user_id),
                "email": email,
                "name": name
            }
        }), 201
        
    except Exception as e:
        print(f"[AUTH] Registration error: {e}")
        traceback.print_exc()
        return jsonify({"error": "Registration failed. Please try again."}), 500

@auth_bp.route('/login', methods=['POST'])
def login():
    """Login user"""
    try:
        data = request.get_json()
        
        if not data or 'email' not in data or 'password' not in data:
            return jsonify({"error": "Email and password are required"}), 400
        
        email = data['email'].lower().strip()
        password = data['password']
        
        users = get_users_collection()
        if users is None:
            print("[AUTH] Database not available for login")
            return jsonify({"error": "Database not available. Please try again later."}), 500
        
        user = users.find_one({"email": email})
        
        if not user:
            print(f"[AUTH] Login failed - user not found: {email}")
            return jsonify({"error": "Invalid email or password"}), 401
        
        if not check_password_hash(user['password'], password):
            print(f"[AUTH] Login failed - invalid password for: {email}")
            return jsonify({"error": "Invalid email or password"}), 401
        
        token = generate_token(user['_id'])
        
        print(f"[AUTH] User logged in successfully: {email}")
        
        return jsonify({
            "message": "Login successful",
            "token": token,
            "user": {
                "id": str(user['_id']),
                "email": user['email'],
                "name": user['name']
            }
        })
        
    except Exception as e:
        print(f"[AUTH] Login error: {e}")
        traceback.print_exc()
        return jsonify({"error": "Login failed. Please try again."}), 500
    
    return jsonify({
        "message": "Login successful",
        "token": token,
        "user": {
            "id": str(user['_id']),
            "email": user['email'],
            "name": user['name']
        }
    })

@auth_bp.route('/me', methods=['GET'])
def get_me():
    """Get current user info"""
    user = get_current_user()
    
    if not user:
        return jsonify({"error": "Unauthorized"}), 401
    
    return jsonify({
        "user": {
            "id": user['_id'],
            "email": user['email'],
            "name": user['name'],
            "wishlist": user.get('wishlist', [])
        }
    })

@auth_bp.route('/wishlist', methods=['GET'])
def get_wishlist():
    """Get user's wishlist"""
    user = get_current_user()
    
    if not user:
        return jsonify({"error": "Unauthorized"}), 401
    
    return jsonify({
        "wishlist": user.get('wishlist', [])
    })

@auth_bp.route('/wishlist/add', methods=['POST'])
def add_to_wishlist():
    """Add a destination to wishlist"""
    user = get_current_user()
    
    if not user:
        return jsonify({"error": "Unauthorized"}), 401
    
    data = request.get_json()
    
    if not data or 'destination' not in data:
        return jsonify({"error": "Destination is required"}), 400
    
    destination = data['destination']
    
    # Ensure destination has required fields
    if not isinstance(destination, dict) or 'name' not in destination:
        return jsonify({"error": "Invalid destination format"}), 400
    
    users = get_users_collection()
    if users is None:
        return jsonify({"error": "Database not available"}), 500
    
    # Check if already in wishlist
    current_wishlist = user.get('wishlist', [])
    for item in current_wishlist:
        if item.get('name') == destination['name']:
            return jsonify({"error": "Destination already in wishlist"}), 409
    
    # Add timestamp
    destination['added_at'] = datetime.utcnow().isoformat()
    
    try:
        # Try with ObjectId for MongoDB, fall back to string for file-based
        try:
            users.update_one(
                {"_id": ObjectId(user['_id'])},
                {"$push": {"wishlist": destination}}
            )
        except:
            users.update_one(
                {"_id": user['_id']},
                {"$push": {"wishlist": destination}}
            )
        
        return jsonify({
            "message": "Added to wishlist",
            "destination": destination
        })
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@auth_bp.route('/wishlist/remove', methods=['POST'])
def remove_from_wishlist():
    """Remove a destination from wishlist"""
    user = get_current_user()
    
    if not user:
        return jsonify({"error": "Unauthorized"}), 401
    
    data = request.get_json()
    
    if not data or 'name' not in data:
        return jsonify({"error": "Destination name is required"}), 400
    
    destination_name = data['name']
    
    users = get_users_collection()
    if users is None:
        return jsonify({"error": "Database not available"}), 500
    
    try:
        # Try with ObjectId for MongoDB, fall back to string for file-based
        try:
            users.update_one(
                {"_id": ObjectId(user['_id'])},
                {"$pull": {"wishlist": {"name": destination_name}}}
            )
        except:
            users.update_one(
                {"_id": user['_id']},
                {"$pull": {"wishlist": {"name": destination_name}}}
            )
        
        return jsonify({
            "message": "Removed from wishlist",
            "destination": destination_name
        })
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@auth_bp.route('/wishlist/check/<destination_name>', methods=['GET'])
def check_in_wishlist(destination_name):
    """Check if a destination is in user's wishlist"""
    user = get_current_user()
    
    if not user:
        return jsonify({"in_wishlist": False})
    
    current_wishlist = user.get('wishlist', [])
    for item in current_wishlist:
        if item.get('name') == destination_name:
            return jsonify({"in_wishlist": True})
    
    return jsonify({"in_wishlist": False})
