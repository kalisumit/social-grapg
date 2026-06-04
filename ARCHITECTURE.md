# Architecture Documentation - Cybernaut Project

## Project Overview
Cybernaut is a full-stack social network application that manages users, friendships, and hobby recommendations using a graph-based approach with AI-powered suggestions.

---

## Key Design Tradeoffs

### 1. **MongoDB (NoSQL) vs. PostgreSQL (SQL)**

**Choice: MongoDB**

**Rationale:**
- **Flexibility**: Hobbies and friends are stored as arrays, which MongoDB handles naturally with BSON arrays
- **Development Speed**: Schema-less design allowed rapid iteration without migrations
- **Performance**: Document-based storage aligns well with our user + relationships model
- **Scalability**: Better horizontal scaling for graph data

**Tradeoff:**
- ❌ Less mature JOIN operations for complex multi-table queries
- ❌ No built-in transaction support (though added in recent versions)
- ✅ Gained simplicity in array/nested data handling

---

### 2. **React Context vs. Redux Toolkit for State Management**

**Choice: React Context**

**Rationale:**
- **Simplicity**: Reduced boilerplate for a medium-sized app (~5 pages, 3-4 top-level states)
- **Bundle Size**: No additional dependencies, keeping bundle lean
- **Learning Curve**: Easier for contributors to understand and modify
- **Performance**: Sufficient for current dataset size (1000 users)

**Tradeoff:**
- ❌ Context causes re-renders of all consumers when any state updates (though optimized with useCallback)
- ❌ Harder to implement time-travel debugging and DevTools
- ✅ Avoided unnecessary complexity for current needs

**Migration Path**: If performance becomes an issue with 10k+ users, Redux Toolkit can be dropped in as a replacement

---

### 3. **Rule-Based Recommendation Engine vs. Machine Learning (Semantic Embeddings)**

**Choice: Rule-Based Hybrid Engine**

**Rationale:**
- **Explainability**: Human-readable rules (mutual friends, shared hobbies) are testable and debuggable
- **No Training Data Needed**: Immediate functionality without data collection phase
- **Transparency**: Users understand why a recommendation was made (sourceSignals field)
- **Performance**: O(n) computation vs. ML model inference overhead

**Formula:**
```
score = (mutualFriends * 3) + (sharedHobbies * 2) + feedbackBoost(±5)
```

**Tradeoff:**
- ❌ Cannot discover non-obvious patterns (e.g., "users who like photography often like hiking")
- ❌ Static weights require manual tuning as user base grows
- ✅ Gained immediate deployment and debuggability
- ✅ Can seamlessly add semantic embeddings later (stacked recommendation ensemble)

---

## Rejected Alternatives & Why

### Alternative 1: **GraphQL API instead of REST**

**Why Rejected:**
- **Overhead**: Added complexity for simple CRUD operations
- **Team Unfamiliar**: Assumed team is more comfortable with REST
- **Caching**: REST + HTTP caching easier than GraphQL cache management for frontend
- **Learning Curve**: Extra 4-6 hours of setup and documentation
- **Deprecation Risk**: Simpler REST endpoints are less likely to break during refactoring

**Better Suited For**: If we had complex nested queries (e.g., "get all friends' friends who share hobby X and live nearby")

---

### Alternative 2: **JWT Authentication vs. No Auth (Current)**

**Why Rejected:**
- **Scope Creep**: Assignment didn't require authentication; adding it adds ~2 hours of work
- **Security Later**: Can be bolted on post-MVP without refactoring core logic
- **Testing Simpler**: Direct API testing without auth token management
- **Deployment Faster**: No need for secret key management, .env complexity

**Current Assumption:** Running on trusted network. Once deployed publicly, JWT (Bearer tokens) + session refresh will be immediate next phase.

**Migration Note:** Controllers are stateless, so adding auth middleware is straightforward (just add `router.use(authMiddleware)` before routes).

---

## System Architecture Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                     Frontend (React + Vite)                 │
│  ┌──────────────┬─────────────┬──────────────────────────┐  │
│  │  UserPanel   │ FriendLink  │  Recommendations Panel  │  │
│  │  (CRUD User) │  (Link/     │  (Display + Feedback)   │  │
│  │              │   Unlink)   │                         │  │
│  └──────────────┴──────┬──────┴──────────────────────────┘  │
│                        │                                     │
│  ┌────────────────────────────────────────────────────────┐ │
│  │ Graph.jsx (React Flow Visualization)                   │ │
│  │ - Dynamic nodes (HighScore/LowScore)                  │ │
│  │ - Edges show friendships                              │ │
│  │ - Real-time updates on friendship changes             │ │
│  └────────────────────────────────────────────────────────┘ │
│                        │                                     │
│  ┌────────────────────────────────────────────────────────┐ │
│  │ UserContext (Global State Management)                  │ │
│  │ - users[], selectedUserId, recommendations             │ │
│  │ - fetchUsers(), selectUser(), submitFeedback()         │ │
│  └────────────────────────────────────────────────────────┘ │
└─────────────────┬───────────────────────────────────────────┘
                  │ HTTP REST API
