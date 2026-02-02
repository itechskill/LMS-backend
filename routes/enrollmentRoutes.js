import express from "express";
import { 
  enrollCourse, 
  getEnrolledCourses, 
  updatePaymentStatus,
  removeEnrollment,
  checkEnrollmentStatus, // NEW
  getAllEnrollments // NEW
} from "../controllers/enrollmentController.js";

const router = express.Router();

// ✅ Enroll in course - POST /api/enrollments/enroll
router.post("/enroll", enrollCourse);

// ✅ Get student enrollments - GET /api/enrollments/student/:studentId
router.get("/student/:studentId", getEnrolledCourses);

// ✅ Check enrollment status - GET /api/enrollments/status/:studentId/:courseId
router.get("/status/:studentId/:courseId", checkEnrollmentStatus);

// ✅ Get all enrollments for admin - GET /api/enrollments/admin/all
router.get("/admin/all", getAllEnrollments);

// ✅ Update payment status - PATCH /api/enrollments/:enrollmentId/payment
router.patch("/:enrollmentId/payment", updatePaymentStatus);

// ✅ Remove enrollment - DELETE /api/enrollments/:id
router.delete("/:id", removeEnrollment);

export default router;