from flask import Flask
from flask_cors import CORS
from config import Config
from database import init_db
from services.admin_seed_service import seed_admin_user
from routes.api import api_bp
from routes.auth import auth_bp
from routes.admin import admin_bp
import sys

def create_app():
    """Application factory function"""
    app = Flask(__name__)
    app.config.from_object(Config)
    
    # Enable CORS for React frontend (all common dev ports)
    CORS(app, resources={
        r"/api/*": {
            "origins": ["http://localhost:5173", "http://localhost:3000", "http://localhost:5050", "http://localhost:5051", "http://localhost:8000", "http://localhost:8080", "*"],
            "methods": ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
            "allow_headers": ["Content-Type", "Authorization"]
        }
    })
    
    # Initialize database
    try:
        init_db()
        seed_admin_user()
    except Exception as e:
        print(f"[APP] Database initialization error: {e}")
    
    # Register blueprints
    app.register_blueprint(api_bp, url_prefix='/api')
    app.register_blueprint(auth_bp, url_prefix='/api/auth')
    app.register_blueprint(admin_bp, url_prefix='/api/admin')
    
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
    import os, socket

    print("[APP] Starting Wandrix Backend Server...")
    app = create_app()

    host = os.getenv('FLASK_HOST', '127.0.0.1')
    port = int(os.getenv('PORT', '8000'))

    # Auto-detect if port is usable; fall back through alternatives
    def _port_available(h, p):
        with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as s:
            try:
                s.bind((h, p))
                return True
            except OSError:
                return False

    if not _port_available(host, port):
        for alt in [5050, 5051, 8000, 8080]:
            if alt != port and _port_available(host, alt):
                print(f"[APP] Port {port} unavailable, using {alt} instead")
                port = alt
                break
        else:
            print(f"[APP] WARNING: Port {port} may be blocked. Trying anyway...")

    print(f"[APP] Server starting on http://{host}:{port}")
    app.run(host=host, port=port, debug=False, threaded=True, use_reloader=False)
