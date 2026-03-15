## MAIN PROJECT

Submitted in partial fulfilment of the requirements for the award of degree of

#### BACHELOR OF COMPUTER APPLICATIONS

```
Of
Mahatma Gandhi University
Kottayam
By
[Project Team]
```

```
Department of Computer Applications
[Your College Name]
```

## WANDRIX

## Department of Computer Applications

### CERTIFICATE

This is to certify that the main project report entitled **"Wandrix - AI-Powered Travel Destination Comparison & Itinerary Platform"** is submitted in partial fulfilment of the requirements of Bachelor degree in Computer Applications.

### DECLARATION

I hereby declare that the main project work entitled **"Wandrix"** is a report of original work done during the period of study under the supervision of project guides.

### ACKNOWLEDGEMENT

The team expresses sincere gratitude to the institution, department faculty, project guide, and all contributors who supported the successful completion of this project.

---

## TABLE OF CONTENTS

1. STUDY PHASE
   1.1 INTRODUCTION
   1.2 OBJECTIVES
   1.3 TECHNOLOGIES MATERIALS AND METHODS
   1.4 FEASIBILITY ANALYSIS
   1.5 SYSTEM ANALYSIS
   1.6 SYSTEM REQUIREMENT SPECIFICATION
2. DESIGN PHASE
   2.1 INTRODUCTION TO DATA FLOW DIAGRAM
   2.2 DATA FLOW DIAGRAM (LEVEL 0 TO LEVEL 2)
   2.3 DATABASE DESIGN
   2.4 SYSTEM DESIGN
   2.5 PRISMA DFD (LEVEL 0 TO LEVEL 2)
3. DEVELOPMENT PHASE
   3.1 SYSTEM ENVIRONMENT
   3.2 CODING
4. TESTING AND IMPLEMENTATION
   4.1 TESTING
   4.2 TEST CASES
5. SCREEN LAYOUTS
   5.1 FORM DESIGN
6. CONCLUSION AND FUTURE SCOPE
   6.1 CONCLUSION
   6.2 FUTURE SCOPE
7. BIBLIOGRAPHY
   7.1 BOOKS OF REFERENCE
   7.2 WEBLIOGRAPHY

---

## ABSTRACT

**Wandrix** is a full-stack AI-powered travel destination comparison and itinerary planning platform that supports two roles: **User** and **Admin**. The system enables users to discover destinations, compare them side-by-side using AI-weighted scoring, generate detailed day-by-day itineraries, manage a personal travel wishlist, and explore destination highlights with rich media.

Admins can monitor platform metrics, govern user accounts (block/unblock, role assignment, password reset, account deletion), inspect user activity including comparison and itinerary history, and view aggregate analytics across the platform.

The backend is implemented with **Flask + MongoDB Atlas + JWT + Google Gemini AI**, while the frontend is implemented with **React 19 + Vite + Custom CSS with Glassmorphism Design System**. The platform includes AI-powered destination comparison with preference-based scoring, AI-generated multi-day itineraries, destination information and highlight caching, wishlist management, role-based access control, and a premium editorial design language.

---

## LIST OF TABLES

1. `users` collection
2. `comparisons` collection
3. `itineraries` collection
4. `destinations` collection

## LIST OF FIGURES

| Sl. No. | Figure Name | Page No. |
|---|---|---|
| 1 | Level 0 DFD | TBD |
| 2 | Level 1 DFD: Admin | TBD |
| 3 | Level 1 DFD: User | TBD |
| 4 | Level 2 DFD: Admin-Login | TBD |
| 5 | Level 2 DFD: Admin-Manage Users | TBD |
| 6 | Level 2 DFD: Admin-View Activity | TBD |
| 7 | Level 2 DFD: Admin-Block/Unblock Users | TBD |
| 8 | Level 2 DFD: User-Register | TBD |
| 9 | Level 2 DFD: User-Login | TBD |
| 10 | Level 2 DFD: User-Discover and Explore Destinations | TBD |
| 11 | Level 2 DFD: User-Compare Destinations | TBD |
| 12 | Level 2 DFD: User-Generate Itinerary | TBD |
| 13 | Level 2 DFD: User-Manage Wishlist | TBD |
| 14 | Level 2 DFD: User-Update Profile | TBD |

---

## 1. STUDY PHASE

### 1.1 INTRODUCTION

Wandrix addresses a common pain point in travel planning: the overwhelming process of choosing between destinations and building a trip plan. The platform integrates AI-powered destination discovery, intelligent side-by-side comparison with preference-based scoring, automated itinerary generation, and personalized wishlist management into one cohesive system. The platform provides role-based capabilities:

