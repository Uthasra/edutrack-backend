import mongoose from "mongoose";

export const ASSIGNMENT_STATUSES = ["Pending", "In Progress", "Completed"];
export const ASSIGNMENT_PRIORITIES = ["Low", "Medium", "High"];

const assignmentSchema = new mongoose.Schema(
  {
    owner: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    title: { type: String, required: [true, "Title is required"], trim: true },
    description: { type: String, default: "" },
    dueDate: { type: Date, default: null },
    status: { type: String, enum: ASSIGNMENT_STATUSES, default: "Pending" },
    priority: { type: String, enum: ASSIGNMENT_PRIORITIES, default: "Medium" },
    relatedStudent: { type: mongoose.Schema.Types.ObjectId, ref: "Student", default: null },
    relatedLecturer: { type: mongoose.Schema.Types.ObjectId, ref: "Lecturer", default: null },
    completedAt: { type: Date, default: null },
  },
  { timestamps: true }
);

export const Assignment = mongoose.model("Assignment", assignmentSchema);
