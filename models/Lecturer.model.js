import mongoose from "mongoose";

const lecturerSchema = new mongoose.Schema(
  {
    owner: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    name: { type: String, required: [true, "Lecturer name is required"], trim: true },
    title: { type: String, default: "" }, // designation, e.g. Senior Lecturer
    program: { type: String, default: "" }, // department
    email: { type: String, lowercase: true, trim: true, default: "" },
    phone: { type: String, default: "" },
    tags: { type: [String], default: [] },
    favorite: { type: Boolean, default: false },
    notes: { type: String, default: "" },
  },
  { timestamps: true }
);

export const Lecturer = mongoose.model("Lecturer", lecturerSchema);
