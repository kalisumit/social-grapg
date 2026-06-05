# Architecture

## Overview

Cybernaut is a social graph application with a React/Vite frontend and an Express/MongoDB backend. Users have hobbies, friendships, and a calculated popularity score. The frontend renders the network with React Flow and calls REST endpoints for CRUD, linking, graph data, recommendations, and feedback.

## Runtime Flow

```text
React UI
  -> services/userApi.js and services/graphApi.js
  -> Express routes under /api
  -> controllers
  -> Mongoose models and recommendation/popularity services
  -> MongoDB
```

## Key Design Tradeoffs

### 1. MongoDB documents instead of relational tables

Choice: MongoDB with Mongoose.

Why:
- Users naturally store `hobbies` and `friends` as arrays.
- The assignment benefits from fast iteration without migration overhead.
- Mongoose schemas still provide enough structure for validation and references.

Tradeoff:
- Friend relationships are stored as duplicated bidirectional references, so link/unlink operations must update both users correctly.
- Complex graph queries would be easier to express with a graph database or SQL joins at larger scale.

### 2. REST endpoints instead of GraphQL

Choice: REST API with resource-oriented Express routes.

Why:
- The app has predictable operations: users, graph data, friendship links, recommendations, and feedback.
- REST keeps API testing simple with Postman, curl, or OpenAPI.
- It avoids adding another server layer for a small application.

Tradeoff:
- The frontend may need multiple requests when a richer dashboard needs users, graph data, and recommendations together.
- GraphQL would give clients more control over nested response shapes.

### 3. Rule-based recommendations instead of machine learning

Choice: Explainable scoring from mutual friends and shared hobbies, with rejected feedback used to suppress future suggestions.

Current friend recommendation scoring:

```text
score = mutualFriends * 3 + sharedHobbies * 2
```

Why:
- It is deterministic and easy to debug.
- It works without training data.
- The UI can explain why each recommendation appears.

Tradeoff:
- Static weights may need manual tuning as real usage data grows.
- It cannot discover deeper behavioral patterns that embeddings or collaborative filtering might find.

## Rejected Alternatives

### 1. Redux Toolkit for state management

Rejected because the app only needs a compact shared state layer for users, selected user, recommendations, loading, and errors. React Context keeps the implementation lighter and easier to inspect. Redux Toolkit would become more attractive if the app gained multiple pages, optimistic updates, offline state, or complex undo/redo behavior.

### 2. Neo4j or another graph database

Rejected because the current graph operations are simple enough for MongoDB references. A graph database would make multi-hop traversal more natural, but it would add setup complexity and a second query model before the project needs it.

## Data Model

### User

```text
username: string
age: number
hobbies: string[]
friends: ObjectId[] referencing User
popularityScore: number
timestamps
```

### Feedback

```text
userId: ObjectId referencing User
targetUserId: ObjectId referencing User
accepted: boolean
timestamps
```

## Main Backend Modules

- `backend/src/app.js` wires Express middleware and routes.
- `backend/src/server.js` connects MongoDB and starts the server.
- `backend/src/controllers/userController.js` handles user CRUD and friendship link/unlink operations.
- `backend/src/controllers/graphController.js` builds React Flow nodes and edges.
- `backend/src/controllers/recommendationController.js` returns friend and hobby recommendations.
- `backend/src/controllers/feedbackController.js` stores recommendation feedback and links accepted users.
- `backend/src/services/popularityService.js` calculates popularity.
- `backend/src/services/recomendationService.js` ranks recommendations and filters rejected suggestions.

## API Surface

- `GET /api/users`
- `POST /api/users`
- `PUT /api/users/:id`
- `DELETE /api/users/:id`
- `POST /api/users/:id/link`
- `DELETE /api/users/:id/unlink`
- `GET /api/users/:id/recommendations`
- `POST /api/users/:id/recommendations/feedback`
- `GET /api/graph`

Full API documentation is in [docs/openapi.yaml](docs/openapi.yaml).

## Performance Notes

- Popularity is recalculated when users are fetched and after friendship or hobby changes.
- Recommendation ranking currently scans candidate users, which is acceptable for a small assignment dataset.
- Future scaling options include indexing, cached recommendation results, pagination, and a graph database for heavier multi-hop queries.

## Known Limitations

- No authentication or authorization.
- No pagination on `GET /api/users`.
- No transaction wrapper for bidirectional friendship writes.
- Recommendation weights are hardcoded.
- Frontend API base URLs are currently defined in service files rather than injected through Vite environment variables.
