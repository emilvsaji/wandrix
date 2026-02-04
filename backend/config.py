import os
from dotenv import load_dotenv

load_dotenv()

class Config:
    """Application configuration class"""
    
    # MongoDB Atlas
    MONGODB_URI = os.getenv('MONGODB_URI', 'mongodb://localhost:27017/wandrix')
    
    # Gemini API
    GEMINI_API_KEY = os.getenv('GEMINI_API_KEY', '')
    
    # Flask
    SECRET_KEY = os.getenv('SECRET_KEY', 'dev-secret-key')
    DEBUG = os.getenv('FLASK_DEBUG', 'True').lower() == 'true'
    
    # JWT Configuration
    JWT_SECRET = os.getenv('JWT_SECRET', 'wandrix-jwt-secret-key-super-secure-2026')
    JWT_EXPIRATION_HOURS = int(os.getenv('JWT_EXPIRATION_HOURS', '24'))