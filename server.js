import "dotenv/config";
import express from "express";
import cors from "cors";
import morgan from "morgan";

import { connectDB } from "./config/db.js";
import { notFound, errorHandler } from "./middleware/error.middleware.js";

import authRoutes from "./routes/auth.routes.js";
import studentRoutes from "./routes/student.routes.js";
import lecturerRoutes from "./routes/lecturer.routes.js";
import noteRoutes from "./routes/note.routes.js";
import assignmentRoutes from "./routes/assignment.routes.js";
import aiRoutes from "./routes/ai.routes.js";
import analyticsRoutes from "./routes/analytics.routes.js";

const app = express();

/*--------------------- Middleware ---------------------*/
app.use(cors({
  origin: [process.env.CLIENT_URL, 'http://localhost:5173'],
  credentials: true
}));
app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: true }));
if (process.env.NODE_ENV !== "production") app.use(morgan("dev"));

/*--------------------- Routes ---------------------*/
app.get("/api/health", (req, res) =>
  res.json({ success: true, status: "ok", service: "EduTrack SMS API" })
);

app.use("/api/auth", authRoutes);
app.use("/api/students", studentRoutes);
app.use("/api/lecturers", lecturerRoutes);
app.use("/api/notes", noteRoutes);
app.use("/api/assignments", assignmentRoutes);
app.use("/api/ai", aiRoutes);
app.use("/api/analytics", analyticsRoutes);

/*--------------------- Error handling (last) ---------------------*/
app.use(notFound);
app.use(errorHandler);

/*--------------------- Boot ---------------------*/
const PORT = process.env.PORT || 8000;
app.listen(PORT, '0.0.0.0', () => console.log(`API running on ${PORT}`));

const start = async () => {
  try {
    await connectDB();
    app.listen(PORT, () =>
      console.log(`EduTrack SMS API running on http://localhost:${PORT}`)
    );
  } catch (err) {
    console.error("Failed to start server:", err.message);
    process.exit(1);
  }
};

start();

export default app;