- **Users**: destination exploration, AI-powered comparison, itinerary generation, wishlist management, and profile customization.
- **Admins**: platform governance including user management, activity monitoring, metrics overview, and account moderation tools.

The name "Wandrix" combines "Wander" (to explore) with a modern suffix, reflecting the platform's core purpose of intelligent travel exploration.

### 1.2 OBJECTIVES

- Provide AI-powered destination comparison with multi-criteria scoring across budget, weather, attractions, accessibility, safety, and unique experiences.
- Enable automated generation of detailed day-by-day travel itineraries with activities, meals, costs, packing lists, and local tips.
- Provide rich destination exploration with highlights, attractions, cuisine, travel logistics, and seasonal information.
- Implement a personal wishlist system for saving and managing favorite destinations.
- Provide admin governance tools for user management, activity monitoring, and platform metrics.
- Ensure secure, role-based access using JWT authentication with blocked-user enforcement.
- Deliver a premium, editorial-grade user experience through glassmorphism design, animated transitions, and responsive layouts.

### 1.3 TECHNOLOGIES MATERIALS AND METHODS

#### 1.3.1 DATABASE TOOL: MONGODB

MongoDB Atlas is used for cloud-hosted document-based storage with collections for users, comparisons, itineraries, and destinations. The system includes a file-based JSON fallback for local development without a database connection.

#### 1.3.2 PROGRAMMING TOOLS

- **Python (Flask)** for backend REST API with blueprint-based modular routing.
- **JavaScript (React 19 + Vite)** for dynamic single-page frontend application.
- **Custom CSS** with a premium glassmorphism design system using Cormorant Garamond and Plus Jakarta Sans typography.
- **Google Gemini AI (1.5 Flash/Pro)** for intelligent destination analysis, comparison, and itinerary generation.
- **PyJWT** for secure token-based JWT authentication.
- **Flask-CORS** for controlled cross-origin request handling.
- **Pydantic v2** for request/response validation and data modeling.
- **Unsplash API** for high-quality destination imagery with picsum.photos fallback.
- **Three.js + OGL** for 3D WebGL visual effects on the landing page.

### 1.4 FEASIBILITY ANALYSIS

#### 1.4.1 TECHNICAL FEASIBILITY

The architecture is technically feasible because:
- RESTful routes are modularized by domain (`auth`, `api`, `admin`) using Flask Blueprints.
- Data models are validated with Pydantic v2 schemas for all request/response flows.
- Frontend service abstraction (`api.js`) centralizes all 23 API methods and handles token management.
- AI integration uses Google Gemini with automatic model selection, retry logic, and JSON response parsing.
- Database layer includes automatic retry with exponential backoff, connection pooling, and file-based fallback.

#### 1.4.2 ECONOMIC FEASIBILITY

- Open-source stack (Flask, React, MongoDB Community) reduces licensing costs.
- Google Gemini AI offers a free tier sufficient for development and moderate usage.
- Unsplash API provides free image access within rate limits.
- Modular architecture lowers future maintenance overhead and enables incremental scaling.

#### 1.4.3 OPERATIONAL FEASIBILITY

- Distinct user and admin interfaces match operational responsibilities.
- Environment-based configuration via `.env` files simplifies deployment across environments.
- Auto-port fallback logic ensures the backend starts reliably on available ports.
- Admin seeding from environment variables enables automated deployment of governance accounts.

### 1.5 SYSTEM ANALYSIS

#### 1.5.1 EXISTING SYSTEM CONTEXT

Conventional travel planning workflows are fragmented across multiple platforms — separate apps for destination research, price comparison, itinerary building, and wishlist tracking. Users must manually cross-reference information without any AI-assisted analysis.

#### 1.5.2 LIMITATIONS IN EXISTING APPROACHES

- No unified comparison engine that scores destinations against personal travel preferences.
- Manual itinerary creation is time-consuming and lacks local insights.
- No centralized platform combining exploration, comparison, planning, and saving in one interface.
- Existing tools lack AI-powered personalization based on budget, travel style, season, and interests.

#### 1.5.3 PROPOSED SYSTEM (WANDRIX)

Wandrix unifies authentication, destination discovery, AI-powered comparison, itinerary generation, wishlist management, and admin governance under one role-aware platform with a premium visual experience.

#### 1.5.4 ADVANTAGES

- AI-powered comparison with multi-criteria scoring eliminates guesswork in destination selection.
- Automated itinerary generation saves hours of manual planning.
- Cached results improve response times and reduce AI API costs.
- Premium glassmorphism design provides an engaging, editorial-grade user experience.
- Role-based access ensures secure platform governance.

