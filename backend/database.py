"""
MongoDB Database Connection Module for Wandrix
==============================================
Advanced connection handling with:
- Automatic reconnection
- Connection pooling
- Health monitoring
- Detailed debugging/logging
- Graceful fallback to file-based storage
"""

from pymongo import MongoClient
from pymongo.errors import (
    ConnectionFailure, 
    ServerSelectionTimeoutError, 
    OperationFailure,
    ConfigurationError,
    NetworkTimeout,
    AutoReconnect
)
from pymongo.server_api import ServerApi
from config import Config
import json
import os
import sys
import time
import threading
import certifi
from datetime import datetime
from bson import ObjectId
from functools import wraps

# ==================== LOGGING & DEBUG ====================

class DatabaseLogger:
    """Custom logger for database operations with color support"""
    
    COLORS = {
        'GREEN': '\033[92m',
        'YELLOW': '\033[93m',
        'RED': '\033[91m',
        'BLUE': '\033[94m',
        'CYAN': '\033[96m',
        'RESET': '\033[0m',
        'BOLD': '\033[1m'
    }
    
    @staticmethod
    def _timestamp():
        return datetime.now().strftime('%Y-%m-%d %H:%M:%S')
    
    @classmethod
    def success(cls, message):
        print(f"{cls.COLORS['GREEN']}[{cls._timestamp()}] SUCCESS: {message}{cls.COLORS['RESET']}")
    
    @classmethod
    def warning(cls, message):
        print(f"{cls.COLORS['YELLOW']}[{cls._timestamp()}] WARNING: {message}{cls.COLORS['RESET']}")
    
    @classmethod
    def error(cls, message):
        print(f"{cls.COLORS['RED']}[{cls._timestamp()}] ERROR: {message}{cls.COLORS['RESET']}")
    
    @classmethod
    def info(cls, message):
        print(f"{cls.COLORS['BLUE']}[{cls._timestamp()}] INFO: {message}{cls.COLORS['RESET']}")
    
    @classmethod
    def debug(cls, message):
        if Config.DEBUG:
            print(f"{cls.COLORS['CYAN']}[{cls._timestamp()}] DEBUG: {message}{cls.COLORS['RESET']}")
    
    @classmethod
    def connection(cls, message):
        print(f"{cls.COLORS['BOLD']}{cls.COLORS['GREEN']}[{cls._timestamp()}] CONNECTION: {message}{cls.COLORS['RESET']}")

log = DatabaseLogger()

# ==================== GLOBAL STATE ====================

_client = None
_db = None
_connection_lock = threading.Lock()
_last_health_check = None
_connection_retries = 0
_max_retries = 3
_is_connected = False

# File-based fallback storage path
USERS_FILE = os.path.join(os.path.dirname(__file__), 'users.json')

# ==================== FILE-BASED FALLBACK ====================

