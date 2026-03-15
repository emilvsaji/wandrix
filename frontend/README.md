# Wandrix Frontend

React + Vite frontend for Wandrix.

## Stack

- React 19
- React Router DOM 7
- Vite (via `rolldown-vite`)
- ESLint 9

## Run (Development)

```bash
cd frontend
npm install
npm run dev
```

Default URL: `http://localhost:5173`

## Build

```bash
cd frontend
npm run build
npm run preview
```

## API

The frontend talks to the backend at:

- `http://localhost:5050/api`

Configured in:

- `src/services/api.js`

## Main App Features

- Auth (register/login/profile)
- Destination explore + wishlist
- AI destination comparison
- AI itinerary generation
- Comparison and itinerary history
- Admin dashboard and user management (admin users)

## Notes

- Keep backend running while using frontend features that call APIs.
- Protected routes/actions require JWT token in local storage (`wandrix_token`).