#### 1.5.5 CHALLENGES

- Managing AI response consistency and JSON parsing reliability across diverse destination queries.
- Ensuring comparison cache accuracy with preference-based SHA-256 hashing.
- Maintaining responsive performance with 3D WebGL effects across device capabilities.
- Handling concurrent user sessions with JWT-based stateless authentication.

### 1.6 SYSTEM REQUIREMENT SPECIFICATION

#### SYSTEM MODULES

1. **User Module**
   - Register/login with JWT-based session management
   - Explore 190+ destinations with rich details, highlights, and media
   - Compare two destinations side-by-side with AI scoring
   - Generate day-by-day itineraries with activities, meals, costs, and tips
   - Manage a personal travel wishlist
   - View comparison and itinerary history
   - Update profile (name, avatar)

2. **Admin Module**
   - Platform metrics dashboard (users, admins, comparisons, itineraries)
   - User listing with search, stats, and role badges
   - User role management (grant/revoke admin)
   - User moderation (block/unblock with reason)
   - Password reset for any user
   - User deletion with cascade cleanup
   - User activity inspection (recent comparisons and itineraries)

---

## 2. DESIGN PHASE

### 2.1 INTRODUCTION TO DATA FLOW DIAGRAM

A DFD represents how data moves among external entities, processes, and persistent data stores. For Wandrix, DFDs model the end-to-end flows of destination exploration, AI-powered comparison, itinerary generation, and admin governance.

### 2.2 DATA FLOW DIAGRAM

#### 2.2.1 LEVEL 0 DFD (CONTEXT)

```text
 [User]  -- request -->
                        ( Wandrix AI Travel Platform ) <-- request -- [Admin]

 ( Wandrix AI Travel Platform ) -- response --> [User]
 ( Wandrix AI Travel Platform ) -- response --> [Admin]

 External Service:
   [Google Gemini AI] <-- AI prompts / --> AI responses

 Data Stores:
   D1 Users
   D2 Comparisons
   D3 Itineraries
   D4 Destinations
```

**Working of Level 0 DFD:**
At context level, Wandrix is treated as one central process interacting with two external entities: User and Admin. Their requests and responses flow through the system process, which reads/writes four core data stores and communicates with the external Google Gemini AI service for intelligent content generation.

#### 2.2.2 FIRST LEVEL DFD FOR ADMIN

```text
 [Admin] --request--> (Login 1.1) --------------------------> [Admin]
 [Admin] --request--> (View Platform Metrics 1.2) -----------> [Admin]
 [Admin] --request--> (Manage Users 1.3) --------------------> [Admin]
 [Admin] --request--> (View User Activity 1.4) --------------> [Admin]
 [Admin] --request--> (Block/Unblock Users 1.5) -------------> [Admin]
 [Admin] --request--> (Reset User Password 1.6) -------------> [Admin]
 [Admin] --request--> (Delete Users 1.7) --------------------> [Admin]

                      (responses are returned to Admin)
```

**Working of First Level DFD for Admin:**
Admin sends requests to seven key admin processes. Each process performs JWT validation, role verification, and data operations against the Users, Comparisons, and Itineraries collections, returning structured responses to the admin dashboard.

#### 2.2.3 FIRST LEVEL DFD FOR USERS

```text
 [User] --request--> (User Services 2.0) --------------------------------> [User]
                   --> (Register 2.1)
                   --> (Login 2.2)
                   --> (Explore Destinations 2.3)
                   --> (Compare Destinations 2.4)
                   --> (Generate Itinerary 2.5)
                   --> (Manage Wishlist 2.6)
                   --> (Update Profile 2.7)

                     (responses are returned to User)
```

**Working of First Level DFD for Users:**
At Level 1, all user interactions enter through the parent process 2.0 User Services, which is decomposed into subprocesses 2.1 to 2.7. Each subprocess performs API and database operations for its function and returns status/data responses to the user interface.

#### 2.2.4 SECOND LEVEL DFD FOR ADMIN

##### 2.2.4.1 LEVEL 2 DFD: ADMIN-LOGIN

```text
 [Admin] --request--> (Enter credentials 1.1.1)
                    --> (Validate admin account 1.1.2) --> D1 Users
                    --> (Check is_admin flag 1.1.3)
                    --> (Issue JWT token 1.1.4)
 [Admin] <--response-- (Login success with token / failure)
```

