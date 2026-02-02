import Lecture from "../models/Lectures.js";
import Course from "../models/Course.js";
import Enrollment from "../models/Enrollment.js";
import mongoose from "mongoose";

/* ================= CREATE LECTURE ================= */
export const createLecture = async (req, res) => {
  try {
    const {
      title,
      description,
      course,
      lectureNumber,
      type,
      videoUrl,
      duration,
      isFreePreview,
      subCategory,
    } = req.body;

    if (!title || !description || !course || !type || !subCategory) {
      return res.status(400).json({
        success: false,
        message: "Required fields are missing",
      });
    }

    const findCourse = await Course.findById(course);
    if (!findCourse) {
      return res.status(404).json({ success: false, message: "Course not found" });
    }

    const lecture = await Lecture.create({
      title,
      description,
      course,
      lectureNumber: lectureNumber || 1,
      type,
      videoUrl: videoUrl || "",
      duration: duration || 0,
      isFreePreview: Boolean(isFreePreview),
      subCategory,

      videoPath: req.files?.video?.[0]?.path || "",
      pdfPath: req.files?.pdf?.[0]?.path || "",
      documentPath: req.files?.document?.[0]?.path || "",
      excelPath: req.files?.excel?.[0]?.path || "",
      pptPath: req.files?.ppt?.[0]?.path || "",
    });

    findCourse.totalLectures = (findCourse.totalLectures || 0) + 1;
    await findCourse.save();

    res.status(201).json({
      success: true,
      message: "Lecture created successfully",
      lecture,
    });
  } catch (error) {
    console.error("CreateLecture Error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

/* ================= UPDATE LECTURE ================= */
export const updateLecture = async (req, res) => {
  try {
    const updatedData = { ...req.body };

    if (req.files?.video) updatedData.videoPath = req.files.video[0].path;
    if (req.files?.pdf) updatedData.pdfPath = req.files.pdf[0].path;
    if (req.files?.document) updatedData.documentPath = req.files.document[0].path;
    if (req.files?.excel) updatedData.excelPath = req.files.excel[0].path;
    if (req.files?.ppt) updatedData.pptPath = req.files.ppt[0].path;

    const lecture = await Lecture.findByIdAndUpdate(
      req.params.id,
      updatedData,
      { new: true, runValidators: true }
    );

    if (!lecture) {
      return res.status(404).json({ success: false, message: "Lecture not found" });
    }

    res.json({
      success: true,
      message: "Lecture updated successfully",
      lecture,
    });
  } catch (error) {
    console.error("UpdateLecture Error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

/* ================= GET LECTURES BY COURSE ================= */
// export const getLecturesByCourse = async (req, res) => {
//   try {
//     const { courseId } = req.params;

//     // 🔐 Logged-in user OR guest
//     const studentId = req.user?._id || req.query.studentId;

//     if (!mongoose.Types.ObjectId.isValid(courseId)) {
//       return res.status(400).json({ success: false, message: "Invalid course ID" });
//     }

//     const course = await Course.findById(courseId).select("price");
//     if (!course) {
//       return res.status(404).json({ success: false, message: "Course not found" });
//     }

//     let isPaidStudent = false;

//     // ✅ FREE COURSE → FULL ACCESS
//     if (course.price === 0) {
//       isPaidStudent = true;
//     }
//     // ✅ PAID COURSE → CHECK ENROLLMENT
//     else if (studentId && mongoose.Types.ObjectId.isValid(studentId)) {
//       const enrollment = await Enrollment.findOne({
//         student: studentId,
//         course: courseId,
//         isPaid: true,
//       });
//       isPaidStudent = !!enrollment;
//     }

//     const query = {
//       course: courseId,
//       status: "Active",
//       isDeleted: false,
//     };

//     if (!isPaidStudent) {
//       query.isFreePreview = true;
//     }

//     const lectures = await Lecture.find(query).sort({ lectureNumber: 1 });

//     res.status(200).json({
//       success: true,
//       isPaidStudent,
//       lectures,
//       message: isPaidStudent
//         ? "Full access granted"
//         : "Showing free preview lectures only",
//     });
//   } catch (error) {
//     console.error("GetLecturesByCourse Error:", error);
//     res.status(500).json({ success: false, message: "Server error" });
//   }
// };
export const getLecturesByCourse = async (req, res) => {
  try {
    const { courseId } = req.params;
    const studentId = req.user?._id || req.query.studentId;

    if (!mongoose.Types.ObjectId.isValid(courseId)) {
      return res.status(400).json({ success: false, message: "Invalid course ID" });
    }

    const course = await Course.findById(courseId).select("price title");
    if (!course) {
      return res.status(404).json({ success: false, message: "Course not found" });
    }

    let isPaidStudent = false;
    let hasFullAccess = false;

    // ✅ FREE COURSE → FULL ACCESS (SABSE PEHLE CHECK)
    if (course.price === 0) {
      isPaidStudent = true;
      hasFullAccess = true;
    }
    // ✅ PAID COURSE → CHECK ENROLLMENT
    else if (studentId && mongoose.Types.ObjectId.isValid(studentId)) {
      const enrollment = await Enrollment.findOne({
        student: studentId,
        course: courseId,
      });

      if (enrollment) {
        isPaidStudent = enrollment.isPaid || false;
        hasFullAccess = enrollment.isPaid || false;
      }
    }

    // ✅ Query banao
    const query = {
      course: courseId,
      status: "Active",
      isDeleted: false,
    };

    // Agar student ne pay nahi kiya aur course paid hai, to sirf free preview
    if (!isPaidStudent && course.price > 0) {
      query.isFreePreview = true;
    }

    const lectures = await Lecture.find(query).sort({ lectureNumber: 1 });

    res.status(200).json({
      success: true,
      isPaidStudent,
      hasFullAccess,  // ✅ IMPORTANT
      coursePrice: course.price || 0,  // ✅ IMPORTANT
      lectures,
      message: hasFullAccess
        ? "Full access granted"
        : course.price === 0
        ? "Free course - all lectures available"
        : "Showing free preview lectures only",
    });
  } catch (error) {
    console.error("GetLecturesByCourse Error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};


/* ================= GET SINGLE LECTURE ================= */
export const getLecture = async (req, res) => {
  try {
    const lecture = await Lecture.findById(req.params.id).populate(
      "course",
      "title"
    );

    if (!lecture || lecture.isDeleted || lecture.status === "Inactive") {
      return res.status(404).json({ success: false, message: "Lecture not found" });
    }

    res.status(200).json({ success: true, lecture });
  } catch (error) {
    console.error("GetLecture Error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

/* ================= DELETE LECTURE (SOFT) ================= */
export const deleteLecture = async (req, res) => {
  try {
    const lecture = await Lecture.findById(req.params.id);
    if (!lecture) {
      return res.status(404).json({ success: false, message: "Lecture not found" });
    }

    lecture.isDeleted = true;
    await lecture.save();

    res.json({
      success: true,
      message: "Lecture deleted successfully",
    });
  } catch (error) {
    console.error("DeleteLecture Error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};
