import User from "../models/User.js";
import { calculatePopularity } from "../services/popularityService.js";

//GET ALL USERS
export const getUsers = async (req, res) => {
    try {
        const users = await User.find();

        // Calculate and update popularity scores for all users
        const usersWithPopularity = await Promise.all(
            users.map(async (user) => {
                const friendDocs = await User.find({
                    _id: { $in: user.friends }
                });

                user.popularityScore = calculatePopularity(user, friendDocs);
                return user;
            })
        );

        res.status(200).json(usersWithPopularity)
    } catch (error) {
        res.status(500).json({
            message: error.message,
        })
    }
}

//CREATE USER
export const createUser = async (req, res) => {
    try {
        const { username, age, hobbies } = req.body;
        if (!username || !age) {
            return res.status(400).json({ message: "Username and age are required" })
        }
        const user = await User.create({ username, age, hobbies })
        res.status(201).json(user)
    } catch (error) {
        res.status(500).json({
            message: error.message,
        })
    }
}

//UPDATE USER
export const updateUser = async (req, res) => {
    try {
        const { id } = req.params;

        const updatedUser = await User.findByIdAndUpdate(
            id,
            req.body,
            {
                new: true,
                runValidators: true,
            }
        );

        if (!updatedUser) {
            return res.status(404).json({
                message: "User not Found",
            })
        }

        // If hobbies were updated, recalculate popularity score
        if (req.body.hobbies) {
            const friendDocs = await User.find({
                _id: { $in: updatedUser.friends }
            })

            updatedUser.popularityScore = calculatePopularity(updatedUser, friendDocs)
            await updatedUser.save();
        }

        res.status(200).json(updatedUser)
    } catch (error) {
        return res.status(500).json({
            message: error.message
        })
    }
}

//DELETING USER
export const deleteUser = async (req, res) => {
    try {
        const { id } = req.params;

        const user = await User.findById(id);

        if (!user) {
            return res.status(409).json({
                message: "User not found",
            })
        }
        if (user.friends.length > 0) {
            return res.status(409).json({
                message: "User still has friendships. Unlink first"
            })
        }

        await User.findByIdAndDelete(id);

        res.status(200).json({
            message: "User deleted Successfully"
        })

    } catch (error) {
        res.status(500).json({
            message: error.message
        })
    }
}

//UPDATE POPULARITY
const updatePopularity = async (user) => {
    const friendDocs = await User.find({
        _id: { $in: user.friends }
    })

    user.popularityScore = calculatePopularity(user, friendDocs)

    await user.save();
}


//LINK USERS
export const linkUsers = async (req, res) => {
    try {
        const userAId = req.params.id;
        const { friendId } = req.body

        if (userAId === friendId) {
            return res.status(400).json({
                message: "User cannot be friend themselves"
            })
        }

        const userA = await User.findById(userAId);
        const userB = await User.findById(friendId);

        if (!userA || !userB) {
            return res.status(404).json({
                message: "User not found"
            })
        }

        const alreadyFriends = userA.friends.includes(friendId);

        if (alreadyFriends) {
            return res.status(409).json({
                message: "Friendship already exists"
            })
        }

        userA.friends.push(friendId);
        userB.friends.push(userAId);

        await userA.save();
        await userB.save()

        await updatePopularity(userA);
        await updatePopularity(userB);

        res.status(200).json({
            message: "Friendship created successfully",
        })

    } catch (error) {
        res.status(500).json({
            message: error.message
        })
    }
}

//UNLINK USER
export const unlinkUsers = async (req, res) => {
    try {
        const userAId = req.params.id;
        const { friendId } = req.body;

        const userA = await User.findById(userAId);
        const userB = await User.findById(friendId);

        if (!userA || !userB) {
            return res.status(404).json({
                message: "User not found"
            })
        }

        userA.friends = userA.friends.filter(
            id => id.toString() !== friendId
        );

        userB.friends = userB.friends.filter(
            id => id.toString() !== userAId
        );

        await userA.save()
        await userB.save()

        await updatePopularity(userA)
        await updatePopularity(userB)

        res.status(200).json({
            message: "Friendship  removed successfully",
        })

    } catch (error) {
        res.status(500).json({
            message: error.message,
        })
    }
}