**Working:**
Admin enters email and password credentials. The system validates the account against the Users store, verifies the password hash using Werkzeug, checks that `is_admin` is true and `is_blocked` is false, and returns an authenticated JWT token or an error response.

##### 2.2.4.2 LEVEL 2 DFD: ADMIN-MANAGE USERS

```text
 [Admin] --request--> (Fetch users list with stats 1.3.1) --> D1 Users, D2 Comparisons, D3 Itineraries
 [Admin] --request--> (Update user role 1.3.2) -------------> D1 Users
 [Admin] --request--> (Search/filter users 1.3.3) ----------> D1 Users
 [Admin] <--response-- (Updated users data with counts / action status)
```

**Working:**
Admin can view all users with their comparison and itinerary counts, search by name or email, and toggle admin roles. Each user listing includes wishlist_count, comparison_count, and itinerary_count aggregated from their respective collections. Role changes are validated to prevent self-demotion.

##### 2.2.4.3 LEVEL 2 DFD: ADMIN-VIEW ACTIVITY

```text
 [Admin] --request--> (Select user for inspection 1.4.1)
 [Admin] --request--> (Load recent comparisons 1.4.2) -----> D2 Comparisons
 [Admin] --request--> (Load recent itineraries 1.4.3) -----> D3 Itineraries
 [Admin] <--response-- (Last 10 comparisons and itineraries for selected user)
```

**Working:**
Admin selects a user from the user listing to inspect their recent activity. The system queries the Comparisons and Itineraries collections for the last 10 records each, sorted by creation date, and returns them to the activity panel.

##### 2.2.4.4 LEVEL 2 DFD: ADMIN-BLOCK/UNBLOCK USERS

```text
 [Admin] --request--> (Toggle user block status 1.5.1) ----> D1 Users
                    --> (Set/clear blocked reason 1.5.2) ---> D1 Users
 [Admin] <--response-- (Updated user status)
```

**Working:**
Admin can block a user with an optional reason or unblock them. When blocked, the user's JWT validation will fail with a 403 error on subsequent requests. When unblocking, the blocked_reason field is cleared. Self-blocking is prevented.

#### 2.2.5 SECOND LEVEL DFD FOR USERS

##### 2.2.5.1 LEVEL 2 DFD: USER-REGISTER

```text
 [User] --request--> (Enter registration data 2.1.1)
                   --> (Validate email format and uniqueness 2.1.2) --> D1 Users
                   --> (Hash password with Werkzeug 2.1.3)
                   --> (Create user profile 2.1.4) -------> D1 Users
                   --> (Issue JWT token 2.1.5)
 [User] <--response-- (Registration success with token / failure)
```

**Working:**
System validates user input (name required, email must contain @ and ., password >= 6 chars), checks email uniqueness against the Users store, hashes the password, creates a new user document with empty wishlist and is_admin=false, and returns a JWT token with the user object.

##### 2.2.5.2 LEVEL 2 DFD: USER-LOGIN

```text
 [User] --request--> (Submit credentials 2.2.1)
                   --> (Verify email exists 2.2.2) ---------> D1 Users
                   --> (Check password hash 2.2.3)
                   --> (Verify not blocked 2.2.4)
                   --> (Generate JWT token 2.2.5)
 [User] <--response-- (Login success with token / failure)
```

**Working:**
System authenticates user credentials against the Users collection using Werkzeug password verification, checks that the account is not blocked, and returns a JWT token with the full user object including wishlist and profile data.

##### 2.2.5.3 LEVEL 2 DFD: USER-DISCOVER AND EXPLORE DESTINATIONS

```text
 [User] --request--> (Load popular destinations 2.3.1) ----> D4 Destinations
 [User] --request--> (Search custom destination 2.3.2)
 [User] --request--> (Get destination info 2.3.3) ---------> [Gemini AI] --> D4 Destinations
 [User] --request--> (Get destination highlights 2.3.4) ---> D4 Destinations / [Gemini AI]
 [User] <--response-- (Destination details with images, maps, attractions)
```

**Working:**
System loads 12 popular destinations from the Destinations cache (seeding if absent). Users can search for any destination. Detailed information and highlights are first checked against the cache; if not found, the system queries Google Gemini AI, caches the response for future queries, and returns structured data including attractions, cuisine, travel logistics, and seasonal information.

##### 2.2.5.4 LEVEL 2 DFD: USER-COMPARE DESTINATIONS

```text
 [User] --request--> (Enter two destinations + preferences 2.4.1)
                   --> (Check comparison cache 2.4.2) -------> D2 Comparisons
                   --> (If no cache: AI comparison 2.4.3) --> [Gemini AI]
                   --> (Save comparison result 2.4.4) -------> D2 Comparisons
 [User] <--response-- (Side-by-side scores, pros/cons, winner recommendation)
```

