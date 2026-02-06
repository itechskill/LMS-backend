import express from "express";
import { adminGrantCourse } from "../controllers/adminEnrollment.controller.js";
import { protect, admin } from "../middleware/authMiddleware.js";

const router = express.Router();
router.post("/grant-free-access", protect, admin, adminGrantCourse);

export default router;
