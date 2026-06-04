import express from "express";
import { submitFeedback } from "../controllers/feedbackController.js";
import { validateFeedback } from "../middleware/validation.js";

const router = express.Router();

router.post(
    "/:id/recommendations/feedback",
    validateFeedback,
    submitFeedback
);

export default router;