import express from "express";
import { 
  submitAttempt, 
  getAttemptsByUser, 
  getAttemptsByExam,
  getExamStatus  // ✅ MAKE SURE THIS IS IMPORTED
} from "../controllers/attemptController.js";

const router = express.Router();

// ✅ IMPORTANT: This route MUST come FIRST (before other param routes)
// Otherwise /status/:studentId/:examId will match /user/:userId
router.get("/status/:studentId/:examId", getExamStatus);

// Other routes
router.post("/", submitAttempt);
router.get("/user/:userId", getAttemptsByUser);
router.get("/exam/:examId", getAttemptsByExam);

export default router;