import { Router } from "express";
import { listNotes, createNote, updateNote, deleteNote } from "../controllers/note.controller.js";
import { protect } from "../middleware/auth.middleware.js";

const router = Router();
router.use(protect);
router.route("/").get(listNotes).post(createNote);
router.route("/:id").put(updateNote).delete(deleteNote);
export default router;
