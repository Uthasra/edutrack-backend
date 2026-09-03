import jwt from "jsonwebtoken";
import { User } from "../models/User.model.js";

/* Verify the Bearer JWT and attach req.user (without the password hash). */
export const protect = async (req, res, next) => {
  try {
    const header = req.headers.authorization || "";
    const token = header.startsWith("Bearer ") ? header.slice(7) : null;
    if (!token) {
      res.status(401);
      throw new Error("Not authorized — no token");
    }
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id).select("-password");
    if (!user) {
      res.status(401);
      throw new Error("Not authorized — user not found");
    }
    req.user = user;
    next();
  } catch (err) {
    res.status(401);
    next(new Error(err.message || "Not authorized — token failed"));
  }
};
