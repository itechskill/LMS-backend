import express from "express";
import { trackLecture, getProgress } from "../controllers/progressController.js";

const router = express.Router();

router.post("/track", trackLecture);
router.get("/:studentId/:courseId", getProgress);

export default router;