**Working:**
User enters two destination names and selects travel preferences (budget, duration, interests, season, travel type). The system generates an order-independent comparison key and a SHA-256 preferences hash to check for cached results. If no cache exists, Google Gemini AI performs a detailed comparison producing per-destination scores across six criteria, pros and cons, cost estimates, and a winner recommendation with reasoning. Results are persisted for future cache hits.

##### 2.2.5.5 LEVEL 2 DFD: USER-GENERATE ITINERARY

```text
 [User] --request--> (Select destination + preferences 2.5.1)
                   --> (Check itinerary cache 2.5.2) --------> D3 Itineraries
                   --> (If no cache: AI generation 2.5.3) --> [Gemini AI]
                   --> (Save itinerary 2.5.4) ---------------> D3 Itineraries
 [User] <--response-- (Day-by-day itinerary with activities, meals, costs)
```

**Working:**
User selects a winning destination (from comparison results) to generate a travel itinerary. The system checks for a cached itinerary matching the user, destination, and preferences hash. If none exists, Google Gemini AI generates a comprehensive day-by-day plan including morning/afternoon/evening activities, meal recommendations, estimated daily costs, a packing list, important tips, local phrases, and emergency contacts. The itinerary is saved for reuse.

##### 2.2.5.6 LEVEL 2 DFD: USER-MANAGE WISHLIST

```text
 [User] --request--> (Add destination to wishlist 2.6.1) --> D1 Users
 [User] --request--> (Remove from wishlist 2.6.2) ---------> D1 Users
 [User] --request--> (Check if in wishlist 2.6.3) ---------> D1 Users
 [User] --request--> (View full wishlist 2.6.4) -----------> D1 Users
 [User] <--response-- (Updated wishlist / membership check)
```

**Working:**
Users can add destinations to their personal wishlist (stored as an embedded array in the Users collection) with name, country, tagline, and image data. Duplicate checking prevents redundant entries. The wishlist can be viewed, and individual destinations can be removed. Real-time wishlist status is reflected across all pages via the AuthContext.

##### 2.2.5.7 LEVEL 2 DFD: USER-UPDATE PROFILE

```text
 [User] --request--> (Submit profile changes 2.7.1)
                   --> (Validate name and avatar 2.7.2)
                   --> (Update user document 2.7.3) --------> D1 Users
 [User] <--response-- (Updated profile data)
```

**Working:**
Users can update their display name (2-80 characters) and profile avatar (URL or base64-encoded image up to 2MB). Changes are validated via Pydantic schema and persisted to the Users collection with an updated_at timestamp.

### 2.3 DATABASE DESIGN

Wandrix uses document collections in MongoDB Atlas:

1. **users**: User identity and profile data.

| Field | Type | Description |
|---|---|---|
| `_id` | ObjectId | Unique identifier |
| `email` | String (unique) | User email address |
| `password` | String | Werkzeug-hashed password |
| `name` | String | Display name |
| `avatar_url` | String/null | Profile image URL or base64 data |
| `wishlist` | Array | Embedded array of saved destinations |
| `is_admin` | Boolean | Admin role flag |
| `is_blocked` | Boolean | Account block status |
| `blocked_reason` | String | Reason for blocking |
| `seeded_admin` | Boolean | Whether this is the environment-seeded admin |
| `created_at` | DateTime | Account creation timestamp |
| `updated_at` | DateTime | Last profile update timestamp |

2. **comparisons**: AI-generated destination comparison results.

| Field | Type | Description |
|---|---|---|
| `_id` | ObjectId | Unique identifier |
| `user_id` | String | Owner user ID |
| `destination1` | String | First destination (original) |
| `destination2` | String | Second destination (original) |
| `destination1_normalized` | String | Lowercase first destination |
| `destination2_normalized` | String | Lowercase second destination |
| `comparison_key` | String | Order-independent key (sorted, `::` joined) |
| `preferences` | Object | Original user preferences |
| `preferences_normalized` | Object | Normalized preferences for caching |
| `preferences_key` | String | SHA-256 hash of normalized preferences |
| `result` | Object | AI comparison result (scores, pros/cons, winner) |
| `source` | String | Result source (`ai`) |
| `cache_hit` | Boolean | Whether this was a cached lookup |
| `created_at` | DateTime | Creation timestamp |

3. **itineraries**: AI-generated travel itinerary plans.

