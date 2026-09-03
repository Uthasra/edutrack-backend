import { asyncHandler } from "../utils/asyncHandler.js";
import { Lecturer } from "../models/Lecturer.model.js";

// GET /api/lecturers
export const listLecturers = asyncHandler(async (req, res) => {
  const lecturers = await Lecturer.find({ owner: req.user._id }).sort({ createdAt: -1 });
  res.json({ success: true, count: lecturers.length, lecturers });
});

// GET /api/lecturers/:id
export const getLecturer = asyncHandler(async (req, res) => {
  const lecturer = await Lecturer.findOne({ _id: req.params.id, owner: req.user._id });
  if (!lecturer) {
    res.status(404);
    throw new Error("Lecturer not found");
  }
  res.json({ success: true, lecturer });
});

// POST /api/lecturers
export const createLecturer = asyncHandler(async (req, res) => {
  const lecturer = await Lecturer.create({ ...req.body, owner: req.user._id });
  res.status(201).json({ success: true, lecturer });
});

// PUT /api/lecturers/:id
export const updateLecturer = asyncHandler(async (req, res) => {
  const lecturer = await Lecturer.findOneAndUpdate(
    { _id: req.params.id, owner: req.user._id },
    { $set: req.body },
    { new: true, runValidators: true }
  );
  if (!lecturer) {
    res.status(404);
    throw new Error("Lecturer not found");
  }
  res.json({ success: true, lecturer });
});

// DELETE /api/lecturers/:id
export const deleteLecturer = asyncHandler(async (req, res) => {
  const lecturer = await Lecturer.findOneAndDelete({ _id: req.params.id, owner: req.user._id });
  if (!lecturer) {
    res.status(404);
    throw new Error("Lecturer not found");
  }
  res.json({ success: true, message: "Lecturer deleted" });
});
