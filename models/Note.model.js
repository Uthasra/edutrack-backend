import mongoose from "mongoose";

const noteSchema = new mongoose.Schema(
  {
    owner: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    content: { type: String, required: [true, "Note content is required"], trim: true },
    student: { type: mongoose.Schema.Types.ObjectId, ref: "Student", default: null },
    lecturer: { type: mongoose.Schema.Types.ObjectId, ref: "Lecturer", default: null },
    pinned: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export const Note = mongoose.model("Note", noteSchema);
