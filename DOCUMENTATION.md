# Wandrix - AI-Powered Tourism Planning Platform

## Complete Project Documentation

---

## Table of Contents

1. [Project Overview](#1-project-overview)
2. [Architecture](#2-architecture)
3. [Technology Stack](#3-technology-stack)
4. [Backend Documentation](#4-backend-documentation)
5. [Frontend Documentation](#5-frontend-documentation)
6. [API Reference](#6-api-reference)
7. [Database Schema](#7-database-schema)
8. [Installation & Setup](#8-installation--setup)
9. [Configuration](#9-configuration)
10. [Development Guide](#10-development-guide)
11. [Deployment](#11-deployment)

---

## 1. Project Overview

### 1.1 Introduction

**Wandrix** is an AI-powered tourism recommendation and planning system that helps travelers make informed decisions about their destinations. The platform leverages Google's Gemini AI to provide intelligent destination comparisons, personalized travel itineraries, and comprehensive destination information.

### 1.2 Key Features

| Feature | Description |
|---------|-------------|
| **Destination Comparison** | Compare two destinations based on user preferences (budget, interests, travel type, season) |
| **AI Itinerary Generation** | Generate day-by-day personalized travel itineraries with activities, meals, and tips |
| **Destination Explorer** | Browse and discover popular tourist destinations worldwide |
| **Destination Information** | Get detailed information about any destination including attractions, costs, and safety |
| **Smart Recommendations** | AI-powered recommendations based on user preferences |

### 1.3 Target Users

- Solo travelers planning trips
- Couples looking for romantic getaways
- Families planning vacations
- Group travelers organizing trips
- Travel enthusiasts exploring new destinations

---

## 2. Architecture

### 2.1 System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         CLIENT LAYER                             │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │              React Frontend (Vite)                       │    │
│  │  - Components: Header, Hero, ComparePage, ExplorePage   │    │
│  │  - Services: API Client                                  │    │
│  │  - Styling: CSS with Custom Properties                   │    │
│  └─────────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────────┘
                              │
                              │ HTTP/REST
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                         SERVER LAYER                             │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │              Flask Backend API                           │    │
│  │  - Routes: /api/destination, /api/compare, /api/itinerary│    │
│  │  - Services: GeminiService                               │    │
│  │  - Models: Pydantic Data Models                          │    │
│  └─────────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────────┘
                              │
              ┌───────────────┴───────────────┐
              │                               │
              ▼                               ▼
┌─────────────────────────┐     ┌─────────────────────────┐
│      MongoDB            │     │    Google Gemini AI     │
│   - comparisons         │     │    - gemini-2.5-flash   │
│   - itineraries         │     │    - Content Generation │
│   - destinations        │     └─────────────────────────┘
└─────────────────────────┘
```

### 2.2 Data Flow

```
User Input → React Frontend → API Client → Flask Backend → Gemini AI
                                                ↓
User Display ← React Components ← JSON Response ← MongoDB (optional save)
```

---

## 3. Technology Stack

### 3.1 Frontend

| Technology | Version | Purpose |
|------------|---------|---------|
| React | 19.2.0 | UI Framework |
| Vite (Rolldown) | 7.2.5 | Build Tool & Dev Server |
| ESLint | 9.39.1 | Code Linting |
| CSS3 | - | Styling with Custom Properties |

### 3.2 Backend

| Technology | Version | Purpose |
|------------|---------|---------|
| Python | 3.10+ | Runtime |
| Flask | 3.0.0+ | Web Framework |
| Flask-CORS | 4.0.0+ | Cross-Origin Resource Sharing |
| PyMongo | 4.6.0+ | MongoDB Driver |
| Pydantic | 2.5.0+ | Data Validation |
| google-generativeai | 0.8.0+ | Gemini AI SDK |
| Gunicorn | 21.0.0+ | Production WSGI Server |

### 3.3 Database

| Technology | Purpose |
|------------|---------|
| MongoDB | Document Storage for comparisons, itineraries |

### 3.4 AI/ML

| Technology | Purpose |
|------------|---------|
| Google Gemini 2.5 Flash | AI Content Generation |

---

## 4. Backend Documentation

### 4.1 Directory Structure

```
backend/
├── app.py                 # Application entry point & factory
├── config.py              # Configuration management
├── database.py            # MongoDB connection & collections
├── models.py              # Pydantic data models
├── requirements.txt       # Python dependencies
├── routes/
│   ├── __init__.py
│   └── api.py             # API route definitions
└── services/
    ├── __init__.py
    └── gemini_service.py  # Gemini AI integration
```

### 4.2 Core Modules

#### 4.2.1 app.py - Application Factory

```python
def create_app():
    """Application factory function"""
    # - Initializes Flask app
    # - Configures CORS for React frontend
    # - Initializes database connection
    # - Registers API blueprints
```

**CORS Configuration:**
- Allowed Origins: `http://localhost:5173`, `http://localhost:3000`
- Allowed Methods: GET, POST, PUT, DELETE, OPTIONS
- Allowed Headers: Content-Type, Authorization

#### 4.2.2 config.py - Configuration

| Variable | Description | Default |
|----------|-------------|---------|
| `MONGODB_URI` | MongoDB connection string | `mongodb://localhost:27017/wandrix` |
| `GEMINI_API_KEY` | Google Gemini API key | Required |
| `SECRET_KEY` | Flask secret key | `dev-secret-key` |
| `DEBUG` | Debug mode flag | `True` |

#### 4.2.3 database.py - Database Layer

**Functions:**

| Function | Description |
|----------|-------------|
| `init_db()` | Initialize MongoDB connection with timeout handling |
| `get_db()` | Get database instance |
| `get_destinations_collection()` | Get destinations collection |
| `get_comparisons_collection()` | Get comparisons collection |
| `get_itineraries_collection()` | Get itineraries collection |
| `get_users_collection()` | Get users collection |

**Note:** The application gracefully handles MongoDB unavailability and continues running without database persistence.

#### 4.2.4 models.py - Data Models

**UserPreferences**
```python
class UserPreferences(BaseModel):
    budget: str           # "low", "medium", "high", "luxury"
    travel_duration: int  # Number of days
    interests: List[str]  # ["adventure", "culture", "nature", "food"]
    season: str           # "spring", "summer", "fall", "winter"
    travel_type: str      # "solo", "couple", "family", "group"
    accessibility_needs: Optional[str]
```

**Destination**
```python
class Destination(BaseModel):
    name: str
    country: str
    description: Optional[str]
    climate: Optional[str]
    best_season: Optional[List[str]]
    estimated_daily_cost: Optional[dict]
    attractions: Optional[List[str]]
    cuisine: Optional[List[str]]
    cultural_significance: Optional[str]
    unique_experiences: Optional[List[str]]
    accessibility: Optional[str]
    image_url: Optional[str]
```

**ItineraryDay**
```python
class ItineraryDay(BaseModel):
    day_number: int
    title: str
    morning_activity: str
    afternoon_activity: str
    evening_activity: str
    meals: dict  # {"breakfast": "", "lunch": "", "dinner": ""}
    tips: List[str]
    estimated_cost: float
```

#### 4.2.5 gemini_service.py - AI Service

**GeminiService Class**

| Method | Description | Parameters |
|--------|-------------|------------|
| `get_destination_info()` | Get detailed destination information | `destination: str` |
| `get_destination_highlights()` | Get unique features and highlights | `destination: str` |
| `compare_destinations()` | Compare two destinations | `dest1, dest2, preferences` |
| `generate_itinerary()` | Generate day-by-day itinerary | `destination, preferences` |

**Features:**
- Retry logic with exponential backoff for rate limiting
- JSON response parsing and cleaning
- Error handling with graceful degradation

---

## 5. Frontend Documentation

### 5.1 Directory Structure

```
frontend/
├── index.html             # HTML entry point
├── package.json           # Dependencies & scripts
├── vite.config.js         # Vite configuration
├── eslint.config.js       # ESLint configuration
├── public/                # Static assets
└── src/
    ├── main.jsx           # React entry point
    ├── App.jsx            # Root component
    ├── App.css            # App-level styles
    ├── index.css          # Global styles & CSS variables
    ├── assets/            # Images and static assets
    ├── components/        # React components
    │   ├── Header.jsx/.css
    │   ├── Hero.jsx/.css
    │   ├── ComparePage.jsx/.css
    │   ├── ComparisonResult.jsx/.css
    │   ├── DestinationInput.jsx/.css
    │   ├── ExplorePage.jsx/.css
    │   ├── ItineraryView.jsx/.css
    │   └── PreferencesForm.jsx/.css
    └── services/
        └── api.js         # API client
```

### 5.2 Component Hierarchy

```
App
├── Header
│   └── Navigation Links
├── Main Content (conditional rendering)
│   ├── Hero (home page)
│   ├── ComparePage
│   │   ├── DestinationInput (×2)
│   │   ├── PreferencesForm
│   │   ├── ComparisonResult
│   │   └── ItineraryView
│   └── ExplorePage
│       └── Destination Cards
└── Footer
```

### 5.3 Components

#### 5.3.1 App.jsx
**State Management:**
- `currentPage`: Controls which page is displayed ('home', 'compare', 'explore', 'itinerary')
- `selectedDestination`: Stores destination selected from ExplorePage

**Navigation Flow:**
```
Home → Compare Page → Results → Itinerary
  ↓
Explore → Select Destination → Compare Page
```

#### 5.3.2 Header.jsx
- Responsive navigation header
- Mobile hamburger menu
- Page navigation controls

#### 5.3.3 Hero.jsx
- Landing page hero section
- Feature highlights
- Call-to-action buttons

#### 5.3.4 ComparePage.jsx
- Main comparison interface
- Contains two DestinationInput components
- PreferencesForm for user preferences
- Displays ComparisonResult and ItineraryView

#### 5.3.5 DestinationInput.jsx
- Autocomplete destination search
- SVG location icon
- Suggestion dropdown with popular destinations

#### 5.3.6 PreferencesForm.jsx
- Budget selection (Budget, Mid-Range, Premium, Luxury)
- Travel duration slider
- Interest selection (Adventure, Culture, Nature, Food, Relaxation, Shopping, Nightlife, History)
- Season preference
- Travel type (Solo, Couple, Family, Group)

#### 5.3.7 ComparisonResult.jsx
- Side-by-side destination comparison
- Score visualization with progress bars
- Pros and cons lists
- AI recommendation with reasoning

#### 5.3.8 ExplorePage.jsx
- Destination discovery grid
- Search functionality
- Destination cards with basic info
- Modal for destination details

#### 5.3.9 ItineraryView.jsx
- Day-by-day timeline view
- Activity cards with times
- Meal recommendations
- Packing checklist
- Local phrases
- Emergency contacts
- Print functionality

### 5.4 API Service (api.js)

```javascript
const api = {
  healthCheck(),                                    // GET /api/health
  getDestinationInfo(destination),                  // POST /api/destination/info
  getDestinationHighlights(destination),            // POST /api/destination/highlights
  compareDestinations(dest1, dest2, preferences),   // POST /api/compare
  generateItinerary(destination, preferences),      // POST /api/itinerary/generate
  getItinerary(itineraryId),                       // GET /api/itinerary/:id
  getPopularDestinations(),                         // GET /api/destinations/popular
  getComparisonHistory(),                          // GET /api/comparisons/history
};
```

### 5.5 Design System

**CSS Custom Properties (index.css):**

```css
:root {
  /* Colors */
  --color-bg: #0a0a0b;
  --color-bg-card: #141416;
  --color-bg-elevated: #1a1a1d;
  --color-border: #2a2a2d;
  --color-text: #fafafa;
  --color-text-secondary: #a1a1aa;
  --color-text-muted: #71717a;
  --color-accent: #3b82f6;
  --color-accent-hover: #2563eb;
  --color-accent-muted: rgba(59, 130, 246, 0.1);
  --color-success: #22c55e;
  --color-warning: #f59e0b;
  --color-error: #ef4444;

  /* Spacing */
  --space-xs: 0.25rem;
  --space-sm: 0.5rem;
  --space-md: 1rem;
  --space-lg: 1.5rem;
  --space-xl: 2rem;
  --space-2xl: 3rem;

  /* Border Radius */
  --radius-sm: 4px;
  --radius-md: 8px;
  --radius-lg: 12px;
  --radius-xl: 16px;
}
```

---

## 6. API Reference

### 6.1 Base URL

```
Development: http://localhost:5000/api
```

### 6.2 Endpoints

#### Health Check

```http
GET /api/health
```

**Response:**
```json
{
  "status": "healthy",
  "message": "Wandrix API is running"
}
```

---

#### Get Destination Info

```http
POST /api/destination/info
Content-Type: application/json

{
  "destination": "Paris"
}
```

**Response:**
```json
{
  "name": "Paris",
  "country": "France",
  "description": "The City of Light...",
  "climate": "Temperate oceanic climate",
  "best_seasons": ["spring", "fall"],
  "estimated_daily_cost": {
    "budget": "$80-120",
    "mid_range": "$150-250",
    "luxury": "$400+"
  },
  "top_attractions": ["Eiffel Tower", "Louvre Museum", ...],
  "local_cuisine": ["Croissants", "Coq au vin", ...],
  "cultural_significance": "...",
  "unique_experiences": [...],
  "accessibility": "...",
  "safety_rating": "8/10",
  "tourist_friendliness": "Very tourist-friendly"
}
```

---

#### Get Destination Highlights

```http
POST /api/destination/highlights
Content-Type: application/json

{
  "destination": "Tokyo"
}
```

**Response:**
```json
{
  "destination": "Tokyo",
  "tagline": "Where tradition meets the future",
  "cultural_highlights": {
    "history": "...",
    "traditions": [...],
    "festivals": [...],
    "art_and_architecture": "..."
  },
  "famous_attractions": [...],
  "culinary_experiences": {...},
  "exclusive_experiences": [...],
  "hidden_gems": [...],
  "photo_spots": [...],
  "local_tips": [...]
}
```

---

#### Compare Destinations

```http
POST /api/compare
Content-Type: application/json

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

**Response:**
```json
{
  "destination1": {
    "name": "Paris",
    "scores": {
      "budget_match": 7,
      "weather_suitability": 8,
      "attractions_match": 9,
      "accessibility": 9,
      "unique_experiences": 8,
      "safety": 8
    },
    "total_score": 49,
    "pros": ["Rich cultural heritage", ...],
    "cons": ["Can be crowded", ...],
    "estimated_total_cost": "$1,500-2,000",
    "best_time_to_visit": "April-May",
    "highlights": [...]
  },
  "destination2": {
    "name": "Tokyo",
    "scores": {...},
    "total_score": 52,
    "pros": [...],
    "cons": [...],
    "estimated_total_cost": "$1,800-2,500",
    "best_time_to_visit": "March-April",
    "highlights": [...]
  },
  "recommendation": {
    "winner": "Tokyo",
    "reasoning": "Based on your preferences...",
    "key_deciding_factors": [...]
  }
}
```

---

#### Generate Itinerary

```http
POST /api/itinerary/generate
Content-Type: application/json

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

**Response:**
```json
{
  "destination": "Paris",
  "duration_days": 5,
  "overview": "A romantic 5-day exploration...",
  "best_time_to_visit": "April-June or September-October",
  "days": [
    {
      "day_number": 1,
      "title": "Arrival & Iconic Paris",
      "morning": {
        "activity": "Check-in and explore neighborhood",
        "location": "Le Marais",
        "duration": "2-3 hours",
        "tips": "..."
      },
      "afternoon": {...},
      "evening": {...},
      "meals": {
        "breakfast": "Café de Flore",
        "lunch": "L'As du Fallafel",
        "dinner": "Le Comptoir du Panthéon"
      },
      "estimated_daily_cost": "$150"
    },
    ...
  ],
  "total_estimated_cost": "$1,200",
  "packing_list": ["Comfortable walking shoes", ...],
  "important_tips": ["Metro is the best way to get around", ...],
  "local_phrases": [
    {"phrase": "Bonjour", "meaning": "Hello"},
    {"phrase": "Merci", "meaning": "Thank you"}
  ],
  "emergency_contacts": {
    "police": "17",
    "ambulance": "15",
    "tourist_helpline": "..."
  },
  "itinerary_id": "..."
}
```

---

#### Get Saved Itinerary

```http
GET /api/itinerary/{itinerary_id}
```

**Response:** Same as Generate Itinerary response with saved data.

---

#### Get Popular Destinations

```http
GET /api/destinations/popular
```

**Response:**
```json
{
  "destinations": [
    {"name": "Paris", "country": "France", "tagline": "..."},
    {"name": "Tokyo", "country": "Japan", "tagline": "..."},
    ...
  ]
}
```

---

#### Get Comparison History

```http
GET /api/comparisons/history
```

**Response:**
```json
{
  "comparisons": [
    {
      "_id": "...",
      "destination1": "Paris",
      "destination2": "Tokyo",
      "created_at": "2026-01-15T10:30:00Z",
      "result": {...}
    },
    ...
  ]
}
```

---

## 7. Database Schema

### 7.1 Collections

#### comparisons

```javascript
{
  "_id": ObjectId,
  "destination1": String,
  "destination2": String,
  "preferences": {
    "budget": String,
    "travel_duration": Number,
    "interests": [String],
    "season": String,
    "travel_type": String
  },
  "result": Object,  // Full comparison result
  "created_at": ISODate
}
```

#### itineraries

```javascript
{
  "_id": ObjectId,
  "destination": String,
  "preferences": {
    "budget": String,
    "travel_duration": Number,
    "interests": [String],
    "travel_type": String
  },
  "itinerary": Object,  // Full itinerary data
  "created_at": ISODate
}
```

#### destinations (optional caching)

```javascript
{
  "_id": ObjectId,
  "name": String,
  "country": String,
  "info": Object,
  "highlights": Object,
  "cached_at": ISODate
}
```

---

## 8. Installation & Setup

### 8.1 Prerequisites

- **Node.js** 18+ and npm
- **Python** 3.10+
- **MongoDB** 6.0+ (optional, app works without it)
- **Google Gemini API Key**

### 8.2 Backend Setup

```bash
# Navigate to backend directory
cd backend

# Create virtual environment
python -m venv venv

# Activate virtual environment
# On Windows:
venv\Scripts\activate
# On macOS/Linux:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Create environment file
cp .env.example .env

# Edit .env with your configuration
# GEMINI_API_KEY=your_gemini_api_key
# MONGODB_URI=mongodb://localhost:27017/wandrix

# Run the application
python app.py
```

### 8.3 Frontend Setup

```bash
# Navigate to frontend directory
cd frontend

# Install dependencies
npm install

# Start development server
npm run dev
```

### 8.4 Environment Variables

Create a `.env` file in the backend directory:

```env
# Required
GEMINI_API_KEY=your_google_gemini_api_key

# Optional (defaults shown)
MONGODB_URI=mongodb://localhost:27017/wandrix
SECRET_KEY=your-secret-key-here
FLASK_DEBUG=True
```

---

## 9. Configuration

### 9.1 Backend Configuration

| Setting | Environment Variable | Default | Description |
|---------|---------------------|---------|-------------|
| Database URI | `MONGODB_URI` | `mongodb://localhost:27017/wandrix` | MongoDB connection string |
| Gemini API Key | `GEMINI_API_KEY` | - | Google Gemini API key (required) |
| Secret Key | `SECRET_KEY` | `dev-secret-key` | Flask secret key |
| Debug Mode | `FLASK_DEBUG` | `True` | Enable/disable debug mode |

### 9.2 Frontend Configuration

Edit `vite.config.js` for build customization:

```javascript
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,  // Dev server port
    proxy: {
      '/api': 'http://localhost:5000'  // Proxy API requests
    }
  }
})
```

### 9.3 API Configuration

Edit `frontend/src/services/api.js` to change the backend URL:

```javascript
const API_BASE_URL = 'http://localhost:5000/api';
```

---

## 10. Development Guide

### 10.1 Running in Development Mode

**Terminal 1 - Backend:**
```bash
cd backend
python app.py
# Runs on http://localhost:5000
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm run dev
# Runs on http://localhost:5173
```

### 10.2 Code Style

**Python (Backend):**
- Follow PEP 8 guidelines
- Use type hints where applicable
- Document functions with docstrings

**JavaScript (Frontend):**
- ESLint configuration provided
- Use functional components with hooks
- Keep components small and focused

### 10.3 Adding New Features

**Adding a new API endpoint:**

1. Define the route in `backend/routes/api.py`:
```python
@api_bp.route('/new-endpoint', methods=['POST'])
def new_endpoint():
    data = request.get_json()
    # Process data
    return jsonify(result)
```

2. Add corresponding service method in `backend/services/gemini_service.py` if AI is needed

3. Add API client method in `frontend/src/services/api.js`:
```javascript
async newEndpoint(data) {
  const response = await fetch(`${API_BASE_URL}/new-endpoint`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  return response.json();
}
```

**Adding a new component:**

1. Create component file: `frontend/src/components/NewComponent.jsx`
2. Create styles file: `frontend/src/components/NewComponent.css`
3. Import and use in parent component

### 10.4 Testing

**Backend Testing:**
```bash
cd backend
python -m pytest tests/
```

**Frontend Testing:**
```bash
cd frontend
npm test
```

---

## 11. Deployment

### 11.1 Production Build

**Frontend:**
```bash
cd frontend
npm run build
# Output in dist/ directory
```

**Backend:**
```bash
cd backend
gunicorn -w 4 -b 0.0.0.0:5000 "app:create_app()"
```

### 11.2 Docker Deployment (Optional)

**Backend Dockerfile:**
```dockerfile
FROM python:3.11-slim
WORKDIR /app
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
COPY . .
EXPOSE 5000
CMD ["gunicorn", "-w", "4", "-b", "0.0.0.0:5000", "app:create_app()"]
```

**Frontend Dockerfile:**
```dockerfile
FROM node:18-alpine as build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 80
```

### 11.3 Environment Checklist

- [ ] Set `FLASK_DEBUG=False` in production
- [ ] Use a strong `SECRET_KEY`
- [ ] Configure proper CORS origins
- [ ] Set up MongoDB with authentication
- [ ] Enable HTTPS
- [ ] Set up rate limiting
- [ ] Configure logging

### 11.4 Recommended Hosting

| Component | Recommended Platforms |
|-----------|----------------------|
| Frontend | Vercel, Netlify, AWS S3 + CloudFront |
| Backend | Railway, Render, AWS EC2, Heroku |
| Database | MongoDB Atlas |

---

## Appendix

### A. Error Codes

| Code | Description |
|------|-------------|
| 400 | Bad Request - Missing or invalid parameters |
| 404 | Not Found - Resource doesn't exist |
| 500 | Internal Server Error - Server-side error |
| 429 | Rate Limited - Too many requests to Gemini API |

### B. Rate Limiting

The Gemini API has rate limits. The backend implements exponential backoff:
- Initial wait: 30 seconds
- Max retries: 3
- Backoff multiplier: 2x

### C. Support

For issues and feature requests, please create an issue in the project repository.

---

**Documentation Version:** 2.0.0  
**Last Updated:** February 1, 2026  
**Author:** Wandrix Development Team

---

## 12. Recent Updates & Changes (February 2026)

This section documents all recent changes, bug fixes, and feature additions.

### 12.1 React Router Integration

**Issue:** Page refresh redirected users to the home page regardless of the current page.

**Solution:** Implemented React Router DOM for proper URL-based navigation.

**Files Changed:**
- `frontend/src/main.jsx` - Added BrowserRouter wrapper
- `frontend/src/App.jsx` - Replaced state-based routing with Routes/Route components

**New Routes:**
| Route | Component | Description |
|-------|-----------|-------------|
| `/` or `/home` | HomePage | Landing page |
| `/explore` | ExplorePage | Destination browser |
| `/compare` | ComparePage | Destination comparison |
| `/itinerary` | ComparePage | Itinerary generator |
| `/login` | LoginPage | User login |
| `/register` | RegisterPage | User registration |
| `/wishlist` | WishlistPage | Saved destinations |

**Benefits:**
- Page refresh maintains current route
- Browser back/forward navigation works correctly
- Direct URL access to any page
- Shareable page URLs

---

### 12.2 Image Service Migration

**Issue:** Unsplash Source API was deprecated, causing images not to load.

**Solution:** Migrated to Lorem Picsum with seed-based consistent images.

**File Changed:** `frontend/src/utils/images.js`

**Implementation:**
```javascript
export function getDestinationImage(destinationName, width = 800, height = 600) {
  const hash = hashCode(destinationName);
  return `https://picsum.photos/seed/${hash}/${width}/${height}`;
}

function hashCode(str) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return Math.abs(hash);
}
```

**Benefits:**
- Same destination always gets the same image (consistency)
- No API key required
- Fast and reliable image loading

---

### 12.3 Explore Page Modal Fix

**Issue:** Clicking on destinations showed a black screen instead of the modal.

**Solution:** Added defensive rendering with Array.isArray checks and separate error states.

**File Changed:** `frontend/src/pages/ExplorePage.jsx`

**Key Changes:**
- Added null/undefined checks before rendering arrays
- Added separate error state for failed API calls
- Added console logging for debugging
- Improved modal rendering logic

---

### 12.4 File-Based Storage Fallback

**Issue:** Application crashed when MongoDB was unavailable.

**Solution:** Implemented FileBasedCollection class for JSON-based storage.

**File Changed:** `backend/database.py`

**New Class:**
```python
class FileBasedCollection:
    """Simple file-based collection for when MongoDB is unavailable"""
    
    def find_one(self, query): ...
    def insert_one(self, document): ...
    def update_one(self, query, update): ...  # Supports $set, $push, $pull
```

**Storage File:** `backend/users.json`

**Features:**
- Automatic fallback when MongoDB connection fails
- Supports find, insert, update operations
- Handles $set, $push, $pull MongoDB operators
- JSON file storage for persistence

---

### 12.5 Authentication System

**Feature:** Complete user authentication with JWT tokens.

**Files:**
- `backend/routes/auth.py` - Auth routes (register, login, wishlist)
- `frontend/src/context/AuthContext.jsx` - Auth state management
- `frontend/src/pages/LoginPage.jsx` - Login UI
- `frontend/src/pages/RegisterPage.jsx` - Registration UI

**Test Account:**
| Field | Value |
|-------|-------|
| Email | `test@wandrix.com` |
| Password | `test123` |

**JWT Configuration:**
- Secret Key: Configurable via `JWT_SECRET` env var
- Expiration: 24 hours
- Algorithm: HS256

**Auth Flow:**
1. User submits login credentials
2. Backend validates and returns JWT token
3. Token stored in localStorage
4. Token sent in Authorization header for protected routes
5. Token automatically validated on each request

---

### 12.6 Wishlist Feature

**Feature:** Save and manage favorite destinations.

**Files:**
- `frontend/src/pages/WishlistPage.jsx` - Wishlist display
- `frontend/src/pages/ExplorePage.jsx` - Heart icon toggle
- `frontend/src/context/AuthContext.jsx` - Wishlist state management

**Heart Icon States:**
- **Unfilled:** Destination not in wishlist
- **Filled Red:** Destination saved to wishlist

**API Endpoints:**
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/auth/wishlist` | Get user's wishlist |
| POST | `/api/auth/wishlist/add` | Add destination |
| POST | `/api/auth/wishlist/remove` | Remove destination |

---

### 12.7 Bug Fixes

#### Fix 1: ObjectId Handling for File-Based Storage
**Issue:** 401 errors when adding to wishlist with file-based storage.
**Solution:** Added try/catch to handle both MongoDB ObjectId and string IDs.
**File:** `backend/routes/auth.py`

```python
def get_current_user():
    # Try with ObjectId for MongoDB, fall back to string for file-based
    try:
        user = users.find_one({"_id": ObjectId(user_id)})
    except:
        user = users.find_one({"_id": user_id})
```

#### Fix 2: Wishlist Update Operations
**Issue:** $push and $pull operations failed with file-based storage.
**Solution:** Implemented proper handling in FileBasedCollection.
**File:** `backend/database.py`

---

### 12.8 Project Structure Updates

**New Folders:**
```
frontend/src/
├── pages/           # Page components (NEW)
│   ├── HomePage.jsx/.css
│   ├── ExplorePage.jsx/.css
│   ├── ComparePage.jsx/.css
│   ├── LoginPage.jsx
│   ├── RegisterPage.jsx
│   ├── AuthPages.css
│   └── WishlistPage.jsx/.css
├── context/         # React Context (NEW)
│   └── AuthContext.jsx
└── utils/           # Utility functions (NEW)
    └── images.js
```

**New Dependencies:**
```json
{
  "react-router-dom": "^6.x"  // URL-based routing
}
```

---

### 12.9 CSS Design System Updates

**New CSS Variables:**
```css
:root {
  --color-surface: #111113;
  --color-surface-elevated: #18181b;
  --color-primary: #3b82f6;
  --color-primary-hover: #2563eb;
  --color-accent: #8b5cf6;
}
```

**Wishlist Button Styles:**
```css
.wishlist-btn {
  background: rgba(10, 10, 11, 0.7);
  backdrop-filter: blur(8px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  color: rgba(255, 255, 255, 0.8);
}

.wishlist-btn.active {
  color: #ef4444;  /* Red when active */
  background: rgba(239, 68, 68, 0.2);
  border-color: #ef4444;
}
```

---

### 12.10 Known Issues & Limitations

1. **MongoDB Required for Full Features:** Comparison history and itinerary saving require MongoDB
2. **File-Based Storage Limitations:** Only supports basic CRUD operations
3. **Gemini API Rate Limits:** AI responses may be delayed during high traffic
4. **Image Consistency:** Lorem Picsum images are random but consistent per destination name

---

### 12.11 Testing Checklist

- [x] Page refresh maintains current route
- [x] User can register and login
- [x] Heart icon toggles properly
- [x] Wishlist displays saved destinations
- [x] Images load correctly
- [x] Modal opens and closes properly
- [x] Navigation works in header
- [x] File-based fallback works when MongoDB is down

---

### 12.12 Quick Start Commands

**Start Backend:**
```bash
cd backend
python app.py
# Runs on http://localhost:5000
```

**Start Frontend:**
```bash
cd frontend
npm run dev
# Runs on http://localhost:5173
```

**Both Servers Required:** Frontend communicates with backend API
