import Enrollment from "../models/Enrollment.js";
import Course from "../models/Course.js";
import User from "../models/User.js";
import mongoose from "mongoose";

export const enrollCourse = async (req, res) => {
  try {
    console.log("📝 ENROLL COURSE REQUEST");
    console.log("Course ID:", req.params.courseId);
    console.log("Student ID:", req.user?._id);

    const { courseId } = req.params;
    const studentId = req.user?._id;

    // ✅ Validate courseId
    if (!mongoose.Types.ObjectId.isValid(courseId)) {
      return res.status(400).json({ 
        success: false, 
        message: "Invalid course ID" 
      });
    }

    // ✅ Check course exists
    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({ 
        success: false, 
        message: "Course not found" 
      });
    }

    // ✅ Check if already enrolled
    let enrollment = await Enrollment.findOne({
      student: studentId,
      course: courseId,
      isDeleted: { $ne: true }
    });

    if (enrollment) {
      console.log("✅ Already enrolled:", enrollment._id);
      return res.json({
        success: true,
        message: "Already enrolled in this course",
        enrollment,
        alreadyEnrolled: true
      });
    }

    // ✅ CRITICAL FIX: Determine payment status correctly
    const isFreeCourse = course.price === 0 || course.price === null || course.price === undefined;
    
    enrollment = await Enrollment.create({
      student: studentId,
      course: courseId,
      enrollmentStatus: isFreeCourse ? "active" : "pending",
      isPaid: isFreeCourse, // Free course = auto paid
      paymentMethod: isFreeCourse ? "free" : "card",
      enrolledAt: new Date()
    });

    console.log("✅ New enrollment created:", enrollment._id);

    // ✅ Also update User model if needed
    await User.findByIdAndUpdate(studentId, {
      $addToSet: { courses: courseId }
    });

    res.status(201).json({
      success: true,
      message: isFreeCourse 
        ? "Enrolled successfully! Full access granted." 
        : "Enrolled successfully! Payment required for full access.",
      enrollment,
      coursePrice: course.price,
      isFreeCourse
    });

  } catch (err) {
    console.error("❌ ENROLLMENT ERROR:", err);
    res.status(500).json({ 
      success: false, 
      message: "Failed to enroll in course",
      error: err.message 
    });
  }
};





/* ================= GET STUDENT ENROLLED COURSES ================= */
export const getEnrolledCourses = async (req, res) => {
  try {
    const { studentId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(studentId)) {
      return res.status(400).json({ message: "Invalid student ID" });
    }

    const enrollments = await Enrollment.find({ student: studentId })
      .populate("student", "fullName email")
      .populate("course", "title description duration price category subCategories")
      .lean();

    const formatted = enrollments.map((e) => ({
      _id: e._id,
      student: e.student,
      course: e.course,
      enrolledAt: e.createdAt,
      endDate: e.endDate || null,
      isPaid: e.isPaid || false,
      isDeleted: e.isDeleted || false,
    }));

    res.status(200).json(formatted);
  } catch (err) {
    console.error("Get enrolled courses error:", err);
    res.status(500).json({ message: "Failed to fetch enrollments" });
  }
};

/* ================= UPDATE PAYMENT STATUS ================= */
export const updatePaymentStatus = async (req, res) => {
  try {
    const { enrollmentId } = req.params;
    const { isPaid } = req.body;

    if (!mongoose.Types.ObjectId.isValid(enrollmentId)) {
      return res.status(400).json({ message: "Invalid enrollment ID" });
    }

    const enrollment = await Enrollment.findByIdAndUpdate(
      enrollmentId,
      { isPaid: isPaid === true },
      { new: true }
    ).populate("course", "title");

    if (!enrollment) {
      return res.status(404).json({ message: "Enrollment not found" });
    }

    res.status(200).json({
      message: "Payment status updated successfully",
      enrollment,
    });
  } catch (err) {
    console.error("Update payment error:", err);
    res.status(500).json({ message: "Failed to update payment status" });
  }
};

