import { asyncHandler } from "../utils/asyncHandler.js";
import { generateToken } from "../utils/generateToken.js";
import { User } from "../models/User.model.js";

// POST /api/auth/register
export const register = asyncHandler(async (req, res) => {
  const { name, email, password } = req.body;
  if (!name || !email || !password) {
    res.status(400);
    throw new Error("Name, email and password are required");
  }
  const exists = await User.findOne({ email });
  if (exists) {
    res.status(409);
    throw new Error("An account with that email already exists");
  }
  const user = await User.create({ name, email, password });
  res.status(201).json({ success: true, token: generateToken(user._id), user });
});

// POST /api/auth/login
export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email }).select("+password");
  if (!user || !(await user.matchPassword(password))) {
    res.status(401);
    throw new Error("Invalid email or password");
  }
  res.json({ success: true, token: generateToken(user._id), user });
});

// GET /api/auth/me
export const me = asyncHandler(async (req, res) => {
  res.json({ success: true, user: req.user });
});

// PUT /api/auth/profile
export const updateProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id).select("+password");
  const { name, email, program, avatar, password } = req.body;
  if (name !== undefined) user.name = name;
  if (email !== undefined) user.email = email;
  if (program !== undefined) user.program = program;
  if (avatar !== undefined) user.avatar = avatar;
  if (password) user.password = password;
  await user.save();
  res.json({ success: true, user });
});
