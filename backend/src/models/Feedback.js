import mongoose from "mongoose";

const feedbackSchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },

        targetUserId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },

        accepted: {
            type: Boolean,
            required: true,
        },
    },
    {
        timestamps: true,
    }
);

export default mongoose.model(
    "Feedback",
    feedbackSchema
);
