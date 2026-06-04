export const validateUser = (req, res, next) => {
    const { username, age, hobbies } = req.body;

    // Validate username
    if (username !== undefined && (!username || typeof username !== 'string' || username.trim().length === 0)) {
        return res.status(400).json({
            message: "Username is required and must be a non-empty string"
        });
    }

    // Validate age
    if (age !== undefined && (typeof age !== 'number' || age < 1 || age > 150)) {
        return res.status(400).json({
            message: "Age must be a number between 1 and 150"
        });
    }

    // Validate hobbies
    if (hobbies !== undefined) {
        if (!Array.isArray(hobbies)) {
            return res.status(400).json({
                message: "Hobbies must be an array"
            });
        }

        if (hobbies.length === 0) {
            return res.status(400).json({
                message: "At least one hobby is required"
            });
        }

        if (hobbies.some(hobby => !hobby || typeof hobby !== 'string' || hobby.trim().length === 0)) {
            return res.status(400).json({
                message: "Each hobby must be a non-empty string"
            });
        }
    }

    next();
};

export const validateFriendshipRequest = (req, res, next) => {
    const { friendId } = req.body;

    if (!friendId || typeof friendId !== 'string') {
        return res.status(400).json({
            message: "friendId is required and must be a valid user ID"
        });
    }

    next();
};

export const validateFeedback = (req, res, next) => {
    const { targetUserId, accepted } = req.body;

    if (!targetUserId || typeof targetUserId !== 'string') {
        return res.status(400).json({
            message: "targetUserId is required and must be a valid user ID"
        });
    }

    if (typeof accepted !== 'boolean') {
        return res.status(400).json({
            message: "accepted must be a boolean value"
        });
    }

    next();
};
