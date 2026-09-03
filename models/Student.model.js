import mongoose from "mongoose";

export const STUDENT_STAGES = ["Applied", "Enrolled", "Active", "Graduated", "Withdrawn"];
export const RISK_LEVELS = ["Low", "Medium", "High"];
export const ENTRY_TYPES = ["Direct (Z-score)", "Foundation", "Transfer", "Scholarship", "Mature", "Other"];

const studentSchema = new mongoose.Schema(
  {
    owner: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    name: { type: String, required: [true, "Student name is required"], trim: true },
    regNo: { type: String, trim: true, default: "" },
    gpa: { type: Number, min: 0, max: 4, default: 0 },
    email: { type: String, lowercase: true, trim: true, default: "" },
    phone: { type: String, default: "" },
    program: { type: String, default: "" }, // degree programme
    status: { type: String, enum: STUDENT_STAGES, default: "Applied" }, // lifecycle stage
    priority: { type: String, enum: RISK_LEVELS, default: "Medium" }, // academic risk
    source: { type: String, default: "Other" }, // entry route
    value: { type: Number, default: 0 }, // credits earned
    notes: { type: String, default: "" },
    tags: { type: [String], default: [] },
    order: { type: Number, default: 0 }, // position within an Admissions column
    aiSummary: { type: String, default: "" },
    aiRiskScore: { type: Number, default: null },
  },
  { timestamps: true }
);

export const Student = mongoose.model("Student", studentSchema);