class FileBasedCollection:
    """
    Simple file-based collection for when MongoDB is unavailable.
    Provides basic CRUD operations compatible with PyMongo interface.
    """
    
    def __init__(self, filename):
        self.filename = filename
        self._lock = threading.Lock()
        self._ensure_file()
        log.info(f"File-based collection initialized: {filename}")
    
    def _ensure_file(self):
        """Ensure the storage file exists"""
        if not os.path.exists(self.filename):
            with open(self.filename, 'w') as f:
                json.dump([], f)
            log.debug(f"Created storage file: {self.filename}")
    
    def _read(self):
        """Read all documents from file"""
        with self._lock:
            try:
                with open(self.filename, 'r') as f:
                    data = json.load(f)
                    log.debug(f"Read {len(data)} documents from file")
                    return data
            except json.JSONDecodeError as e:
                log.error(f"JSON decode error: {e}")
                return []
            except Exception as e:
                log.error(f"File read error: {e}")
                return []
    
    def _write(self, data):
        """Write all documents to file"""
        with self._lock:
            try:
                with open(self.filename, 'w') as f:
                    json.dump(data, f, indent=2, default=str)
                log.debug(f"Written {len(data)} documents to file")
            except Exception as e:
                log.error(f"File write error: {e}")
    
    def find_one(self, query):
        """Find a single document matching the query"""
        data = self._read()
        for item in data:
            if self._matches(item, query):
                log.debug(f"Found document matching query: {query}")
                return item
        log.debug(f"No document found for query: {query}")
        return None
    
    def find(self, query=None):
        """Find all documents matching the query"""
        data = self._read()
        if query is None:
            return data
        return [item for item in data if self._matches(item, query)]
    
    def _matches(self, item, query):
        """Check if item matches query"""
        for key, value in query.items():
            if key == '_id':
                if item.get('_id') != str(value):
                    return False
            elif item.get(key) != value:
                return False
        return True
    
    def insert_one(self, document):
        """Insert a single document"""
        data = self._read()
        doc_id = str(ObjectId())
        document['_id'] = doc_id
        document['created_at'] = datetime.utcnow().isoformat()
        data.append(document)
        self._write(data)
        log.debug(f"Inserted document with id: {doc_id}")
        
        class InsertResult:
            def __init__(self, id):
                self.inserted_id = id
        return InsertResult(doc_id)
    
    def update_one(self, query, update, upsert=False):
        """Update a single document"""
        data = self._read()
        updated = False
        
        for i, item in enumerate(data):
            if self._matches(item, query):
                if '$set' in update:
                    for k, v in update['$set'].items():
                        data[i][k] = v
                if '$push' in update:
                    for k, v in update['$push'].items():
                        if k not in data[i]:
                            data[i][k] = []
                        data[i][k].append(v)
                if '$pull' in update:
                    for k, v in update['$pull'].items():
                        if k in data[i]:
                            data[i][k] = [x for x in data[i][k] if x.get('name') != v.get('name')]
                data[i]['updated_at'] = datetime.utcnow().isoformat()
                self._write(data)
                updated = True
                log.debug(f"Updated document matching query: {query}")
                break
        
        if not updated and upsert:
            # Insert new document if not found
            new_doc = {**query}
            if '$set' in update:
                new_doc.update(update['$set'])
            self.insert_one(new_doc)
            updated = True
        
        class UpdateResult:
            def __init__(self, modified):
                self.modified_count = 1 if modified else 0
                self.matched_count = 1 if modified else 0
        
        return UpdateResult(updated)
    
    def delete_one(self, query):
        """Delete a single document"""
        data = self._read()
        for i, item in enumerate(data):
            if self._matches(item, query):
                del data[i]
                self._write(data)
                log.debug(f"Deleted document matching query: {query}")
                
                class DeleteResult:
                    deleted_count = 1
                return DeleteResult()
        
        class DeleteResult:
            deleted_count = 0
        return DeleteResult()
    
    def count_documents(self, query=None):
        """Count documents matching query"""
        if query is None:
            return len(self._read())
        return len(self.find(query))


# Fallback collection instances
_file_users_collection = None

# ==================== CONNECTION MANAGEMENT ====================

def _mask_uri(uri):
    """Mask password in URI for safe logging"""
    if '@' in uri:
        # Find the password portion and mask it
        try:
            start = uri.index('://') + 3
            end = uri.index('@')
            credentials = uri[start:end]
            if ':' in credentials:
                user = credentials.split(':')[0]
                return uri[:start] + user + ':****@' + uri[end+1:]
        except:
            pass
    return uri


def _create_client():
    """Create MongoDB client with optimized settings for Atlas"""
    uri = Config.MONGODB_URI
    log.info(f"Attempting connection to: {_mask_uri(uri)}")
    
    # Connection options optimized for MongoDB Atlas
    client_options = {
        'serverSelectionTimeoutMS': 10000,  # 10 seconds
        'connectTimeoutMS': 10000,           # 10 seconds
        'socketTimeoutMS': 30000,            # 30 seconds
        'maxPoolSize': 50,                   # Maximum connections in pool
        'minPoolSize': 5,                    # Minimum connections to maintain
        'maxIdleTimeMS': 60000,              # Close idle connections after 60s
        'retryWrites': True,                 # Automatic retry for writes
        'retryReads': True,                  # Automatic retry for reads
        'w': 'majority',                     # Write concern
        'tlsCAFile': certifi.where(),        # SSL certificate
        'server_api': ServerApi('1')         # Use Stable API
    }
    
    return MongoClient(uri, **client_options)


