import { asyncHandler } from "../utils/asyncHandler.js";
import { Assignment } from "../models/Assignment.model.js";

const shape = (a) => ({
  _id: a._id,
  title: a.title,
  description: a.description,
  dueDate: a.dueDate,
  status: a.status,
  priority: a.priority,
  completedAt: a.completedAt,
  createdAt: a.createdAt,
  relatedStudent: a.relatedStudent
    ? { _id: a.relatedStudent._id, name: a.relatedStudent.name, program: a.relatedStudent.program }
    : null,
  relatedLecturer: a.relatedLecturer
    ? { _id: a.relatedLecturer._id, name: a.relatedLecturer.name, program: a.relatedLecturer.program }
    : null,
});

const populated = (q) =>
  q.populate("relatedStudent", "name program").populate("relatedLecturer", "name program");

// GET /api/assignments
export const listAssignments = asyncHandler(async (req, res) => {
  const assignments = await populated(Assignment.find({ owner: req.user._id })).sort({ createdAt: -1 });
  res.json({ success: true, count: assignments.length, assignments: assignments.map(shape) });
});

// POST /api/assignments
export const createAssignment = asyncHandler(async (req, res) => {
  const body = { ...req.body, owner: req.user._id };
  body.relatedStudent = req.body.relatedStudent || null;
  body.completedAt = req.body.status === "Completed" ? new Date() : null;
  let a = await Assignment.create(body);
  a = await populated(Assignment.findById(a._id));
  res.status(201).json({ success: true, assignment: shape(a) });
});

// PUT /api/assignments/:id
export const updateAssignment = asyncHandler(async (req, res) => {
  const patch = { ...req.body };
  if ("relatedStudent" in patch) patch.relatedStudent = patch.relatedStudent || null;
  if (patch.status === "Completed") patch.completedAt = new Date();
  if (patch.status && patch.status !== "Completed") patch.completedAt = null;

  let a = await Assignment.findOneAndUpdate(
    { _id: req.params.id, owner: req.user._id },
    { $set: patch },
    { new: true, runValidators: true }
  );
  if (!a) {
    res.status(404);
    throw new Error("Assignment not found");
  }
  a = await populated(Assignment.findById(a._id));
  res.json({ success: true, assignment: shape(a) });
});

// DELETE /api/assignments/:id
export const deleteAssignment = asyncHandler(async (req, res) => {
  const a = await Assignment.findOneAndDelete({ _id: req.params.id, owner: req.user._id });
  if (!a) {
    res.status(404);
    throw new Error("Assignment not found");
  }
  res.json({ success: true, message: "Assignment deleted" });
});
