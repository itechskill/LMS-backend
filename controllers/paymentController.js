import mongoose from "mongoose";
import Enrollment from "../models/Enrollment.js";
import Course from "../models/Course.js";
import User from "../models/User.js";
import Payment from "../models/Payment.js"; // You'll need to create this model

/* ================= PROCESS PAYMENT ================= */
export const processPayment = async (req, res) => {
  try {
    const { studentId, courseId, paymentMethod, amount, paymentId } = req.body;

    // ✅ Validate ObjectIds
    if (
      !mongoose.Types.ObjectId.isValid(studentId) ||
      !mongoose.Types.ObjectId.isValid(courseId)
    ) {
      return res.status(400).json({ 
        success: false,
        message: "Invalid studentId or courseId" 
      });
    }

    // ✅ Check if course exists
    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({ 
        success: false,
        message: "Course not found" 
      });
    }

    // ✅ Check enrollment
    let enrollment = await Enrollment.findOne({
      student: studentId,
      course: courseId,
    });

    // If not enrolled, create enrollment
    if (!enrollment) {
      enrollment = await Enrollment.create({
        student: studentId,
        course: courseId,
        isPaid: false,
      });
    }

    // ✅ Update enrollment with payment info
    enrollment.isPaid = true;
    enrollment.paymentDate = new Date();
    enrollment.paymentMethod = paymentMethod;
    enrollment.paymentId = paymentId || `PAY_${Date.now()}`;
    await enrollment.save();

    // ✅ Create payment record (optional)
    const payment = await Payment.create({
      student: studentId,
      course: courseId,
      enrollment: enrollment._id,
      amount: amount || course.price,
      paymentMethod,
      paymentId: paymentId || `PAY_${Date.now()}`,
      status: 'completed'
    });

    // ✅ Update user courses
    await User.findByIdAndUpdate(studentId, {
      $addToSet: { courses: courseId },
    });

    res.status(200).json({
      success: true,
      message: "Payment successful! Course unlocked.",
      enrollment,
      payment
    });
  } catch (err) {
    console.error("Process payment error:", err);
    res.status(500).json({ 
      success: false,
      message: "Payment processing failed" 
    });
  }
};

/* ================= CHECK PAYMENT STATUS ================= */
export const checkPaymentStatus = async (req, res) => {
  try {
    const { studentId, courseId } = req.query;

    if (!studentId || !courseId) {
      return res.status(400).json({ 
        success: false,
        message: "studentId and courseId are required" 
      });
    }

    const enrollment = await Enrollment.findOne({
      student: studentId,
      course: courseId,
    });

    const course = await Course.findById(courseId).select("price");

    res.status(200).json({
      success: true,
      isPaid: enrollment?.isPaid || false,
      coursePrice: course?.price || 0,
      isFree: (course?.price || 0) === 0,
      enrollmentDate: enrollment?.createdAt
    });
  } catch (err) {
    console.error("Check payment status error:", err);
    res.status(500).json({ 
      success: false,
      message: "Failed to check payment status" 
    });
  }
};

/* ================= GET PAYMENT HISTORY ================= */
export const getPaymentHistory = async (req, res) => {
  try {
    const { studentId } = req.params;

    const payments = await Payment.find({ student: studentId })
      .populate("course", "title")
      .sort({ createdAt: -1 })
      .lean();

    res.status(200).json({
      success: true,
      count: payments.length,
      payments
    });
  } catch (err) {
    console.error("Get payment history error:", err);
    res.status(500).json({ 
      success: false,
      message: "Failed to fetch payment history" 
    });
  }
};

/* ================= GET ADMIN PAYMENTS DASHBOARD ================= */
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
      pendingPayments: payments.filter(p => p.status === 'pending').length,
      completedPayments: payments.filter(p => p.status === 'completed').length,
      paymentMethods: {
        card: payments.filter(p => p.paymentMethod === 'card').length,
        upi: payments.filter(p => p.paymentMethod === 'upi').length,
        netbanking: payments.filter(p => p.paymentMethod === 'netbanking').length
      }
    };

    res.status(200).json({
      success: true,
      stats,
      payments
    });
  } catch (err) {
    console.error("Get admin payments error:", err);
    res.status(500).json({ 
      success: false,
      message: "Failed to fetch payments data" 
    });
  }
};