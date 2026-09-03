import { asyncHandler } from "../utils/asyncHandler.js";
import { Student } from "../models/Student.model.js";
import { Assignment } from "../models/Assignment.model.js";
import { Lecturer } from "../models/Lecturer.model.js";
import * as aiSvc from "../services/ai.service.js";

// GET /api/ai/status
export const status = asyncHandler(async (req, res) => {
  res.json({ success: true, configured: aiSvc.aiConfigured(), model: aiSvc.aiModelName() });
});

// POST /api/ai/student-summary  { studentId }
export const studentSummary = asyncHandler(async (req, res) => {
  const student = await Student.findOne({ _id: req.body.studentId, owner: req.user._id });
  if (!student) {
    res.status(404);
    throw new Error("Student not found");
  }
  const result = await aiSvc.studentSummary(student.toObject());
  // persist the latest AI read on the student record
  student.aiSummary = result.summary || "";
  student.aiRiskScore = result.riskScore ?? null;
  await student.save();
  res.json(result);
});

// POST /api/ai/generate-email  { studentId, purpose, tone }
export const generateEmail = asyncHandler(async (req, res) => {
  const student = await Student.findOne({ _id: req.body.studentId, owner: req.user._id });
  if (!student) {
    res.status(404);
    throw new Error("Student not found");
  }
  res.json(await aiSvc.generateEmail(student.toObject(), req.body.purpose, req.body.tone));
});

// POST /api/ai/insights   (cohort-level)
export const insights = asyncHandler(async (req, res) => {
  const ownerId = req.user._id;
  const [students, lecturers, openAssignments] = await Promise.all([
    Student.find({ owner: ownerId }),
    Lecturer.countDocuments({ owner: ownerId }),
    Assignment.countDocuments({ owner: ownerId, status: { $ne: "Completed" } }),
  ]);
  const gpas = students.filter((s) => s.gpa > 0).map((s) => s.gpa);
  const avgGpa = gpas.length ? Math.round((gpas.reduce((a, b) => a + b, 0) / gpas.length) * 100) / 100 : 0;
  const graduated = students.filter((s) => s.status === "Graduated").length;
  const withdrawn = students.filter((s) => s.status === "Withdrawn").length;
  const completionRate = graduated + withdrawn ? Math.round((graduated / (graduated + withdrawn)) * 100) : 0;

  res.json(
    await aiSvc.cohortInsights({
      totalStudents: students.length,
      totalLecturers: lecturers,
      openAssignments,
      avgGpa,
      completionRate,
    })
  );
});