| Field | Type | Description |
|---|---|---|
| `_id` | ObjectId | Unique identifier |
| `user_id` | String | Owner user ID |
| `destination` | String | Destination name (original) |
| `destination_normalized` | String | Lowercase destination name |
| `preferences` | Object | Normalized preferences |
| `preferences_key` | String | SHA-256 hash of normalized preferences |
| `itinerary` | Object | AI-generated itinerary (days, costs, tips) |
| `created_at` | DateTime | Creation timestamp |

4. **destinations**: Cached destination data for highlights and details.

| Field | Type | Description |
|---|---|---|
| `_id` | ObjectId | Unique identifier |
| `name` | String | Destination display name |
| `name_lower` | String (unique) | Lowercase name for lookups |
| `country` | String | Country name |
| `tagline` | String | Short destination tagline |
| `highlights` | Object | Cached highlight data (cultural, culinary, attractions) |
| `source` | String | Data source (`seed` or `ai`) |
| `created_at` | DateTime | First creation timestamp |
| `updated_at` | DateTime | Last update timestamp |

### 2.4 SYSTEM DESIGN

#### 2.4.1 ARCHITECTURE

- **Frontend**: React 19 single-page application with role-based page rendering, Context API state management, and 3D WebGL visual effects.
- **Backend**: Flask REST API with blueprint-based modular routing, Pydantic request validation, and centralized response formatting.
- **Database**: MongoDB Atlas with document collections, compound indexes, and file-based JSON fallback.
- **AI Engine**: Google Gemini 1.5 (Flash/Pro) with structured JSON prompting, automatic model selection, and retry with exponential backoff.
- **Security**: JWT (HS256) for protected endpoints, Werkzeug password hashing, role-based admin guards, and blocked-user enforcement.

#### 2.4.2 ROUTE GROUPS

- `/api/auth` — Authentication and user profile management (register, login, profile, wishlist)
- `/api` — Core API endpoints (health, destinations, comparison, itinerary, images)
- `/api/admin` — Admin governance endpoints (users, metrics, moderation)

### 2.5 PRISMA DFD (LEVEL 0 TO LEVEL 2)

> **Assumption used in this report:** PRISMA DFD is treated as a governance-focused DFD view emphasizing privacy, role control, integrity, and monitoring.

#### 2.5.1 PRISMA LEVEL 0

```text
 [User] --------------------------> (Wandrix PRISMA Governance Flow)
    | PII, preferences, wishlist input
 [Admin] -------------------------> (Wandrix PRISMA Governance Flow)
    | moderation, role overrides

 (Wandrix PRISMA Governance Flow) --> [User]   | role-based responses
 (Wandrix PRISMA Governance Flow) --> [Admin]  | auditable governance reports

 Governance Data Stores:
    <--> D1 [Identity & Access Records]
    <--> D2 [AI-Generated Analysis Records]
    <--> D3 [Cached Destination Data]
    <--> D4 [Audit & History Trails]
```

**Working of PRISMA Level 0:**
The platform is represented as one governance-aware process that receives sensitive user inputs (credentials, preferences, profile data) and admin moderation commands, applies controlled processing with role-based access, and returns auditable outputs.

#### 2.5.2 PRISMA LEVEL 1

```text
 Entities:
    [User], [Admin]

 Processes:
    (P1 Identity Verification)
    (P2 Access Authorization)
    (P3 AI Interaction Integrity)
    (P4 Data Caching Consistency)
    (P5 User Moderation Control)
    (P6 Monitoring & Audit Reporting)

 Core Flow:
    [User]  -> (P1) -> (P2)
    [Admin] -> (P1) -> (P2)

    (P2) -> (P3), (P4), (P5)
    (P3) -> (P6)
    (P4) -> (P6)
    (P5) -> (P6)
    (P6) -> [Admin]

 Data Store Interaction:
    (P1) <--> D1 [Users]
    (P3) <--> D2 [Comparisons, Itineraries]
    (P4) <--> D3 [Destinations]
    (P5) <--> D1 [Users]
    (P6) <--> D1, D2, D3
```

**Working of PRISMA Level 1:**
Governance responsibilities are split into identity verification (JWT validation), access authorization (role guards), AI interaction integrity (structured prompting, response validation), data caching consistency (SHA-256 preference hashing, order-independent keys), user moderation (block/unblock enforcement), and audit reporting (activity inspection). Each controlled flow maps to one or more persistent stores.

#### 2.5.3 PRISMA LEVEL 2

