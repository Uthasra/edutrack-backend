/* Seed the database with a demo registrar + students, lecturers, notes and
   assignments that mirror the EduTrack frontend mock data.
   Run:  npm run seed   (requires MONGO_URI in .env)                       */
import "dotenv/config";
import mongoose from "mongoose";
import { connectDB } from "./config/db.js";
import { User } from "./models/User.model.js";
import { Student } from "./models/Student.model.js";
import { Lecturer } from "./models/Lecturer.model.js";
import { Note } from "./models/Note.model.js";
import { Assignment } from "./models/Assignment.model.js";

const daysAgo = (n) => new Date(Date.now() - n * 86400000);
const daysAhead = (n) => new Date(Date.now() + n * 86400000);

const STUDENTS = [
  ["Kasun Rajapaksa","BSc Computer Science","Active","Low","Direct (Z-score)",78,8,"SC/2021/12001",3.62],
  ["Nimasha Fernando","BSc Computer Science","Active","Medium","Direct (Z-score)",66,20,"SC/2021/12014",3.05],
  ["Tharindu Silva","BSc Physical Science","Enrolled","Low","Foundation",32,35,"SC/2022/13008",3.40],
  ["Ishara Wickramasinghe","BSc Computer Science","Graduated","Low","Direct (Z-score)",120,60,"SC/2019/10045",3.78],
  ["Dilanka Bandara","BSc Physical Science","Applied","Medium","Foundation",0,4,"SC/2023/14002",0.0],
  ["Sachini Gunawardena","BSc Computer Science","Active","High","Transfer",54,14,"SC/2021/12030",2.41],
  ["Ravindu Jayasuriya","BSc Biological Science","Active","Low","Direct (Z-score)",88,28,"SC/2020/11017",3.55],
  ["Hasini Abeywardena","BSc Physical Science","Withdrawn","High","Direct (Z-score)",21,95,"SC/2021/12088",1.85],
  ["Yasas Herath","BSc Computer Science","Graduated","Low","Scholarship",120,110,"SC/2019/10061",3.91],
  ["Oshadhi Senanayake","BSc Biological Science","Enrolled","Medium","Mature",40,18,"SC/2022/13022",3.12],
  ["Chamod Ekanayake","BSc Computer Science","Applied","Medium","Direct (Z-score)",0,2,"SC/2023/14019",0.0],
  ["Sandali Weerasinghe","BSc Physical Science","Active","High","Foundation",62,48,"SC/2021/12052",2.28],
  ["Naveen Dias","BSc Computer Science","Graduated","Medium","Direct (Z-score)",120,150,"SC/2019/10073",3.33],
  ["Piumi Kumari","BSc Biological Science","Enrolled","Low","Scholarship",30,22,"SC/2022/13040",3.48],
  ["Lahiru Madushanka","BSc Physical Science","Applied","Medium","Transfer",12,6,"SC/2023/14026",2.90],
  ["Amaya Rathnayake","BSc Computer Science","Withdrawn","Low","Direct (Z-score)",18,70,"SC/2021/12099",1.60],
];

const LECTURERS = [
  ["Dr. Anusha Walisadeera","Senior Lecturer","Computer Science",["ontologies","databases"],true],
  ["Dr. K. D. C. G. Kapugama","Lecturer","Computer Science",["AI","research-supervisor"],true],
  ["Prof. Sunil Wickramasinghe","Professor","Physical Science",["physics"],false],
  ["Dr. Malithi Perera","Senior Lecturer","Computer Science",["networks","security"],false],
  ["Dr. Ruwan Gamage","Lecturer","Biological Science",["botany"],false],
  ["Ms. Dilrukshi Fernando","Lecturer","Computer Science",["software-engineering"],true],
  ["Dr. Chathura Rathnayake","Senior Lecturer","Physical Science",["mathematics"],false],
  ["Prof. Nadeeka Jayawardena","Professor","Biological Science",["zoology"],false],
];

