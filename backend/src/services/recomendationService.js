import Feedback from "../models/Feedback.js";
import User from "../models/User.js"

// Calculate semantic similarity between two strings (0 to 1)
const calculateStringSimilarity = (str1, str2) => {
    const s1 = str1.toLowerCase().trim();
    const s2 = str2.toLowerCase().trim();

    if (s1 === s2) return 1.0;

    // Simple word overlap similarity
    const words1 = new Set(s1.split(/\s+/));
    const words2 = new Set(s2.split(/\s+/));

    let matches = 0;
    words1.forEach(word => {
        if (words2.has(word)) matches++;
    });

    const union = new Set([...words1, ...words2]).size;
    const similarity = union > 0 ? matches / union : 0;

    // Also check for substring matches
    if (s1.includes(s2) || s2.includes(s1)) {
        return Math.min(1.0, similarity + 0.3);
    }

    return similarity;
};

export const getFriendRecomendation = async (userId) => {
    const currentUser = await User.findById(userId)

    if (!currentUser) {
        throw new Error("User not found");
    }

    const allUsers = await User.find();

    // Get all rejected recommendations to hide them
    const rejectedFeedback = await Feedback.find({
        userId,
        accepted: false
    });
    const rejectedUserIds = rejectedFeedback.map(f => f.targetUserId.toString());

    const recomendations = [];

    for (const candidate of allUsers) {
        if (
            candidate._id.toString() === userId ||
            currentUser.friends.includes(candidate._id) ||
            rejectedUserIds.includes(candidate._id.toString())
        ) {
            continue
        }

        const sourceSignals = [];
        let score = 0;

        // 1. Mutual friends
        const mutualFriends = candidate.friends.filter(friendId =>
            currentUser.friends.some(myFriend =>
                myFriend.toString() === friendId.toString()
            )
        ).length;

        if (mutualFriends > 0) {
            score += mutualFriends * 3;
            sourceSignals.push(`${mutualFriends} mutual friends`);
        }

        // 2. Shared hobbies (exact matches only)
        const sharedHobbies = candidate.hobbies.filter(hobby =>
            currentUser.hobbies.includes(hobby)
        ).length;

        if (sharedHobbies > 0) {
            score += sharedHobbies * 2;
            sourceSignals.push(`${sharedHobbies} shared hobbies`);
        }

        // Only recommend if there's mutual connection or shared interests
        if (sourceSignals.length === 0) {
            continue;
        }

        recomendations.push({
            userId: candidate._id,
            username: candidate.username,
            score,
            reason: sourceSignals.join(", "),
            sourceSignals: sourceSignals,
        })
    }

    recomendations.sort(
        (a, b) => b.score - a.score
    )
    return recomendations.slice(0, 5)
}

export const getHobbyRecommendations = async (userId) => {

    const user = await User.findById(userId)
        .populate("friends");

    const hobbyFrequency = {};

    user.friends.forEach(friend => {
        friend.hobbies.forEach(hobby => {
            if (!user.hobbies.includes(hobby)) {
                hobbyFrequency[hobby] = (hobbyFrequency[hobby] || 0) + 1;
            }
        });
    });

    const recommendations = Object.entries(hobbyFrequency)
        .map(([hobby, frequency]) => {
            return {
                hobby,
                frequency,
                score: frequency,
                reason: `popular with ${frequency} friend${frequency !== 1 ? 's' : ''}`,
                sourceSignals: [`${frequency} friend${frequency !== 1 ? 's have' : ' has'} this hobby`],
            };
        })
        .sort((a, b) => b.score - a.score)
        .slice(0, 5);

    return recommendations;
};