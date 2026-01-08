import jwt from "jsonwebtoken";
import User from "../models/User.js";

export const protect = async (req, res, next) => {
  
  let token;

  if (req.headers.authorization?.startsWith("Bearer")) {
    try {
      token = req.headers.authorization.split(" ")[1];

      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      req.user = await User.findById(decoded.id).select("-password");

      if (!req.user) {
        return res.status(401).json({ message: "User not found" });
      }

      next();
    } catch (error) {
      return res.status(401).json({ message: "Not authorized, token failed" });
    }
  } else {
    return res.status(401).json({ message: "Not authorized, no token" });
  }
};


export const admin = (req, res, next) => {
 
  console.log("🔐 Admin check - User role:", req.user?.role);
  
  if (req.user?.role?.toLowerCase() === "admin") {
    console.log("✅ Admin access granted"); // ✅ Yeh bhi add karein
    next();
  } else {
    console.log("❌ Admin access denied"); // ✅ Yeh bhi add karein
    return res.status(403).json({ message: "Admin access only" });
  }
};
