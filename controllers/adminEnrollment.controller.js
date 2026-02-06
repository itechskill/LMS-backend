import Enrollment from "../models/Enrollment.js";
import User from "../models/User.js";
import Course from "../models/Course.js";
import mongoose from "mongoose";

// ✅ Admin grants free access to a student
export const adminGrantCourse = async (req, res) => {
  try {
    const { studentId, courseId } = req.body;

    // ✅ Validate IDs
    if (!mongoose.Types.ObjectId.isValid(studentId) || !mongoose.Types.ObjectId.isValid(courseId)) {
      return res.status(400).json({ success: false, message: "Invalid studentId or courseId" });
    }

    const course = await Course.findById(courseId);
    if (!course) return res.status(404).json({ success: false, message: "Course not found" });

    let enrollment = await Enrollment.findOne({ student: studentId, course: courseId });

    if (!enrollment) {
      enrollment = await Enrollment.create({
        student: studentId,
        course: courseId,
        isPaid: true,                  // ✅ Free access
        enrollmentStatus: "active",    // ✅ Make it active
        paymentDate: new Date(),
        paymentMethod: "admin-granted",
        enrolledAt: new Date()
      });
    } else {
      enrollment.isPaid = true;
      enrollment.enrollmentStatus = "active"; // ✅ Ensure active
      enrollment.paymentDate = new Date();
      enrollment.paymentMethod = "admin-granted";
      await enrollment.save();
    }

    // ✅ Update user courses
    await User.findByIdAndUpdate(studentId, { $addToSet: { courses: courseId } });

    res.status(200).json({
      success: true,
      message: "Free access granted successfully",
      enrollment
    });
  } catch (err) {
    console.error("Admin grant course error:", err);
    res.status(500).json({ success: false, message: "Failed to grant free access" });
  }
};
