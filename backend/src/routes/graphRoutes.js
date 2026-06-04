import express from "express"
import { getGraphData } from "../controllers/graphController.js";

const router = express.Router();

router.get("/", getGraphData);

export default router;