// routes/authRoutes.js
import express from "express"; // ✅ use import, not require
import { register, login } from "../controllers/authController.js";

const router = express.Router();

router.post("/register", register);
router.post("/login", login);

export default router; // ✅ default export