def _test_connection(client):
    """Test if the MongoDB connection is healthy"""
    try:
        # Send a ping to confirm successful connection
        client.admin.command('ping')
        
        # Also verify we can access the database
        db = client.wandrix
        
        # Try to list collections (this verifies full access)
        collections = db.list_collection_names()
        log.debug(f"Available collections: {collections}")
        
        return True
    except Exception as e:
        log.error(f"Connection test failed: {e}")
        return False


def init_db():
    """
    Initialize MongoDB connection with retry logic and fallback support.
    
    Returns:
        Database instance or None if using file-based fallback
    """
    global _client, _db, _file_users_collection, _connection_retries, _is_connected
    
    with _connection_lock:
        log.connection("=" * 50)
        log.connection("INITIALIZING DATABASE CONNECTION")
        log.connection("=" * 50)
        
        # Check if URI is configured
        if not Config.MONGODB_URI:
            log.error("MONGODB_URI not configured!")
            _setup_fallback()
            return None
        
        # Try to connect with retries
        for attempt in range(1, _max_retries + 1):
            try:
                log.info(f"Connection attempt {attempt}/{_max_retries}...")
                
                # Create new client
                _client = _create_client()
                
                # Test the connection
                if _test_connection(_client):
                    _db = _client.wandrix
                    _is_connected = True
                    _connection_retries = 0
                    
                    log.connection("=" * 50)
                    log.success("MONGODB ATLAS CONNECTED SUCCESSFULLY!")
                    log.info(f"Database: wandrix")
                    log.info(f"Connection pool: min=5, max=50")
                    
                    # Create indexes for better performance
                    _create_indexes()
                    
                    log.connection("=" * 50)
                    return _db
                else:
                    raise ConnectionFailure("Connection test failed")
                    
            except ConfigurationError as e:
                log.error(f"Configuration error: {e}")
                log.error("Please check your MONGODB_URI format")
                break
                
            except ServerSelectionTimeoutError as e:
                log.warning(f"Attempt {attempt} - Server selection timeout: {e}")
                if attempt < _max_retries:
                    wait_time = attempt * 2  # Exponential backoff
                    log.info(f"Retrying in {wait_time} seconds...")
                    time.sleep(wait_time)
                    
            except ConnectionFailure as e:
                log.warning(f"Attempt {attempt} - Connection failed: {e}")
                if attempt < _max_retries:
                    wait_time = attempt * 2
                    log.info(f"Retrying in {wait_time} seconds...")
                    time.sleep(wait_time)
                    
            except OperationFailure as e:
                log.error(f"Operation failed (authentication?): {e}")
                break
                
            except Exception as e:
                log.error(f"Unexpected error: {type(e).__name__}: {e}")
                if attempt < _max_retries:
                    time.sleep(2)
        
        # All retries failed - setup fallback
        log.warning("All connection attempts failed - using file-based storage")
        _setup_fallback()
        return None


def _setup_fallback():
    """Setup file-based fallback storage"""
    global _file_users_collection, _is_connected, _db
    
    _is_connected = False
    _db = None
    _file_users_collection = FileBasedCollection(USERS_FILE)
    log.warning("=" * 50)
    log.warning("USING FILE-BASED FALLBACK STORAGE")
    log.warning(f"Storage file: {USERS_FILE}")
    log.warning("=" * 50)


def _create_indexes():
    """Create database indexes for better query performance"""
    try:
        if _db is None:
            return
            
        # Users collection indexes
        _db.users.create_index("email", unique=True)
        log.debug("Created index on users.email (unique)")
        
        # Comparisons collection indexes
        _db.comparisons.create_index("created_at")
        log.debug("Created index on comparisons.created_at")
        
        # Itineraries collection indexes
        _db.itineraries.create_index([("destination", 1), ("created_at", -1)])
        log.debug("Created compound index on itineraries")
        
        log.success("Database indexes created successfully")
        
    except Exception as e:
        log.warning(f"Index creation warning (non-fatal): {e}")


# ==================== CONNECTION UTILITIES ====================

