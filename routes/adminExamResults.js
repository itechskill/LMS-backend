import express from "express";
import { getAllExamResults } from "../controllers/examResultController.js";

const router = express.Router();

// Admin route to fetch all exam results
router.get("/exam-results", getAllExamResults);

export default router;
