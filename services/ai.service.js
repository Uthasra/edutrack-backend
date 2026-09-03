/* ─────────────────────────────────────────────────────────────────────────
   AI service — wraps Google Gemini (@google/genai).

   If GEMINI_API_KEY is missing OR the API call fails, every function returns
   a sensible deterministic fallback, so the endpoints always work (mirrors
   the frontend's mock responses). Set GEMINI_API_KEY in .env to go live.
   ───────────────────────────────────────────────────────────────────────── */
import { GoogleGenAI } from "@google/genai";

const KEY = process.env.GEMINI_API_KEY;
const MODEL = process.env.GEMINI_MODEL || "gemini-2.5-flash";
const ai = KEY ? new GoogleGenAI({ apiKey: KEY }) : null;

export const aiConfigured = () => Boolean(KEY);
export const aiModelName = () => (KEY ? MODEL : `${MODEL} (mock)`);

/* Ask Gemini for JSON and parse it; strips ```json fences defensively. */
async function askJSON(prompt) {
  if (!ai) throw new Error("AI not configured");
  const res = await ai.models.generateContent({ model: MODEL, contents: prompt });
  const text = (res?.text || "").replace(/```json|```/g, "").trim();
  return JSON.parse(text);
}

/* ── Per-student summary ─────────────────────────────────────────────── */
export async function studentSummary(student = {}) {
  const fallback = {
    success: true,
    summary:
      `${student.name || "This student"} is in the "${student.status || "Applied"}" stage ` +
      `of ${student.program || "their programme"} with ${student.value ?? 0} credits and a ` +
      `GPA of ${student.gpa ?? 0}. Progress looks ${
        (student.gpa ?? 0) >= 3 ? "healthy" : "as though it needs attention"
      }.`,
    riskScore:
      student.priority === "High" ? 78 : student.priority === "Medium" ? 45 : 22,
    suggestedPriority: student.priority || "Medium",
    nextBestAction:
      (student.gpa ?? 0) >= 3
        ? "Confirm the student is on pace to meet credit requirements this semester."
        : "Schedule an academic advising session and review attendance.",
  };
  if (!ai) return fallback;
  try {
    const prompt =
      `You are a university academic advisor. Given this student JSON, respond with ONLY a JSON ` +
      `object {summary, riskScore (0-100 int), suggestedPriority ("Low"|"Medium"|"High"), nextBestAction}. ` +
      `Student: ${JSON.stringify(student)}`;
    return { success: true, ...(await askJSON(prompt)) };
  } catch {
    return fallback;
  }
}

/* ── Email draft for a student ───────────────────────────────────────── */
export async function generateEmail(student = {}, purpose = "Follow-up", tone = "Friendly & professional") {
  const fallback = {
    success: true,
    subject: `${purpose} — your academic progress`,
    body:
      `Dear ${student.name || "student"},\n\n` +
      `I hope you're doing well. I'm writing regarding your progress in ` +
      `${student.program || "your programme"}. ` +
      `Please let me know if you'd like to arrange a short advising session.\n\n` +
      `Best regards,\nOffice of the Registrar\nUniversity of Ruhuna`,
  };
  if (!ai) return fallback;
  try {
    const prompt =
      `Write a short university email (${tone}) for the purpose "${purpose}" to a student. ` +
      `Respond with ONLY JSON {subject, body}. Student: ${JSON.stringify(student)}`;
    return { success: true, ...(await askJSON(prompt)) };
  } catch {
    return fallback;
  }
}

/* ── Cohort insights ─────────────────────────────────────────────────── */
export async function cohortInsights(stats = {}) {
  const fallback = {
    success: true,
    headline: "The cohort is healthy overall, but a few students need early intervention.",
    insights: [
      `Tracking ${stats.totalStudents ?? 0} students with an average GPA of ${stats.avgGpa ?? 0}.`,
      `Graduation rate is currently ${stats.completionRate ?? 0}%.`,
      "Attendance is the leading predictor of at-risk students.",
    ],
    recommendations: [
      "Flag students below a 2.5 GPA for advising this week.",
      "Introduce an early attendance warning at the 75% threshold.",
      "Pair at-risk students with peer mentors from the Dean's list.",
    ],
    healthScore: Math.min(100, 40 + Math.round((stats.avgGpa ?? 0) * 15)),
  };
  if (!ai) return fallback;
  try {
    const prompt =
      `You are a university dean's analytics assistant. Given these cohort stats, respond with ONLY ` +
      `JSON {headline, insights:[3 strings], recommendations:[3 strings], healthScore (0-100 int)}. ` +
      `Stats: ${JSON.stringify(stats)}`;
    return { success: true, ...(await askJSON(prompt)) };
  } catch {
    return fallback;
  }
}
