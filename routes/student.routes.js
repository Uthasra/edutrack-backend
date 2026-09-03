import { Router } from "express";
import {
  listStudents, getStudent, createStudent,
  updateStudent, deleteStudent, reorderStudents,
} from "../controllers/student.controller.js";
import { protect } from "../middleware/auth.middleware.js";

const router = Router();
router.use(protect);
router.patch("/reorder", reorderStudents); // before "/:id"
router.route("/").get(listStudents).post(createStudent);
router.route("/:id").get(getStudent).put(updateStudent).delete(deleteStudent);
export default router;
