import { asyncHandler } from "../utils/asyncHandler.js";
import { Student } from "../models/Student.model.js";

// GET /api/students
export const listStudents = asyncHandler(async (req, res) => {
  const students = await Student.find({ owner: req.user._id }).sort({ updatedAt: -1 });
  res.json({ success: true, count: students.length, students });
});

// GET /api/students/:id
export const getStudent = asyncHandler(async (req, res) => {
  const student = await Student.findOne({ _id: req.params.id, owner: req.user._id });
  if (!student) {
    res.status(404);
    throw new Error("Student not found");
  }
  res.json({ success: true, student });
});

// POST /api/students
export const createStudent = asyncHandler(async (req, res) => {
  const student = await Student.create({ ...req.body, owner: req.user._id });
  res.status(201).json({ success: true, student });
});

// PUT /api/students/:id
export const updateStudent = asyncHandler(async (req, res) => {
  const student = await Student.findOneAndUpdate(
    { _id: req.params.id, owner: req.user._id },
    { $set: req.body },
    { new: true, runValidators: true }
  );
  if (!student) {
    res.status(404);
    throw new Error("Student not found");
  }
  res.json({ success: true, student });
});

// DELETE /api/students/:id
export const deleteStudent = asyncHandler(async (req, res) => {
  const student = await Student.findOneAndDelete({ _id: req.params.id, owner: req.user._id });
  if (!student) {
    res.status(404);
    throw new Error("Student not found");
  }
  res.json({ success: true, message: "Student deleted" });
});

// PATCH /api/students/reorder  { updates: [{ id, status, order }] }
export const reorderStudents = asyncHandler(async (req, res) => {
  const updates = Array.isArray(req.body.updates) ? req.body.updates : [];
  await Promise.all(
    updates.map((u) =>
      Student.updateOne(
        { _id: u.id, owner: req.user._id },
        { $set: { status: u.status, order: u.order } }
      )
    )
  );
  res.json({ success: true, message: "Admissions board updated" });
});
