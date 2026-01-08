// utils/generateToken.js
import jwt from "jsonwebtoken";

const generateToken = (userId, role) => {
  return jwt.sign(
    { id: userId, role },
    process.env.JWT_SECRET,
    { expiresIn: "7d" } // token valid for 7 days
  );
};

// ✅ Default export for ES modules
export default generateToken;
