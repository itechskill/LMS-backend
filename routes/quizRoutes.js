import express from "express";
import { addQuiz, updateQuiz, deleteQuiz, submitQuiz } from "../controllers/quizController.js";

const router = express.Router();

router.post("/", addQuiz);
router.put("/:id", updateQuiz);
router.delete("/:id", deleteQuiz);
router.post("/submit", submitQuiz);

export default router;