```text
 Entities: [User], [Admin]

 Detailed Control Processes:
    (P2.1 JWT Issue & Validate)
          -> (P2.2 Role Guard Enforcement)
          -> (P2.3 Input & Pydantic Validation)
          -> (P2.4 Blocked User Enforcement)
          -> (P2.5 AI Response Integrity Check)
          -> (P2.6 Cache Key Consistency)

 Actor Entry:
    [User]  -> (P2.1) -> (P2.2) -> (P2.4)
    [Admin] -> (P2.1) -> (P2.2) -> (P2.4)

 Data Store Usage:
    (P2.3) -> D1 [Users], D2 [Comparisons], D3 [Itineraries]
    (P2.4) -> D1 [Users]
    (P2.5) -> D2 [Comparisons], D3 [Itineraries], D4 [Destinations]
    (P2.6) -> D2 [Comparisons], D3 [Itineraries]

 Output:
    (P2.5) -> [User]  (validated AI responses)
    (P2.2) -> [Admin] (authorized governance actions)
```

**Working of PRISMA Level 2:**
Detailed control points are applied to real workflows: JWT token validation with HS256 and expiration checks, role-based admin guards preventing privilege escalation, Pydantic schema validation for all inputs, blocked-user enforcement at the authentication layer, AI response integrity checks with JSON parsing retry logic, and cache key consistency using SHA-256 preference hashing with order-independent comparison keys.

---

## 3. DEVELOPMENT PHASE

### 3.1 SYSTEM ENVIRONMENT

- Python 3.9+
- Flask 3.x
- PyMongo 4.x (MongoDB Atlas driver)
- PyJWT (JWT authentication)
- Pydantic v2 (request validation)
- Flask-CORS (cross-origin support)
- Google GenerativeAI SDK (Gemini AI integration)
- Werkzeug (password hashing)
- React 19.2
- Vite 7 (Rolldown-Vite build tool)
- React Router DOM 7.13
- Three.js 0.183 (3D WebGL effects)
- OGL 1.0 (lightweight WebGL framework)
- MongoDB Atlas (cloud database)
- ESLint 9 (code linting)

### 3.2 CODING

Development follows modular coding:

- `backend/routes/api.py` — Core destination, comparison, and itinerary API endpoints.
- `backend/routes/auth.py` — Authentication, profile, and wishlist endpoints.
- `backend/routes/admin.py` — Admin governance and user management endpoints.
- `backend/services/gemini_service.py` — Google Gemini AI integration with structured prompting.
- `backend/services/destination_cache_service.py` — Destination data caching layer.
- `backend/services/user_data_service.py` — Comparison and itinerary persistence with cache logic.
- `backend/services/admin_seed_service.py` — Environment-based admin user seeding.
- `backend/models.py` — Pydantic v2 request/response validation schemas.
- `backend/auth_utils.py` — JWT generation, validation, and role-based decorators.
- `backend/database.py` — MongoDB connection with retry, pooling, indexes, and fallback.
- `frontend/src/pages/*` — 9 page components (Home, About, Compare, Explore, Profile, Admin, Wishlist, Login, Register).
- `frontend/src/components/*` — 14 reusable components (Header, PreferencesForm, ComparisonResult, DestinationInput, ItineraryView, LoadingScreen, LightPillar, LightRays, etc.)
- `frontend/src/context/AuthContext.jsx` — Authentication and wishlist state management.
- `frontend/src/context/StartupLoadingContext.jsx` — Animated startup loading screen.
- `frontend/src/hooks/useUserComparisons.js` — Comparison history data fetching.
- `frontend/src/hooks/useUserItineraries.js` — Itinerary history data fetching.
- `frontend/src/services/api.js` — Centralized HTTP layer with 23 API methods.

---

## 4. TESTING AND IMPLEMENTATION

### 4.1 TESTING

- API connectivity validation (`GET /api/health`, `GET /api/db/status`).
- Authentication flow testing (registration, login, token validation, blocked user rejection).
- Destination exploration testing (popular list loading, custom search, AI info/highlights generation).
- Comparison workflow testing (cache miss → AI generation → cache hit on repeat).
- Itinerary generation testing (preference-based generation, cache behavior).
- Wishlist operations testing (add, remove, duplicate prevention, cross-page sync).
- Admin governance testing (role changes, user blocking, password reset, cascade deletion).
- Role authorization boundary checks (user vs admin endpoint access).
- Database resilience testing (MongoDB connection retry, file-based fallback).

### 4.2 TEST CASES

