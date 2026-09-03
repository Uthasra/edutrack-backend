/* Login diagnostic — run:  node diagnose.js  (from the backend root)
   Checks env → MongoDB → users → demo account, and prints the exact fix. */
import "dotenv/config";
import mongoose from "mongoose";
import { User } from "./models/User.model.js";

const ok = (m) => console.log("  [OK]  " + m);
const bad = (m) => console.log("  [X]   " + m);
const info = (m) => console.log("  [i]   " + m);

const DEMO_EMAIL = "registrar@ruh.ac.lk";
const DEMO_PASS = "Test@1234";

const run = async () => {
  console.log("\n=== EduTrack login diagnostic ===\n");

  // 1) Environment
  if (!process.env.JWT_SECRET) {
    bad("JWT_SECRET is MISSING. This alone makes login return 500.");
    bad("    Fix: create a file named .env in this folder with JWT_SECRET=<something long>.");
  } else {
    ok("JWT_SECRET is set.");
  }
  const uri = process.env.MONGO_URI || "mongodb://localhost:27017/edutrack";
  info(`Using MONGO_URI = ${uri}`);

  // 2) MongoDB connection
  try {
    mongoose.set("strictQuery", true);
    await mongoose.connect(uri, { serverSelectionTimeoutMS: 4000 });
    ok(`MongoDB connected (${mongoose.connection.host}/${mongoose.connection.name}).`);
  } catch (e) {
    bad("Cannot connect to MongoDB: " + e.message);
    bad("    Fix: start MongoDB (run `mongod`) or correct MONGO_URI, then re-run.");
    process.exit(1);
  }

  // 3) Users present?
  const count = await User.countDocuments();
  info(`Users in database: ${count}`);
  if (count === 0) bad("No users yet. Fix: run `npm run seed` (or register on the site).");

  // 4) Demo account + password
  const demo = await User.findOne({ email: DEMO_EMAIL }).select("+password");
  if (!demo) {
    bad(`Demo account ${DEMO_EMAIL} not found. Fix: run \`npm run seed\`.`);
  } else {
    ok(`Demo account ${DEMO_EMAIL} exists.`);
    const match = await demo.matchPassword(DEMO_PASS);
    if (match) ok(`Password "${DEMO_PASS}" matches -> login SHOULD work now.`);
    else bad(`Password "${DEMO_PASS}" does NOT match. Fix: re-run \`npm run seed\`.`);
  }

  await mongoose.connection.close();
  console.log("\n=== done ===\n");
  process.exit(0);
};

run().catch(async (e) => {
  bad("Unexpected error: " + e.message);
  try { await mongoose.connection.close(); } catch {}
  process.exit(1);
});
