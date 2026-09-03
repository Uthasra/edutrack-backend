import jwt from "jsonwebtoken";

/* Sign a JWT carrying the user id. */
export const generateToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || "7d",
  });
