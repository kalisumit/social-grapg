import express from "express"
import cors from "cors"
import userRouter from "./routes/userRoutes.js"
import graphRoutes from "./routes/graphRoutes.js"
import recommendationRoutes from "./routes/recommendationRoutes.js"
import feedbackRoutes from "./routes/feedbackRoutes.js"

const app = express();

app.use(cors())
app.use(express.json())

app.use("/api/users", userRouter)
app.use("/api/users", recommendationRoutes)

app.use("/api/graph", graphRoutes);

app.use("/api/users", feedbackRoutes)

export default app;
