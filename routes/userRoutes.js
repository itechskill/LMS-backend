import express from "express";
import { protect, admin } from "../middleware/authMiddleware.js";

import {
  getAllUsers,
  getUserById,
  updateUser,
  deleteUser,
  createUser,
} from "../controllers/userController.js";

const router = express.Router();

/* =========================
   ADMIN ONLY ROUTES
   ========================= */

// Get all users (with courses populated)
router.get("/", protect, admin, getAllUsers);

// Create a new user (admin can assign courses)
router.post("/", protect, admin, createUser);

// Get a single user by ID (with courses populated)
router.get("/:id", protect, admin, getUserById);

// Update user info (admin can update courses, status, role, password)
router.put("/:id", protect, admin, updateUser);

// Delete user
router.delete("/:id", protect, admin, deleteUser);

export default router;
