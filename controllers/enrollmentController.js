import Enrollment from "../models/Enrollment.js";
import Course from "../models/Course.js";
import User from "../models/User.js";
import mongoose from "mongoose";

/* ================= ENROLL IN COURSE ================= */
export const enrollCourse = async (req, res) => {
  try {
    const { studentId, courseId } = req.body;

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

    // ✅ Calculate endDate (if duration exists in days)
    const endDate = course.duration
      ? new Date(Date.now() + Number(course.duration) * 24 * 60 * 60 * 1000)
      : null;

    // ✅ Save enrollment
    const enrollment = await Enrollment.create({
      student: studentId,
      course: courseId,
      endDate,
    });

    // ✅ OPTIONAL: Sync with User.courses (recommended if field exists)
    await User.findByIdAndUpdate(studentId, {
      $addToSet: { courses: courseId },
    });

    // ✅ Populate response
    const populatedEnrollment = await Enrollment.findById(enrollment._id)
      .populate("student", "fullName email")
      .populate("course", "title duration startDate endDate");

    res.status(201).json(populatedEnrollment);
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
      .populate("course", "title duration startDate endDate")
      .lean();

    const formatted = enrollments.map((e) => ({
      _id: e._id,
      student: e.student,
      course: e.course,
      enrolledAt: e.createdAt,
      endDate: e.endDate || null,
    }));

    res.status(200).json(formatted);
  } catch (err) {
    console.error("Get enrolled courses error:", err);
    res
      .status(500)
      .json({ message: "Failed to fetch enrollments" });
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

    // ✅ OPTIONAL: Remove from User.courses (sync)
    await User.findByIdAndUpdate(deleted.student, {
      $pull: { courses: deleted.course },
    });

    res
      .status(200)
      .json({ message: "Enrollment removed successfully" });
  } catch (err) {
    console.error("Remove enrollment error:", err);
    res
      .status(500)
      .json({ message: "Failed to remove enrollment" });
  }
};

