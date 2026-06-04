import express from "express"
import { getRecommendations } from "../controllers/recommendationController.js";

const router = express.Router();

router.get("/:id/recommendations", getRecommendations);

export default router