export const removeEnrollment = async (req, res) => {
  const { enrollmentId } = req.params;

  const enrollment = await Enrollment.findById(enrollmentId);
  if (!enrollment) {
    return res.status(404).json({ message: "Enrollment not found" });
  }

  enrollment.isDeleted = true;
  enrollment.enrollmentStatus = "cancelled";

  await enrollment.save();

  res.json({
    success: true,
    message: "Enrollment removed (soft delete)",
  });
};
export const checkEnrollmentStatus = async (req, res) => {
  try {
    const { studentId, courseId } = req.params;

    console.log("🔍 CHECK ENROLLMENT:", { studentId, courseId });

    // ✅ Validate IDs
    if (!mongoose.Types.ObjectId.isValid(studentId) || 
        !mongoose.Types.ObjectId.isValid(courseId)) {
      return res.status(400).json({ 
        success: false,
        message: "Invalid studentId or courseId" 
      });
    }

    // ✅ Get course first
    const course = await Course.findById(courseId).select("price title");
    if (!course) {
      return res.status(404).json({ 
        success: false, 
        message: "Course not found" 
      });
    }

    // ✅ Check enrollment
    const enrollment = await Enrollment.findOne({
      student: studentId,
      course: courseId,
      isDeleted: { $ne: true }
    })
    .populate("student", "fullName email")
    .populate("course", "title price duration");

    const isFreeCourse = course.price === 0;

    // ✅ If not enrolled
    if (!enrollment) {
      return res.status(200).json({
        success: true,
        isEnrolled: false,
        isPaid: false,
        hasAccess: isFreeCourse, // Free course = access even without enrollment
        isFreeCourse,
        coursePrice: course.price,
        courseTitle: course.title,
        message: isFreeCourse 
          ? "Free course available" 
          : "Not enrolled in this course"
      });
    }

    // ✅ If enrolled, determine payment status
    const isPaid = isFreeCourse ? true : (enrollment.isPaid === true);
    const hasAccess = isFreeCourse || isPaid;

    res.status(200).json({
      success: true,
      isEnrolled: true,
      isPaid,
      hasAccess,
      isFreeCourse,
      coursePrice: course.price,
      courseTitle: course.title,
      enrollment: {
        ...enrollment.toObject(),
        isPaid // Override with correct value
      },
      message: hasAccess 
        ? "Full access granted" 
        : "Enrolled but payment required"
    });

  } catch (err) {
    console.error("❌ CHECK ENROLLMENT ERROR:", err);
    res.status(500).json({ 
      success: false, 
      message: "Failed to check enrollment status",
      error: err.message
    });
  }
};





/* ================= GET ALL ENROLLMENTS FOR ADMIN ================= */
export const getAllEnrollments = async (req, res) => {
  try {
    const enrollments = await Enrollment.find()
      .populate("student", "fullName email phone")
      .populate("course", "title price duration category")
      .sort({ createdAt: -1 })
      .lean();

    const formatted = enrollments.map((e) => ({
      _id: e._id,
      studentId: e.student?._id,
      studentName: e.student?.fullName,
      studentEmail: e.student?.email,
      studentPhone: e.student?.phone,
      courseId: e.course?._id,
      courseTitle: e.course?.title,
      coursePrice: e.course?.price || 0,
      courseDuration: e.course?.duration,
      enrolledAt: e.createdAt,
      endDate: e.endDate,
      isPaid: e.isPaid || false,
      paymentDate: e.paymentDate || null,
      paymentMethod: e.paymentMethod || null,
      paymentId: e.paymentId || null
    }));

    res.status(200).json({
      success: true,
      count: formatted.length,
      enrollments: formatted
    });
  } catch (err) {
    console.error("Get all enrollments error:", err);
    res.status(500).json({ 
      success: false, 
      message: "Failed to fetch enrollments" 
    });
  }
};