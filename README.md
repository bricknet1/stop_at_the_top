# Stop at the Top

Real-time multiplayer card game with a React client and a Flask + Socket.IO backend. Players enter a display name, create or join tables with room codes, and play with live updates over WebSockets — no accounts or saved profiles.

## Credits

- **Original physical card game:** Josiah Jenkins.
- **This web application:** Nick Johnson.

## Tech stack

| Layer | Technologies |
|--------|----------------|
| **Client** | React 18, Redux Toolkit, React Router, Socket.IO client, Create React App |
| **Server** | Flask, Flask-RESTful, Flask-SocketIO, Flask-SQLAlchemy, Flask-Migrate |
| **Data** | In-memory tables during play; SQLite/PostgreSQL only for optional migrations (no player accounts) |

## Prerequisites

- **Python** 3.8 or newer (the [Pipfile](Pipfile) pins 3.8.13; newer 3.x versions usually work)
- **Node.js** 18.x through 22.x (see [client/package.json](client/package.json) `engines`)
- **pipenv** (recommended) **or** `pip` with a virtual environment using [requirements.txt](requirements.txt)

## Environment variables

Create a `.env` file in the **repository root** (same level as `Pipfile`). The server loads it automatically.

| Variable | When | Purpose |
|----------|------|---------|
| `APP_SECRET_KEY` | Always in production; recommended locally | Flask session signing. Generate with e.g. `python -c "import secrets; print(secrets.token_hex(32))"`. |
| `RENDER` | Production (e.g. Render) | When set, the app uses production CORS and expects PostgreSQL. |
| `DATABASE_URL` or `DATABASE_URI` | Production | PostgreSQL connection string (Render injects `DATABASE_URL` when a database is linked). |

Local development uses SQLite unless you override the database URI in code or environment.

## Quick start (development)

### 1. Install dependencies

From the repository root:

```bash
pipenv install
cd client && npm install && cd ..
```

### 2. Database (first run or after pulling new migrations)

Run migrations once to apply schema changes (legacy `users` table is dropped). No seed users are required—players pick a display name when creating or joining a table.

```bash
cd server
export FLASK_APP=app   # Windows (cmd): set FLASK_APP=app
pipenv run flask db upgrade
cd ..
```

This repository already includes a `server/migrations/` tree, so you normally run **`db upgrade`** only, not `flask db init`.

### 3. Run the backend

```bash
cd server
pipenv run python app.py
```

The API and Socket.IO server listen on **http://localhost:5555** by default.

### 4. Run the client

In a second terminal:

```bash
cd client
npm start
```

The dev server runs on **http://localhost:3000** and proxies API requests to port 5555 (see `proxy` in [client/package.json](client/package.json)).

### Optional: one command for API + client

From the repository root, with [Honcho](https://github.com/nickstenning/honcho) (installed via Pipfile):

```bash
pipenv run honcho -f Procfile.dev start
```

This starts the React app (with `PORT=4000`) and Gunicorn bound to `127.0.0.1:5555`. Adjust ports in [Procfile.dev](Procfile.dev) if they conflict with other services.

## Production build

Build the React app so Flask can serve static files from `client/build` (see [server/config.py](server/config.py)):

```bash
cd client
npm run build
cd ..
```

Run the WSGI server from the repository root:

```bash
gunicorn --chdir server app:app
```

Tune workers, bind address, and [Socket.IO-compatible worker classes](https://flask-socketio.readthedocs.io/en/latest/deployment.html) for your hosting environment.

## Project layout

```
stop_at_the_top/
├── client/          # React SPA (CRA)
├── server/          # Flask app, models, migrations, seed
├── Pipfile          # Python dependencies (pipenv)
├── requirements.txt # Pinned Python deps (pip / alternative installs)
├── Procfile.dev     # Local API + web via Honcho
└── .env             # Local secrets (not committed; see .gitignore)
```

## Scripts reference

| Location | Command | Purpose |
|----------|---------|---------|
| `client/` | `npm start` | Dev server with hot reload |
| `client/` | `npm run build` | Production bundle into `client/build` |
| `client/` | `npm test` | Jest test runner |
| `server/` | `python app.py` | Dev server with debug + Socket.IO on port 5555 |
| `server/` | `flask db upgrade` | Apply database migrations (`FLASK_APP=app`) |
| `server/` | `python seed.py` | No-op (players are ephemeral, in-memory only) |

## Deployment notes

- Production mode is detected when the `RENDER` environment variable is set ([server/config.py](server/config.py)).
- CORS is restricted to `https://stopatthetop.onrender.com` in that mode; update the origin if you change the public URL.
- Ensure `DATABASE_URL` / `DATABASE_URI` and `APP_SECRET_KEY` are set on the host.
