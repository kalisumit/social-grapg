# Debug Notes

This file records real bugs encountered during implementation, their root causes, and the fixes applied.

## Bug 1: Friendship creation returned a server error

Location: `backend/src/controllers/userController.js`

### Symptom

Creating a friendship through `POST /api/users/:id/link` updated the database but the frontend still showed a failure.

### Root Cause

The controller attempted to send the response with `res.statue(200)` instead of `res.status(200)`. Because `statue` is not an Express response method, the request threw after the friendship update logic ran.

### Fix Details

Changed the typo to the correct Express method:

```js
res.status(200).json({
  message: "Friendship created successfully",
});
```

### Verification

- `POST /api/users/:id/link` now returns `200`.
- The frontend receives a success response.
- The graph refresh shows the new edge.

## Bug 2: User deletion checked the wrong friendship property

Location: `backend/src/controllers/userController.js`

### Symptom

Deleting a user with active friendships did not reliably return the intended conflict response.

### Root Cause

The delete controller checked `user.friend.length`, but the Mongoose schema defines the field as `friends`. This property mismatch caused validation to fail and risked deleting users that were still referenced by others.

### Fix Details

Updated the check to use the actual schema property:

```js
if (user.friends.length > 0) {
  return res.status(409).json({
    message: "User still has friendships. Unlink first",
  });
}
```

### Verification

- Users with one or more friends now receive `409`.
- Users with no friendships can be deleted.
- Existing friendship references are protected from orphaning.

## Additional Bugs Fixed

### Missing `await` in database lookups

Some controller paths used `User.findById(...)` without `await`, which meant the code was operating on Promise objects instead of resolved users. Adding `await` allowed null checks and friendship array updates to work correctly.

### Incorrect array method

The popularity service used `.include()` instead of `.includes()`. Updating to `.includes()` restored shared-hobby counting.

### Recommendation score used before declaration

The recommendation service applied feedback adjustments before initializing `score`. Moving `let score = 0` before the feedback logic fixed the `ReferenceError`.

### Early return in recommendation loop

The recommendation loop returned before evaluating all candidates. Moving sort/slice logic after the loop allowed the service to return the top five candidates.

## Regression Checks

Backend logic tests cover:

- Popularity calculation
- Duplicate friendship prevention
- Circular/self friendship prevention
- Delete validation for users with active friendships
- Hobby validation

Run with:

```bash
cd backend
npm test
```