def get_db():
    """
    Get the database instance.
    Attempts reconnection if the connection was lost.
    
    Returns:
        Database instance or None
    """
    global _db, _is_connected
    
    if not _is_connected or _db is None:
        # Try to reconnect
        log.warning("Database not connected - attempting reconnection...")
        init_db()
    
    return _db


def get_connection_status():
    """Get detailed connection status for debugging"""
    return {
        'connected': _is_connected,
        'database': 'wandrix' if _db is not None else None,
        'mode': 'mongodb' if _is_connected else 'file-based',
        'client_info': str(_client.server_info()) if _client and _is_connected else None,
        'last_check': _last_health_check.isoformat() if _last_health_check else None
    }


def health_check():
    """
    Perform a health check on the database connection.
    
    Returns:
        dict with health status information
    """
    global _last_health_check
    
    _last_health_check = datetime.utcnow()
    
    result = {
        'timestamp': _last_health_check.isoformat(),
        'status': 'unknown',
        'mode': 'unknown',
        'details': {}
    }
    
    if _is_connected and _client is not None:
        try:
            # Ping the server
            start_time = time.time()
            _client.admin.command('ping')
            latency = (time.time() - start_time) * 1000
            
            result['status'] = 'healthy'
            result['mode'] = 'mongodb_atlas'
            result['details'] = {
                'latency_ms': round(latency, 2),
                'database': 'wandrix',
                'collections': _db.list_collection_names() if _db is not None else []
            }
            log.debug(f"Health check passed - latency: {latency:.2f}ms")
            
        except Exception as e:
            result['status'] = 'unhealthy'
            result['mode'] = 'mongodb_atlas'
            result['details'] = {'error': str(e)}
            log.error(f"Health check failed: {e}")
            
    elif _file_users_collection:
        result['status'] = 'healthy'
        result['mode'] = 'file_based'
        result['details'] = {
            'storage_file': USERS_FILE,
            'user_count': _file_users_collection.count_documents()
        }
    else:
        result['status'] = 'not_initialized'
        result['mode'] = 'none'
    
    return result


# ==================== COLLECTION GETTERS ====================

def get_users_collection():
    """
    Get the users collection.
    Falls back to file-based storage if MongoDB is unavailable.
    
    Returns:
        MongoDB collection or FileBasedCollection instance
    """
    global _file_users_collection
    
    database = get_db()
    if database is not None:
        log.debug("Returning MongoDB users collection")
        return database.users
    
    # Ensure fallback is initialized
    if _file_users_collection is None:
        _file_users_collection = FileBasedCollection(USERS_FILE)
    
    log.debug("Returning file-based users collection")
    return _file_users_collection


def get_destinations_collection():
    """Get the destinations collection (MongoDB only)"""
    database = get_db()
    return database.destinations if database is not None else None


def get_comparisons_collection():
    """Get the comparisons collection (MongoDB only)"""
    database = get_db()
    return database.comparisons if database is not None else None


def get_itineraries_collection():
    """Get the itineraries collection (MongoDB only)"""
    database = get_db()
    return database.itineraries if database is not None else None


# ==================== DECORATOR FOR AUTO-RETRY ====================

def with_retry(max_attempts=3, delay=1):
    """
    Decorator to retry database operations on transient errors.
    
    Usage:
        @with_retry(max_attempts=3)
        def my_db_operation():
            ...
    """
    def decorator(func):
        @wraps(func)
        def wrapper(*args, **kwargs):
            last_error = None
            for attempt in range(1, max_attempts + 1):
                try:
                    return func(*args, **kwargs)
                except (AutoReconnect, NetworkTimeout) as e:
                    last_error = e
                    log.warning(f"Transient error in {func.__name__}, attempt {attempt}: {e}")
                    if attempt < max_attempts:
                        time.sleep(delay * attempt)
                except Exception as e:
                    # Non-transient error, don't retry
                    raise
            raise last_error
        return wrapper
    return decorator


# ==================== CLEANUP ====================

def close_connection():
    """Gracefully close the database connection"""
    global _client, _db, _is_connected
    
    if _client:
        log.info("Closing MongoDB connection...")
        _client.close()
        _client = None
        _db = None
        _is_connected = False
        log.success("Connection closed")


# ==================== INITIALIZATION MESSAGE ====================

log.info("Database module loaded - call init_db() to connect")