1. User registration with valid credentials — expects HTTP 201 with JWT token and user object.
2. User registration with duplicate email — expects HTTP 409 conflict error.
3. User login with valid credentials — expects HTTP 200 with JWT token.
4. User login with wrong password — expects HTTP 401 unauthorized.
5. Blocked user login attempt — expects HTTP 403 forbidden with blocked reason.
6. Popular destinations listing — expects array of 12 destinations with name, country, tagline.
7. Destination info retrieval — expects structured JSON with attractions, cuisine, travel logistics.
8. Destination highlights with cache — expects faster response on second request for same destination.
9. Comparison of two destinations — expects scores across 6 criteria, pros/cons, winner recommendation.
10. Comparison cache hit — expects identical result with `cache_hit: true` on repeat query.
11. Itinerary generation — expects day-by-day plan with activities, meals, costs, packing list.
12. Wishlist add operation — expects updated wishlist array with added destination.
13. Wishlist duplicate prevention — expects HTTP 409 when adding same destination twice.
14. Admin user listing with stats — expects all users with comparison/itinerary counts.
15. Admin role toggle — expects updated is_admin flag; self-demotion prevented.
16. Admin block user — expects is_blocked=true with reason; subsequent login rejected.
17. Admin delete user — expects user removed with cascaded comparison/itinerary cleanup.
18. Profile update — expects updated name and avatar_url in response.
19. Unauthenticated access to protected endpoint — expects HTTP 401.
20. Non-admin access to admin endpoint — expects HTTP 403.

---

## 5. SCREEN LAYOUTS

### 5.1 FORM DESIGN

#### User Screens
- **Home Page** — Editorial hero section with floating destination cards, stats row, and numbered features strip.
- **Login Page** — Email and password form with validation feedback and sign-up link.
- **Register Page** — Name, email, and password form with validation rules and sign-in link.
- **Compare Page** — Two destination inputs with VS badge, preferences form (budget, duration, interests, season, travel type), AI recommendation button, and side-by-side result display.
- **Explore Page** — Search bar, popular destinations grid, custom search result card, destination detail modal with map, gallery, attractions, cuisine, travel tips, and action buttons.
- **Wishlist Page** — Grid of saved destinations with remove action and compare shortcut.
- **Profile Page** — Header card with avatar, user details, and member badge; dashboard grid with account info, travel stats, and quick actions; edit profile modal.
- **About Page** — Hero section, stats, mission with glass cards, numbered values strip, pillars section, and CTA.
- **Itinerary View** — Timeline layout with day cards, morning/afternoon/evening activities, meal recommendations, daily costs, packing list, tips, local phrases, and emergency contacts.

#### Admin Screens
- **Admin Dashboard** — Header with title, 4 metric cards (users, admins, comparisons, itineraries), two-panel layout with searchable user list and activity inspection panel.

---

## 6. CONCLUSION AND FUTURE SCOPE

### 6.1 CONCLUSION

Wandrix successfully implements a complete AI-powered travel planning platform with intelligent destination comparison, automated itinerary generation, destination exploration with rich media, and personal wishlist management. The project demonstrates practical integration of modern frontend technologies (React 19, Vite, Three.js) with a robust backend stack (Flask, MongoDB Atlas, Google Gemini AI) and a premium glassmorphism design system. The role-based architecture provides secure platform governance with comprehensive admin tools for user management and activity monitoring.

### 6.2 FUTURE SCOPE

- Real-time collaborative trip planning with shared itineraries.
- ML-based destination recommendation engine using user behavior patterns.
- Integration with flight and hotel booking APIs for end-to-end trip booking.
- Mobile-responsive Progressive Web App (PWA) with offline itinerary access.
- Multi-language support for global accessibility.
- Social features: user reviews, destination ratings, and trip sharing.
- Advanced analytics dashboard for admins with usage trends and AI cost tracking.
- Budget optimization engine that suggests destinations matching exact budget constraints.
- Integration with map services for interactive route planning within itineraries.

---

## 7. BIBLIOGRAPHY

### 7.1 BOOKS OF REFERENCE

1. Ian Sommerville, *Software Engineering*.
2. Silberschatz, Korth, Sudarshan, *Database System Concepts*.
3. Pressman & Maxim, *Software Engineering: A Practitioner's Approach*.

### 7.2 WEBLIOGRAPHY

1. https://flask.palletsprojects.com/
2. https://react.dev/
3. https://vitejs.dev/
4. https://www.mongodb.com/docs/
5. https://jwt.io/
6. https://ai.google.dev/docs
7. https://pydantic-docs.helpmanual.io/
8. https://reactrouter.com/
9. https://threejs.org/docs/
10. https://unsplash.com/documentation
