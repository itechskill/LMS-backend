import express from "express";
import { 
  processPayment,
  checkPaymentStatus,
  getPaymentHistory,
  getAdminPayments
} from "../controllers/paymentController.js";

const router = express.Router();

// ✅ Process payment - POST /api/payments/process
router.post("/process", processPayment);

// ✅ Check payment status - GET /api/payments/status
router.get("/status", checkPaymentStatus);

// ✅ Get payment history - GET /api/payments/history/:studentId
router.get("/history/:studentId", getPaymentHistory);

// ✅ Get admin payments dashboard - GET /api/payments/admin
router.get("/admin", getAdminPayments);

export default router;