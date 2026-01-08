import express from "express";
import { createQuestion, getQuestionsByExam, updateQuestion, deleteQuestion } from "../controllers/questionController.js";

const router = express.Router();

router.post("/", createQuestion);
router.get("/exam/:examId", getQuestionsByExam);
router.put("/:id", updateQuestion);
router.delete("/:id", deleteQuestion);

export default router;
