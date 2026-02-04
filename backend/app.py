from flask import Flask
from flask_cors import CORS
from config import Config
from database import init_db
from routes.api import api_bp
from routes.auth import auth_bp
import sys

def create_app():
    """Application factory function"""
    app = Flask(__name__)
    app.config.from_object(Config)
    
    # Enable CORS for React frontend
    CORS(app, resources={
        r"/api/*": {
            "origins": ["http://localhost:5173", "http://localhost:3000", "*"],
            "methods": ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
            "allow_headers": ["Content-Type", "Authorization"]
        }
    })
    
    # Initialize database
    try:
        init_db()
    except Exception as e:
        print(f"[APP] Database initialization error: {e}")
    
    # Register blueprints
    app.register_blueprint(api_bp, url_prefix='/api')
    app.register_blueprint(auth_bp, url_prefix='/api/auth')
    
    @app.route('/')
    def index():
        return {
            "message": "Welcome to Wandrix API",
            "version": "1.0.0",
            "endpoints": {
                "health": "/api/health",
                "destination_info": "/api/destination/info",
                "destination_highlights": "/api/destination/highlights",
                "compare": "/api/compare",
                "generate_itinerary": "/api/itinerary/generate",
                "popular_destinations": "/api/destinations/popular"
            }
        }
    
    return app

if __name__ == '__main__':
    print("[APP] Starting Wandrix Backend Server...")
    app = create_app()
    print("[APP] Server starting on http://0.0.0.0:5000")
    app.run(host='0.0.0.0', port=5000, debug=False, threaded=True, use_reloader=False)
