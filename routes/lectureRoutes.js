import express from "express";
import { protect, admin } from "../middleware/authMiddleware.js";
import {
  createLecture,
  getLecturesByCourse,
  getLecture,
  updateLecture,
  deleteLecture,
} from "../controllers/lectureController.js";
import upload from "../middleware/uploadMiddleware.js";

const router = express.Router();

// ---------------------------
// FILE UPLOAD CONFIG
// ---------------------------
// Use the same upload.fields for create & update
const lectureUpload = upload.fields([
  { name: "video", maxCount: 1 },
  { name: "pdf", maxCount: 1 },
  { name: "document", maxCount: 1 },
  { name: "excel", maxCount: 1 },
  { name: "ppt", maxCount: 1 },
]);

// ==================
// ADMIN ROUTES
// ==================

// Create a new lecture
router.post("/create", protect, admin, lectureUpload, createLecture);

// Update an existing lecture
router.put("/update/:id", protect, admin, lectureUpload, updateLecture);

// Delete a lecture (soft delete)
router.delete("/delete/:id", protect, admin, deleteLecture);

// ==================
// ADMIN + STUDENT ROUTES
// ==================

// Get all lectures by course
// router.get("/course/:courseId", protect, getLecturesByCourse);
router.get("/course/:courseId",  getLecturesByCourse);

// Get a single lecture by ID
// router.get("/:id", protect, getLecture);
router.get("/:id", getLecture);

export default router;
