# Wandrix Backend API

Flask backend for Wandrix (auth, AI compare/itinerary, wishlist, admin).

## Run (Development)

```bash
cd backend
pip install -r requirements.txt
python app.py
```

Backend starts at: `http://localhost:5000`

## Environment Variables (`backend/.env`)

Required:

- `GEMINI_API_KEY`

Common:

- `MONGODB_URI`
- `UNSPLASH_ACCESS_KEY`
- `SECRET_KEY`
- `JWT_SECRET`
- `JWT_EXPIRATION_HOURS`
- `ADMIN_EMAIL`
- `ADMIN_PASSWORD`
- `ADMIN_NAME`
- `FLASK_DEBUG` (default in code is `False`)

Optional:

- `VERBOSE_DB=1` to enable detailed DB logs

## API Base

- `http://localhost:5000/api`

## Endpoints

### Public

- `GET /api/health`
- `GET /api/db/status`
- `GET /api/destinations/popular`
- `GET /api/images/destination?destination=Paris&w=800&h=600`
- `POST /api/destination/info`
- `POST /api/destination/highlights`

### Auth

- `POST /api/auth/register`
- `POST /api/auth/login`
- `GET /api/auth/me` (JWT)
- `PUT /api/auth/profile` (JWT)
- `GET /api/auth/wishlist` (JWT)
- `POST /api/auth/wishlist/add` (JWT)
- `POST /api/auth/wishlist/remove` (JWT)
- `GET /api/auth/wishlist/check/<destination_name>` (JWT)

### Compare / Itinerary (JWT)

- `POST /api/compare`
- `GET /api/comparisons/history`
- `POST /api/itinerary/generate`
- `GET /api/itinerary/<itinerary_id>`
- `GET /api/itineraries/history`

### Admin (JWT admin)

- `GET /api/admin/overview`
- `GET /api/admin/users`
- `PATCH /api/admin/users/<user_id>/role`
- `PATCH /api/admin/users/<user_id>/status`
- `PATCH /api/admin/users/<user_id>/password`
- `GET /api/admin/users/<user_id>/activity`
- `DELETE /api/admin/users/<user_id>`

## Notes

- MongoDB fallback exists for limited local resilience, but full features are best with MongoDB available.
- Responses use a wrapped `success_response`/`error_response` format.