┌─────────────────────────────────────────────────────────────┐
│              Backend (Express.js + MongoDB)                 │
│                                                              │
│  Routes:                                                    │
│  ├── POST   /api/users              → Create user          │
│  ├── GET    /api/users              → List all users       │
│  ├── PUT    /api/users/:id          → Update user          │
│  ├── DELETE /api/users/:id          → Delete user (if ok)  │
│  ├── POST   /api/users/:id/link     → Add friendship       │
│  ├── DELETE /api/users/:id/unlink   → Remove friendship    │
│  ├── GET    /api/users/:id/recs     → Get recommendations  │
│  ├── POST   /api/users/:id/feedback → Submit feedback      │
│  └── GET    /api/graph              → Get graph data       │
│                                                              │
│  Services:                                                  │
│  ├── popularityService.js                                  │
│  │   - calculatePopularity(user, friendDocs)               │
│  │                                                         │
│  ├── recommendationService.js                              │
│  │   - getFriendRecommendation(userId) → top 5 friends    │
│  │   - getHobbyRecommendations(userId) → top 5 hobbies    │
│  │                                                         │
│  └── middleware/validation.js                              │
│      - Input validation + error handling                   │
│                                                              │
│  Database (MongoDB):                                        │
│  ├── Users collection                                      │
│  │   {_id, username, age, hobbies[], friends[], score}    │
│  ├── Feedback collection                                  │
│  │   {_id, userId, targetUserId, accepted, timestamp}    │
│  └── Indexes on userId, targetUserId for fast lookups     │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

---

## Data Flow Example: Adding a Friendship

```
1. User clicks "Link" button in FriendLinkPanel
   ↓
2. Frontend: linkFriend(userId, friendId)
   ↓
3. API: POST /api/users/{userId}/link { friendId }
   ↓
4. Backend: linkUsers controller
   - Validate both users exist (404 if not)
   - Check not already friends (409 if duplicate)
   - Add bidirectional references: userA.friends.push(userB_id)
   ↓
5. Backend: updatePopularity for both users
   - Fetch all friends' hobby docs
   - Calculate: score = friend_count + (shared_hobbies * 0.5)
   - Save updated score to DB
   ↓
6. Frontend receives 200 response
   ↓
7. Frontend: 
   - Refresh user list (new friend counts)
   - Refresh graph (nodes may change color/size based on score)
   - Reset recommendations for both users
   ↓
8. User sees graph update in real-time
```

---

## Performance Considerations

### Current Constraints (by design)
- **Target Load**: 1,000 users + 5,000 friendships
- **Graph Load Time**: <2.5 seconds (local machine)
- **Recommendation Compute**: <500ms per user

### Optimizations Implemented
1. **Popularity Score Caching**: Recomputed only on friendship/hobby changes (not on every recommendation fetch)
2. **Hobby Frequency Aggregation**: Single-pass loop instead of nested loops
3. **Early Return Prevention**: Recommendation loop processes all candidates before returning

### Future Optimizations (not implemented, low priority)
- Redis caching for recommendation results (5-min TTL)
- Batch graph updates (coalesce multiple user changes)
- Lazy-load graph for >500 nodes
- Debounce hobby updates (wait 300ms before API call)

---

## Testing Strategy

### Unit Tests (logic.test.js)
- ✅ Popularity score calculation (with/without shared hobbies)
- ✅ Friendship circular reference prevention
- ✅ User deletion validation
- ✅ Hobby array validation

### Manual Testing Areas
- Create/Edit/Delete users
- Link/Unlink friendships
- View recommendations + submit feedback
- Graph visualization updates

### Not Tested (Low Priority)
- ❌ Database connection resilience
- ❌ Concurrent request handling
- ❌ API rate limiting

---

## Deployment Notes

### Environment Variables Required
```
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/cybernaut
NODE_ENV=production
PORT=5000
```

### Docker Option (Future)
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY backend /app/backend
RUN cd /app/backend && npm install --production
CMD ["npm", "start"]
```

---

## Known Limitations & Future Work

### Limitations
1. **No Authentication**: Currently open API, ideal for trusted networks only
2. **Single Server**: No load balancing or clustering
3. **Static Recommendation Weights**: Hardcoded (mutual_friends*3, shared_hobbies*2)
4. **No Undo/Redo**: Graph changes are immediate and permanent

### Future Enhancements
1. JWT Authentication + Role-based access control
2. Redis caching for recommendation scores
3. Notification system (when someone accepts recommendation)
4. Machine learning ensemble (combine rule-based + semantic embeddings)
5. Analytics dashboard (trending hobbies, top connectors)

---

## Conclusion

This architecture prioritizes **simplicity**, **explainability**, and **rapid iteration**. As the user base grows, components can be independently upgraded (MongoDB → PostgreSQL, Context → Redux, Rules → ML) without rewriting core logic.
