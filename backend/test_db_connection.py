"""
MongoDB Connection Test Script
Run this to verify the database connection is working properly
"""

import sys
import os

# Add the backend directory to the path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from database import init_db, health_check, get_users_collection, get_connection_status

def test_connection():
    print("\n" + "=" * 60)
    print("MONGODB CONNECTION TEST")
    print("=" * 60 + "\n")
    
    # Initialize the database
    print("1. Initializing database connection...")
    db = init_db()
    
    print("\n2. Checking connection status...")
    status = get_connection_status()
    print(f"   Connected: {status['connected']}")
    print(f"   Mode: {status['mode']}")
    print(f"   Database: {status['database']}")
    
    print("\n3. Running health check...")
    health = health_check()
    print(f"   Status: {health['status']}")
    print(f"   Mode: {health['mode']}")
    if 'details' in health:
        for key, value in health['details'].items():
            print(f"   {key}: {value}")
    
    print("\n4. Testing users collection...")
    users = get_users_collection()
    if users is not None:
        print(f"   Users collection available: Yes")
        try:
            # Try to count documents
            count = users.count_documents({}) if hasattr(users, 'count_documents') else len(users.find({}))
            print(f"   Current user count: {count}")
        except Exception as e:
            print(f"   Error counting users: {e}")
    else:
        print("   Users collection available: No")
    
    print("\n" + "=" * 60)
    if status['connected']:
        print("SUCCESS: MongoDB Atlas is connected!")
    else:
        print("FALLBACK: Using file-based storage")
    print("=" * 60 + "\n")
    
    return status['connected']

if __name__ == "__main__":
    success = test_connection()
    sys.exit(0 if success else 1)
