# Wandrix — Setup Guide

This guide explains how to set up and run the Wandrix project locally (backend and frontend).

## Prerequisites

- Python 3.10 or newer
- Node.js 18+ and npm
- Git
- MongoDB (local) or a MongoDB Atlas connection string

## Repository

Clone the repository (if you haven't already):

```bash
git clone <repo-url>
cd Wandrix
```

## Backend (Python / Flask)

1. Open a terminal and change into the backend folder:

```bash
cd backend
```

2. Create and activate a virtual environment (recommended)

PowerShell (recommended on Windows):

```powershell
python -m venv ..\.venv
..\.venv\Scripts\Activate.ps1
```

Command Prompt (cmd.exe):

```cmd
python -m venv ..\.venv
..\.venv\Scripts\activate
```

3. Install Python dependencies

```bash
pip install -r requirements.txt
```

4. Configure environment variables

Create a `.env` file inside the `backend` directory with the following variables (example):

```
MONGODB_URI=mongodb://localhost:27017/wandrix
GEMINI_API_KEY=
SECRET_KEY=your-secret-key
JWT_SECRET=your-jwt-secret
FLASK_ENV=development
FLASK_DEBUG=False
JWT_EXPIRATION_HOURS=24
UNSPLASH_ACCESS_KEY=
ADMIN_EMAIL=
ADMIN_PASSWORD=
ADMIN_NAME=Wandrix Admin
```

Notes:
- `MONGODB_URI` can point to a local MongoDB or MongoDB Atlas.
- Provide a valid `GEMINI_API_KEY` if you intend to use the Gemini/Generative AI features.

5. Run the backend server (development)

```bash
python app.py
```

By default the server will start on `http://0.0.0.0:5000`.

### Minimal daily command flow

If your workspace terminal is configured to use the project interpreter, you can run directly without manual activation:

```bash
cd backend
python app.py
```

6. Optional: Run with a production WSGI server (Linux / WSL)

```bash
gunicorn -w 4 -b 0.0.0.0:5000 app:create_app
```

## Frontend (React / Vite)

1. Open a new terminal and change into the frontend folder:

```bash
cd frontend
```

2. Install node dependencies

```bash
npm install
```

3. Start the dev server

```bash
npm run dev
```

The Vite dev server typically runs at `http://localhost:5173` and the frontend is configured to interact with the backend APIs at `http://localhost:5000` (CORS is enabled in the backend for common localhost ports).

## Running Both Locally

- Start the backend in one terminal (`cd backend` → `python app.py`).
- Start the frontend in another terminal (`cd frontend` → `npm run dev`).

## VS Code Terminal Noise (Activation Path)

If you see the full `...\.venv\Scripts\Activate.ps1` command printed every time a terminal opens, disable auto-activation in workspace settings:

```json
{
	"python.defaultInterpreterPath": "${workspaceFolder}\\.venv\\Scripts\\python.exe",
	"python.terminal.activateEnvironment": false,
	"terminal.integrated.env.windows": {
		"PATH": "${workspaceFolder}\\.venv\\Scripts;${env:PATH}"
	}
}
```

Then open a new terminal.

## Tests

If you want to run the backend tests:

```bash
cd backend
pip install pytest
pytest -q
```

Adjust or add testing dependencies as needed.

## Troubleshooting

- Database connection errors: verify `MONGODB_URI` and that MongoDB is reachable.
- Port in use: ensure ports `5000` (backend) and `5173` (frontend) are free or change them.
- Missing API key: provide `GEMINI_API_KEY` in `.env` if you need Gemini features.
- `python` not found: ensure `.venv\Scripts` is in terminal `PATH` or activate the environment manually.

## Production & Deployment Notes

- Use a production-ready WSGI server (gunicorn / uWSGI) behind a reverse proxy.
- Set `FLASK_DEBUG=False` and ensure `SECRET_KEY` and `JWT_SECRET` are strong and kept secret.
- Consider containerizing the backend and frontend with Docker for consistent deployments.

## Where to Look Next

- Backend code: backend/app.py, backend/routes
- Frontend code: frontend/src
- Environment variables and config: backend/config.py

If you'd like, I can also create example Dockerfiles, a `docker-compose.yml`, or add a simple Makefile to simplify local commands.
