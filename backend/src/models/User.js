import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
    {
        username:{type:String, required:true},
        age:{type:Number, required:true},
        hobbies:{type:[String], required:true},
        friends: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: "User",
            },
        ],
        createdAt: Date,
        popularityScore:{type:Number, default:0}
    },
    {
    timestamps:true,
    }
);
export default mongoose.model("User", userSchema);