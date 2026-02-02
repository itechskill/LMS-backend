import Enrollment from "../models/Enrollment.js";
import Course from "../models/Course.js";
import User from "../models/User.js";
import mongoose from "mongoose";

/* ================= ENROLL IN COURSE ================= */
export const enrollCourse = async (req, res) => {
  try {
    const { studentId, courseId, isPaid } = req.body;

    // ✅ Validate ObjectIds
    if (
      !mongoose.Types.ObjectId.isValid(studentId) ||
      !mongoose.Types.ObjectId.isValid(courseId)
    ) {
      return res.status(400).json({ message: "Invalid studentId or courseId" });
    }

    // ✅ Check duplicate enrollment
    const existing = await Enrollment.findOne({
      student: studentId,
      course: courseId,
    });
    if (existing) {
      return res
        .status(400)
        .json({ message: "Student already enrolled in this course" });
    }

    // ✅ Check course exists
    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({ message: "Course not found" });
    }

    // ✅ Determine payment status
    // If course price > 0, require payment. Free courses (price = 0) are auto-paid
    const paymentRequired = course.price > 0;
    const paymentStatus = paymentRequired ? (isPaid || false) : true;

    // ✅ Calculate endDate (if duration exists in hours, convert to days)
    const endDate = course.duration
      ? new Date(Date.now() + Number(course.duration) * 24 * 60 * 60 * 1000)
      : null;

    // ✅ Save enrollment
    const enrollment = await Enrollment.create({
      student: studentId,
      course: courseId,
      isPaid: paymentStatus,
      endDate,
    });

    // ✅ Sync with User.courses
    await User.findByIdAndUpdate(studentId, {
      $addToSet: { courses: courseId },
    });

    // ✅ Populate response
    const populatedEnrollment = await Enrollment.findById(enrollment._id)
      .populate("student", "fullName email")
      .populate("course", "title duration price");

    res.status(201).json({
      message: paymentRequired && !paymentStatus 
        ? "Enrolled successfully. Payment required to access content." 
        : "Enrolled successfully!",
      enrollment: populatedEnrollment,
      paymentRequired,
    });
  } catch (err) {
    console.error("Enroll course error:", err);
    res.status(500).json({ message: "Failed to enroll course" });
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

/* ================= REMOVE ENROLLMENT ================= */
export const removeEnrollment = async (req, res) => {
  try {
    const enrollmentId = req.params.id;

    if (!mongoose.Types.ObjectId.isValid(enrollmentId)) {
      return res.status(400).json({ message: "Invalid enrollment ID" });
    }

    const deleted = await Enrollment.findByIdAndDelete(enrollmentId);
    if (!deleted) {
      return res.status(404).json({ message: "Enrollment not found" });
    }

    // ✅ Remove from User.courses
    await User.findByIdAndUpdate(deleted.student, {
      $pull: { courses: deleted.course },
    });

    res.status(200).json({ message: "Enrollment removed successfully" });
  } catch (err) {
    console.error("Remove enrollment error:", err);
    res.status(500).json({ message: "Failed to remove enrollment" });
  }
};


//new


/* ================= CHECK ENROLLMENT STATUS WITH PAYMENT ================= */
// export const checkEnrollmentStatus = async (req, res) => {
//   try {
//     const { studentId, courseId } = req.params;

//     // ✅ Validate ObjectIds
//     if (
//       !mongoose.Types.ObjectId.isValid(studentId) ||
//       !mongoose.Types.ObjectId.isValid(courseId)
//     ) {
//       return res.status(400).json({ message: "Invalid studentId or courseId" });
//     }

//     // ✅ Check enrollment
//     const enrollment = await Enrollment.findOne({
//       student: studentId,
//       course: courseId,
//     })
//       .populate("student", "fullName email")
//       .populate("course", "title price duration");

//     if (!enrollment) {
//       return res.status(404).json({ 
//         message: "Not enrolled in this course",
//         isEnrolled: false,
//         isPaid: false 
//       });
//     }

//     res.status(200).json({
//       message: "Enrollment found",
//       isEnrolled: true,
//       isPaid: enrollment.isPaid || false,
//       enrollment
//     });
//   } catch (err) {
//     console.error("Check enrollment status error:", err);
//     res.status(500).json({ message: "Failed to check enrollment status" });
//   }
// };
export const checkEnrollmentStatus = async (req, res) => {
  try {
    const { studentId, courseId } = req.params;

    if (
      !mongoose.Types.ObjectId.isValid(studentId) ||
      !mongoose.Types.ObjectId.isValid(courseId)
    ) {
      return res.status(400).json({ message: "Invalid studentId or courseId" });
    }

    // ✅ Course ka price check karo
    const course = await Course.findById(courseId).select("price");
    if (!course) {
      return res.status(404).json({ message: "Course not found" });
    }

    const enrollment = await Enrollment.findOne({
      student: studentId,
      course: courseId,
    })
      .populate("student", "fullName email")
      .populate("course", "title price duration");

    if (!enrollment) {
      return res.status(404).json({ 
        message: "Not enrolled in this course",
        isEnrolled: false,
        isPaid: false,
        coursePrice: course.price || 0  // ✅ IMPORTANT: Course price return karo
      });
    }

    // ✅ FREE course hai to automatically isPaid true
    const isPaidStatus = course.price === 0 ? true : (enrollment.isPaid || false);

    res.status(200).json({
      message: "Enrollment found",
      isEnrolled: true,
      isPaid: isPaidStatus,  // ✅ Free courses ke liye true
      coursePrice: course.price || 0,  // ✅ Course price
      enrollment: {
        ...enrollment.toObject(),
        isPaid: isPaidStatus
      }
    });
  } catch (err) {
    console.error("Check enrollment status error:", err);
    res.status(500).json({ message: "Failed to check enrollment status" });
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