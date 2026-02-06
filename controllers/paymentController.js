import mongoose from "mongoose";
import Enrollment from "../models/Enrollment.js";
import Course from "../models/Course.js";
import User from "../models/User.js";
import Payment from "../models/Payment.js";

/* ================= PROCESS PAYMENT ================= */
export const processPayment = async (req, res) => {
  try {
    const { courseId, paymentId, paymentMethod = "card" } = req.body;
    const studentId = req.user._id;

    if (!mongoose.Types.ObjectId.isValid(courseId)) {
      return res.status(400).json({ success: false, message: "Invalid course ID" });
    }

    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({ success: false, message: "Course not found" });
    }

    const isFreeCourse = course.price === 0 || course.isFree === true;

    const enrollment = await Enrollment.findOne({
      student: studentId,
      course: courseId,
      isDeleted: { $ne: true }
    });

    if (!enrollment) {
      return res.status(400).json({ success: false, message: "Please enroll first" });
    }

    // ✅ Free course auto unlock
    if (isFreeCourse) {
      enrollment.isPaid = true;
      enrollment.enrollmentStatus = "active";
      await enrollment.save();

      return res.json({
        success: true,
        message: "Free course unlocked"
      });
    }

    // ✅ Paid course
    enrollment.isPaid = true;
    enrollment.enrollmentStatus = "active";
    enrollment.paymentDate = new Date();
    enrollment.paymentMethod = paymentMethod;
    enrollment.paymentId = paymentId || `PAY_${Date.now()}`;
    await enrollment.save();

    const payment = await Payment.create({
      student: studentId,
      course: courseId,
      enrollment: enrollment._id,
      amount: course.price,
      paymentMethod,
      paymentId: enrollment.paymentId,
      status: "completed"
    });

    await User.findByIdAndUpdate(studentId, {
      $addToSet: { courses: courseId }
    });

    res.json({
      success: true,
      message: "Payment successful. Course unlocked.",
      payment
    });

  } catch (error) {
    console.error("❌ PROCESS PAYMENT ERROR:", error);
    res.status(500).json({
      success: false,
      message: "Payment processing failed"
    });
  }
};

/* ================= CHECK PAYMENT STATUS ================= */
export const checkPaymentStatus = async (req, res) => {
  try {
    const { courseId } = req.params;
    const studentId = req.user._id;

    if (!mongoose.Types.ObjectId.isValid(courseId)) {
      return res.status(400).json({ success: false, message: "Invalid course ID" });
    }

    const course = await Course.findById(courseId).select("price isFree");
    if (!course) {
      return res.status(404).json({ success: false, message: "Course not found" });
    }

    const enrollment = await Enrollment.findOne({
      student: studentId,
      course: courseId,
      isDeleted: { $ne: true }
    });

    const isFreeCourse = course.price === 0 || course.isFree === true;
    const isPaid = isFreeCourse || enrollment?.isPaid === true;

    res.json({
      success: true,
      isEnrolled: !!enrollment,
      isPaid,
      hasAccess: isPaid,
      coursePrice: course.price,
      isFreeCourse
    });

  } catch (error) {
    console.error("❌ CHECK PAYMENT STATUS ERROR:", error);
    res.status(500).json({
      success: false,
      message: "Failed to check payment status"
    });
  }
};

/* ================= GET PAYMENT HISTORY ================= */
export const getPaymentHistory = async (req, res) => {
  try {
    const studentId = req.user._id;

    const payments = await Payment.find({ student: studentId })
      .populate("course", "title price")
      .sort({ createdAt: -1 })
      .lean();

    res.json({
      success: true,
      count: payments.length,
      payments
    });

  } catch (error) {
    console.error("❌ PAYMENT HISTORY ERROR:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch payment history"
    });
  }
};

/* ================= ADMIN PAYMENTS DASHBOARD ================= */
export const getAdminPayments = async (req, res) => {
  try {
    const payments = await Payment.find()
      .populate("student", "fullName email")
      .populate("course", "title price")
      .sort({ createdAt: -1 })
      .lean();

    const stats = {
      totalPayments: payments.length,
      totalRevenue: payments.reduce((sum, p) => sum + (p.amount || 0), 0),
      completedPayments: payments.filter(p => p.status === "completed").length,
      pendingPayments: payments.filter(p => p.status === "pending").length
    };

    res.json({
      success: true,
      stats,
      payments
    });

  } catch (error) {
    console.error("❌ ADMIN PAYMENTS ERROR:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch admin payments"
    });
  }
};
