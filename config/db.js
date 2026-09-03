import mongoose from "mongoose";

/* Connect to MongoDB. Throws on failure so server.js can exit cleanly. */
export const connectDB = async () => {
  const uri = process.env.MONGO_URI || "mongodb://localhost:27017/edutrack";
  mongoose.set("strictQuery", true);
  const conn = await mongoose.connect(uri);
  console.log(`MongoDB connected: ${conn.connection.host}/${conn.connection.name}`);
  return conn;
};
