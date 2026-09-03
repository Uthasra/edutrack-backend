import { asyncHandler } from "../utils/asyncHandler.js";
import { Student, STUDENT_STAGES } from "../models/Student.model.js";
import { Lecturer } from "../models/Lecturer.model.js";
import { Assignment } from "../models/Assignment.model.js";

const MONTHS = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];

// GET /api/analytics/overview
export const overview = asyncHandler(async (req, res) => {
  const ownerId = req.user._id;
  const [students, lecturerCount, openAssignments] = await Promise.all([
    Student.find({ owner: ownerId }),
    Lecturer.countDocuments({ owner: ownerId }),
    Assignment.countDocuments({ owner: ownerId, status: { $ne: "Completed" } }),
  ]);

  const byStage = Object.fromEntries(STUDENT_STAGES.map((s) => [s, { count: 0, value: 0 }]));
  let totalCredits = 0, gpaSum = 0, gpaCount = 0;
  for (const s of students) {
    const b = byStage[s.status] || (byStage[s.status] = { count: 0, value: 0 });
    b.count += 1;
    b.value += s.value || 0;
    totalCredits += s.value || 0;
    if (s.gpa > 0) { gpaSum += s.gpa; gpaCount += 1; }
  }
  const graduated = byStage.Graduated.count;
  const withdrawn = byStage.Withdrawn.count;
  const finished = graduated + withdrawn;
  const completionRate = finished ? Math.round((graduated / finished) * 100) : 0;
  const avgGpa = gpaCount ? Math.round((gpaSum / gpaCount) * 100) / 100 : 0;

  // 6-month intake trend
  const now = new Date();
  const months = [];
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    months.push({ key: `${d.getFullYear()}-${d.getMonth()}`, label: MONTHS[d.getMonth()] });
  }
  const idx = Object.fromEntries(months.map((m, i) => [m.key, i]));
  const trend = months.map((m) => ({ month: m.label, students: 0, credits: 0 }));
  for (const s of students) {
    const d = new Date(s.createdAt);
    const key = `${d.getFullYear()}-${d.getMonth()}`;
    if (idx[key] !== undefined) {
      trend[idx[key]].students += 1;
      trend[idx[key]].credits += s.value || 0;
    }
  }

  const recentStudents = [...students]
    .sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt))
    .slice(0, 6)
    .map((s) => ({
      id: s._id, name: s.name, program: s.program,
      status: s.status, value: s.value, updatedAt: s.updatedAt,
    }));

  res.json({
    success: true,
    stats: {
      totalCredits,
      avgGpa,
      totalStudents: students.length,
      totalLecturers: lecturerCount,
      openAssignments,
      completionRate,
      graduated,
    },
    board: STUDENT_STAGES.map((s) => ({ stage: s, count: byStage[s].count, value: byStage[s].value })),
    trend,
    recentStudents,
  });
});
