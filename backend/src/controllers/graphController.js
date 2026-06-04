import User from "../models/User.js";
import { calculatePopularity } from "../services/popularityService.js";

export const getGraphData = async (req, res) => {
    try {
        const users = await User.find();

        if (!users || users.length === 0) {
            return res.status(200).json({ nodes: [], edges: [] });
        }

        // Calculate popularity scores for all users
        const usersWithPopularity = await Promise.all(
            users.map(async (user) => {
                const friendDocs = await User.find({
                    _id: { $in: user.friends }
                });
                user.popularityScore = calculatePopularity(user, friendDocs);
                return user;
            })
        );

        const nodes = usersWithPopularity.map((user, index) => {
            if (!user._id || !user.username) {
                console.warn("Invalid user object:", user);
                return null;
            }
            const nodeTypes =
                user.popularityScore > 5
                    ? "highScore"
                    : "lowScore";
            return {
                id: user._id.toString(),
                type: nodeTypes,
                data: {
                    username: user.username,
                    age: user.age,
                    popularityScore: user.popularityScore || 0,
                },
                position: {
                    x: (index % 5) * 250,
                    y: Math.floor(index / 5) * 150,
                },
            };
        }).filter(node => node !== null);

        const edges = [];
        const processed = new Set();

        usersWithPopularity.forEach((user) => {
            if (!user._id || !user.friends) return;

            (user.friends || []).forEach((friendId) => {
                if (!friendId) return;

                const key = [user._id.toString(), friendId.toString()]
                    .sort()
                    .join("-");

                if (!processed.has(key)) {
                    processed.add(key);

                    edges.push({
                        id: key,
                        source: user._id.toString(),
                        target: friendId.toString(),
                    });
                }
            });
        });

        return res.status(200).json({ nodes, edges });
    } catch (error) {
        console.error("Graph data error:", error);
        return res.status(500).json({
            message: error.message,
        });
    }
};

