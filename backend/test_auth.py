"""
Auth API Test Script
Tests registration and login endpoints
"""
import sys
import os
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from app import create_app
from database import init_db, get_users_collection
from werkzeug.security import generate_password_hash, check_password_hash
import json

def test_auth():
    print("\n" + "=" * 60)
    print("AUTHENTICATION TEST")
    print("=" * 60 + "\n")
    
    # Create the Flask app
    app = create_app()
    
    with app.test_client() as client:
        # Test 1: Health check
        print("1. Testing health endpoint...")
        response = client.get('/api/health')
        data = json.loads(response.data)
        print(f"   Status: {response.status_code}")
        print(f"   Response: {data['status']}")
        print(f"   Database: {data.get('database', {}).get('status', 'unknown')}")
        
        # Test 2: Registration
        print("\n2. Testing registration...")
        test_user = {
            "name": "Test User",
            "email": "testuser123@example.com",
            "password": "testpassword123"
        }
        response = client.post(
            '/api/auth/register',
            data=json.dumps(test_user),
            content_type='application/json'
        )
        data = json.loads(response.data)
        print(f"   Status: {response.status_code}")
        
        if response.status_code == 201:
            print(f"   Message: {data.get('message')}")
            print(f"   User ID: {data.get('user', {}).get('id')}")
            print(f"   Token received: {'Yes' if data.get('token') else 'No'}")
            token = data.get('token')
        elif response.status_code == 409:
            print(f"   User already exists - testing login instead")
            token = None
        else:
            print(f"   Error: {data.get('error')}")
            token = None
        
        # Test 3: Login
        print("\n3. Testing login...")
        login_data = {
            "email": "testuser123@example.com",
            "password": "testpassword123"
        }
        response = client.post(
            '/api/auth/login',
            data=json.dumps(login_data),
            content_type='application/json'
        )
        data = json.loads(response.data)
        print(f"   Status: {response.status_code}")
        
        if response.status_code == 200:
            print(f"   Message: {data.get('message')}")
            print(f"   User: {data.get('user', {}).get('name')}")
            print(f"   Token received: {'Yes' if data.get('token') else 'No'}")
            token = data.get('token')
        else:
            print(f"   Error: {data.get('error')}")
        
        # Test 4: Get current user (authenticated)
        if token:
            print("\n4. Testing authenticated request (get user info)...")
            response = client.get(
                '/api/auth/me',
                headers={'Authorization': f'Bearer {token}'}
            )
            data = json.loads(response.data)
            print(f"   Status: {response.status_code}")
            if response.status_code == 200:
                user = data.get('user', {})
                print(f"   Name: {user.get('name')}")
                print(f"   Email: {user.get('email')}")
            else:
                print(f"   Error: {data.get('error')}")
        
        # Test 5: Database check
        print("\n5. Verifying user in database...")
        users = get_users_collection()
        if users is not None:
            user = users.find_one({"email": "testuser123@example.com"})
            if user:
                print(f"   User found in database!")
                print(f"   ID: {user.get('_id')}")
                print(f"   Name: {user.get('name')}")
            else:
                print("   User not found in database")
        else:
            print("   Could not access users collection")
    
    print("\n" + "=" * 60)
    print("AUTH TEST COMPLETE")
    print("=" * 60 + "\n")

if __name__ == "__main__":
    test_auth()
