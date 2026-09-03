import { asyncHandler } from "../utils/asyncHandler.js";
import { Note } from "../models/Note.model.js";

/* Shape a note the way the frontend expects: student/lecturer as lite objects. */
const shape = (n) => ({
  _id: n._id,
  content: n.content,
  pinned: n.pinned,
  createdAt: n.createdAt,
  student: n.student ? { _id: n.student._id, name: n.student.name, program: n.student.program } : null,
  lecturer: n.lecturer ? { _id: n.lecturer._id, name: n.lecturer.name, program: n.lecturer.program } : null,
});

const populated = (q) =>
  q.populate("student", "name program").populate("lecturer", "name program");

// GET /api/notes
export const listNotes = asyncHandler(async (req, res) => {
  const notes = await populated(Note.find({ owner: req.user._id })).sort({ pinned: -1, createdAt: -1 });
  res.json({ success: true, count: notes.length, notes: notes.map(shape) });
});

// POST /api/notes
export const createNote = asyncHandler(async (req, res) => {
  const { content, student, lecturer, pinned } = req.body;
  let note = await Note.create({
    owner: req.user._id,
    content,
    student: student || null,
    lecturer: lecturer || null,
    pinned: Boolean(pinned),
  });
  note = await populated(Note.findById(note._id));
  res.status(201).json({ success: true, note: shape(note) });
});

// PUT /api/notes/:id
export const updateNote = asyncHandler(async (req, res) => {
  const patch = {};
  ["content", "pinned"].forEach((k) => { if (k in req.body) patch[k] = req.body[k]; });
  if ("student" in req.body) patch.student = req.body.student || null;
  if ("lecturer" in req.body) patch.lecturer = req.body.lecturer || null;

  let note = await Note.findOneAndUpdate(
    { _id: req.params.id, owner: req.user._id },
    { $set: patch },
    { new: true }
  );
  if (!note) {
    res.status(404);
    throw new Error("Note not found");
  }
  note = await populated(Note.findById(note._id));
  res.json({ success: true, note: shape(note) });
});

// DELETE /api/notes/:id
export const deleteNote = asyncHandler(async (req, res) => {
  const note = await Note.findOneAndDelete({ _id: req.params.id, owner: req.user._id });
  if (!note) {
    res.status(404);
    throw new Error("Note not found");
  }
  res.json({ success: true, message: "Note deleted" });
});
