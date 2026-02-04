# Wandrix Backend API

AI-powered Tourism Recommendation and Planning System Backend

## Setup

1. Create a virtual environment:
```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

2. Install dependencies:
```bash
pip install -r requirements.txt
```

3. Set up environment variables:
```bash
cp .env.example .env
# Edit .env with your actual API keys
```

4. Make sure MongoDB is running locally or update MONGODB_URI in .env

5. Run the application:
```bash
python app.py
```

## API Endpoints

### Health Check
- `GET /api/health` - Check if the API is running

### Destinations
- `POST /api/destination/info` - Get detailed info about a destination
- `POST /api/destination/highlights` - Get special highlights of a destination
- `GET /api/destinations/popular` - Get list of popular destinations

### Comparison
- `POST /api/compare` - Compare two destinations based on preferences
- `GET /api/comparisons/history` - Get recent comparison history

### Itinerary
- `POST /api/itinerary/generate` - Generate a personalized travel itinerary
- `GET /api/itinerary/<id>` - Get a saved itinerary

## Example Requests

### Compare Destinations
```json
POST /api/compare
{
    "destination1": "Paris",
    "destination2": "Tokyo",
    "preferences": {
        "budget": "medium",
        "travel_duration": 7,
        "interests": ["culture", "food", "history"],
        "season": "spring",
        "travel_type": "couple"
    }
}
```

### Generate Itinerary
```json
POST /api/itinerary/generate
{
    "destination": "Paris",
    "preferences": {
        "travel_duration": 5,
        "budget": "medium",
        "interests": ["art", "food", "romance"],
        "travel_type": "couple"
    }
}
```
