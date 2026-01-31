// import express from "express";
// import {
//   createCourse,
//   getAllCourses,
//   getCourse,
//   updateCourse,
//   deleteCourse,
//   enrollStudent,
// } from "../controllers/courseController.js";

// import { protect, admin } from "../middleware/authMiddleware.js";
// import upload from "../middleware/uploadMiddleware.js";

// const router = express.Router();

// // ADMIN
// router.post("/create", protect, admin, upload.single("thumbnail"), createCourse);
// router.put("/update/:id", protect, admin, upload.single("thumbnail"), updateCourse);
// router.delete("/delete/:id", protect, admin, deleteCourse);

// // ADMIN + STUDENT
// router.get("/", protect, getAllCourses);
// router.get("/:id", protect, getCourse);

// // STUDENT
// router.post("/enroll/:courseId", protect, enrollStudent);

// export default router;




import express from "express";
import {
  createCourse,
  getAllCourses,
  getCourse,
  getCoursePrice, // NEW
  updateCourse,
  deleteCourse,
  enrollStudent,
} from "../controllers/courseController.js";

import { protect, admin } from "../middleware/authMiddleware.js";
import upload from "../middleware/uploadMiddleware.js";

const router = express.Router();

// ADMIN
router.post("/create", protect, admin, upload.single("thumbnail"), createCourse);
router.put("/update/:id", protect, admin, upload.single("thumbnail"), updateCourse);
router.delete("/delete/:id", protect, admin, deleteCourse);

// COURSE PRICE - NEW
router.get("/:id/price", getCoursePrice);

// ADMIN + STUDENT
router.get("/", protect, getAllCourses);
router.get("/:id", protect, getCourse);

// STUDENT
router.post("/enroll/:courseId", protect, enrollStudent);

export default router;