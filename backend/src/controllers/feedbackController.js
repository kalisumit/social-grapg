import Feedback from "../models/Feedback.js";
import User from "../models/User.js";
import { calculatePopularity } from "../services/popularityService.js";

const updatePopularity = async (user) => {
    const friendDocs = await User.find({
        _id: { $in: user.friends }
    })

    user.popularityScore = calculatePopularity(user, friendDocs)

    await user.save();
}

export const submitFeedback =
    async (req, res) => {
        try {

            const userId = req.params.id;

            const {
                targetUserId,
                accepted,
            } = req.body;

            const existing =
                await Feedback.findOne({
                    userId,
                    targetUserId,
                });

            // If accepted and not already friends, link them
            if (accepted) {
                const userA = await User.findById(userId);
                const userB = await User.findById(targetUserId);

                if (!userA || !userB) {
                    return res.status(404).json({
                        message: "User not found"
                    });
                }

                // Only link if not already friends
                if (!userA.friends.includes(targetUserId)) {
                    userA.friends.push(targetUserId);
                    userB.friends.push(userId);

                    await userA.save();
                    await userB.save();

                    await updatePopularity(userA);
                    await updatePopularity(userB);
                }
            }

            if (existing) {

                existing.accepted =
                    accepted;

                await existing.save();

                return res.status(200).json({
                    message:
                        "Feedback updated",
                });
            }

            await Feedback.create({
                userId,
                targetUserId,
                accepted,
            });

            res.status(201).json({
                message:
                    "Feedback saved",
            });

        } catch (error) {

            res.status(500).json({
                message:
                    error.message,
            });
        }
    };