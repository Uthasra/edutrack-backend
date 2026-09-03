import { Router } from "express";
import {
  listAssignments, createAssignment, updateAssignment, deleteAssignment,
} from "../controllers/assignment.controller.js";
import { protect } from "../middleware/auth.middleware.js";

const router = Router();
router.use(protect);
router.route("/").get(listAssignments).post(createAssignment);
router.route("/:id").put(updateAssignment).delete(deleteAssignment);
export default router;