const seed = async () => {
  await connectDB();
  console.log("Clearing existing data…");
  await Promise.all([
    User.deleteMany({}), Student.deleteMany({}), Lecturer.deleteMany({}),
    Note.deleteMany({}), Assignment.deleteMany({}),
  ]);

  const user = await User.create({
    name: "Ms. Nadeesha Perera",
    email: "registrar@ruh.ac.lk",
    password: "Test@1234",
    role: "registrar",
    program: "University of Ruhuna",
  });
  const owner = user._id;

  const students = await Student.insertMany(
    STUDENTS.map(([name, program, status, priority, source, value, age, regNo, gpa]) => ({
      owner, name, program, status, priority, source, value, regNo, gpa,
      email: `${name.toLowerCase().replace(/[^a-z]/g, "")}@ruh.ac.lk`,
      phone: "+94 71 234 4567",
      tags: [program.replace("BSc ", "")],
      notes: status === "Graduated" ? "Degree conferred." : "Progressing through the programme.",
      createdAt: daysAgo(age), updatedAt: daysAgo(Math.floor(age / 4)),
    }))
  );

  const lecturers = await Lecturer.insertMany(
    LECTURERS.map(([name, title, program, tags, favorite]) => ({
      owner, name, title, program, tags, favorite,
      email: `${name.split(" ").slice(-1)[0].toLowerCase()}@ruh.ac.lk`,
      phone: "+94 41 222 2000",
    }))
  );

  const byName = (n) => students.find((s) => s.name === n)?._id || null;

  await Note.insertMany([
    { owner, content: "Advised to repeat CS3202; meeting scheduled with academic advisor.", student: byName("Sachini Gunawardena"), pinned: true },
    { owner, content: "Requested deadline extension for the research project due to illness.", student: byName("Sandali Weerasinghe") },
    { owner, content: "Strong candidate for the Dean's list this semester.", student: byName("Kasun Rajapaksa"), pinned: true },
    { owner, content: "Attendance below 80% in two modules — send warning letter.", student: byName("Hasini Abeywardena") },
    { owner, content: "Final-year project topic approved: semantic diversity fuzzing.", student: byName("Nimasha Fernando") },
    { owner, content: "Graduation cleared — no outstanding dues.", student: byName("Yasas Herath") },
  ]);

  await Assignment.insertMany([
    { owner, title: "Grade CS2011 lab reports", priority: "High", status: "Pending", dueDate: daysAgo(2), relatedStudent: byName("Tharindu Silva") },
    { owner, title: "Review research proposal draft", priority: "Medium", status: "In Progress", dueDate: daysAhead(3), relatedStudent: byName("Nimasha Fernando") },
    { owner, title: "Semester attendance audit", priority: "Low", status: "Pending", dueDate: daysAhead(7), relatedStudent: byName("Ravindu Jayasuriya") },
    { owner, title: "Prepare probation review report", priority: "High", status: "Completed", dueDate: daysAgo(4), completedAt: daysAgo(1), relatedStudent: byName("Sachini Gunawardena") },
    { owner, title: "Finalise CS4026 marks", priority: "High", status: "Pending", dueDate: new Date(), relatedStudent: byName("Kasun Rajapaksa") },
    { owner, title: "Schedule viva for final-year project", priority: "Low", status: "Pending", dueDate: daysAhead(5), relatedStudent: byName("Lahiru Madushanka") },
  ]);

  console.log(`Seeded: 1 user, ${students.length} students, ${lecturers.length} lecturers, 6 notes, 6 assignments.`);
  console.log("Login →  registrar@ruh.ac.lk  /  Test@1234");
  await mongoose.connection.close();
  process.exit(0);
};

seed().catch(async (err) => {
  console.error("Seed failed:", err.message);
  await mongoose.connection.close().catch(() => {});
  process.exit(1);
});
