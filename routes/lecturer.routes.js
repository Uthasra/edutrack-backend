import { Router } from "express";
import {
  listLecturers, getLecturer, createLecturer,
  updateLecturer, deleteLecturer,
} from "../controllers/lecturer.controller.js";
import { protect } from "../middleware/auth.middleware.js";

const router = Router();
router.use(protect);
router.route("/").get(listLecturers).post(createLecturer);
router.route("/:id").get(getLecturer).put(updateLecturer).delete(deleteLecturer);
export default router;
