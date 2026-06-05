# Cybernaut Social Graph

Cybernaut is a full-stack social graph app for managing users, hobbies, friendships, popularity scores, and explainable recommendations. The frontend uses React, Vite, and React Flow; the backend uses Express, MongoDB, and Mongoose.

## Features

- User CRUD with validation for username, age, and hobbies
- Bidirectional friend linking and unlinking
- Delete protection for users who still have friendships
- Interactive graph visualization of users and friendship edges
- Popularity scoring from friend count and shared hobbies
- Friend and hobby recommendations with accept/reject feedback
- Backend logic tests for the core business rules

## Tech Stack

- Frontend: React 19, Vite, React Flow, Axios, Tailwind CSS
- Backend: Node.js, Express 5, MongoDB, Mongoose
- Testing: Node-based backend logic tests

## Prerequisites

- Node.js 18 or newer
- npm
- MongoDB local instance or MongoDB Atlas database

## Setup

1. Clone the repository.

```bash
git clone <repo-url>
cd "Social Graph"
```

2. Create the backend environment file.

```bash
cp .env.example backend/.env
```

Update `backend/.env` with your MongoDB connection string.

Optional frontend environment file:

```bash
cp .env.example frontend/.env
```

The frontend uses `VITE_API_BASE_URL` when present and otherwise falls back to `http://localhost:5000/api`.

3. Install backend dependencies and start the API.

```bash
cd backend
npm install
npm run dev
```

The backend runs on `http://localhost:5000` by default.

4. Install frontend dependencies and start the app in another terminal.

```bash
cd frontend
npm install
npm run dev
```

Vite prints the local frontend URL, usually `http://localhost:5173`.

## Environment Variables

The backend reads:

```bash
MONGO_URI=mongodb://127.0.0.1:27017/cybernaut_social_graph
PORT=5000
NODE_ENV=development
```

See [.env.example](.env.example).

## API Documentation

Machine-readable API documentation is available at [docs/openapi.yaml](docs/openapi.yaml).

Base URL:

```text
http://localhost:5000/api
```

Main endpoints:

- `GET /users` - list users
- `POST /users` - create user
- `PUT /users/{id}` - update user
- `DELETE /users/{id}` - delete user if they have no friendships
- `POST /users/{id}/link` - create a bidirectional friendship
- `DELETE /users/{id}/unlink` - remove a bidirectional friendship
- `GET /users/{id}/recommendations` - fetch friend and hobby recommendations
- `POST /users/{id}/recommendations/feedback` - submit recommendation feedback
- `GET /graph` - fetch React Flow nodes and edges

## Testing

Run backend logic tests:

```bash
cd backend
npm test
```

Build the frontend:

```bash
cd frontend
npm run build
```

## Project Structure

```text
backend/
  src/
    app.js
    server.js
    controllers/
    middleware/
    models/
    routes/
    services/
    tests/
frontend/
  src/
    components/
    context/
    pages/
    services/
docs/
  openapi.yaml
ARCHITECTURE.md
DEBUG_NOTES.md
PROMPT_DISCLOSURE.md
.env.example
```

## Bonus Feature Notes

- Rejected recommendation feedback is persisted and used to hide future rejected friend suggestions.
- Accepting a friend recommendation can create the friendship automatically when the users are not already linked.
- The graph uses custom high-score and low-score node components to make popularity visible at a glance.
- Popularity is recalculated after friend and hobby changes, keeping the graph and list views consistent.