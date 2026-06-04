import mongoose from "mongoose"
import dotenv from "dotenv"

import app from "./app.js"

dotenv.config();

// Database Connection
mongoose.connect(process.env.MONGO_URI)
    .then(() => {
        console.log("MongoDB connected successfully");
    })
    .catch((err) => {
        console.error("MongoDB connection error:", err.message);
    });

// Port Connection
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});


