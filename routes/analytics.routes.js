import { Router } from "express";
import { overview } from "../controllers/analytics.controller.js";
import { protect } from "../middleware/auth.middleware.js";

const router = Router();
router.use(protect);
router.get("/overview", overview);
export default router;
