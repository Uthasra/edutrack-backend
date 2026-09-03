import { Router } from "express";
import { status, studentSummary, generateEmail, insights } from "../controllers/ai.controller.js";
import { protect } from "../middleware/auth.middleware.js";

const router = Router();
router.use(protect);
router.get("/status", status);
router.post("/student-summary", studentSummary);
router.post("/generate-email", generateEmail);
router.post("/insights", insights);
export default router;
