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
const lectureUpload = upload.fields([
  { name: "video", maxCount: 1 },
  { name: "pdf", maxCount: 1 },
  { name: "document", maxCount: 1 },
  { name: "excel", maxCount: 1 },
  { name: "ppt", maxCount: 1 },
]);
router.post("/create", protect, admin, lectureUpload, createLecture);
router.put("/update/:id", protect, admin, lectureUpload, updateLecture);
router.delete("/delete/:id", protect, admin, deleteLecture);
router.get("/course/:courseId",  protect, getLecturesByCourse);
router.get("/:id", getLecture);

export default router;