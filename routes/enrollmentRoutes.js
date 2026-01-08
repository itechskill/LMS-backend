import express from "express";
import { enrollCourse, getEnrolledCourses, removeEnrollment } from "../controllers/enrollmentController.js";

const router = express.Router();

router.post("/enroll", enrollCourse);
router.get("/student/:studentId", getEnrolledCourses);
router.delete("/:id", removeEnrollment);

export default router;
