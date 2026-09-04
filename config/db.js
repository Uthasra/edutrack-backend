import mongoose from "mongoose";

let cached = global._mongoose;
if (!cached) {
  cached = global._mongoose = { conn: null, promise: null };
}

export const connectDB = async () => {
  if (cached.conn) return cached.conn;

  if (!cached.promise) {
    cached.promise = mongoose
      .connect(process.env.MONGO_URI, { bufferCommands: false })
      .then((m) => {
        console.log(`MongoDB connected: ${m.connection.host}/${m.connection.name}`);
        return m;
      });
  }

  cached.conn = await cached.promise;
  return cached.conn;
};

export default connectDB;