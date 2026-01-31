// import Lecture from "../models/Lectures.js";
// import Course from "../models/Course.js";
// import Enrollement from "../models/Enrollment.js";
// import mongoose from "mongoose";

// // CREATE LECTURE
// export const createLecture = async (req, res) => {
//   try {
//     const { title, description, course, lectureNumber, type, videoUrl, duration, isFreePreview, priceRequired, subCategory } = req.body;

//     if (!title || !description || !course) {
//       return res.status(400).json({ message: "Title, description, and course are required" });
//     }

//     const findCourse = await Course.findById(course);
//     if (!findCourse) return res.status(404).json({ message: "Course not found" });

//     const lecture = await Lecture.create({
//       title,
//       description,
//       course,
//       lectureNumber: lectureNumber || 1,
//       type,
//       videoUrl: videoUrl || "",
//       duration: duration || 0,
//       isFreePreview: isFreePreview || false,
//       priceRequired: priceRequired || 0,   //new
//       subCategory: subCategory || "",//new
//       priceRequired,
//       subCategory,
//       videoPath: req.files?.video?.[0]?.path || "",
//       pdfPath: req.files?.pdf?.[0]?.path || "",
//       documentPath: req.files?.document?.[0]?.path || "",
//       excelPath: req.files?.excel?.[0]?.path || "",
//       pptPath: req.files?.ppt?.[0]?.path || "",
//     });

//     findCourse.totalLectures = (findCourse.totalLectures || 0) + 1;
//     await findCourse.save();

//     res.status(201).json({ message: "Lecture created successfully", lecture });
//   } catch (error) {
//     console.error("CreateLecture Error:", error);
//     res.status(500).json({ message: "Server error", error: error.message });
//   }
// };

// // UPDATE LECTURE
// export const updateLecture = async (req, res) => {
//   try {
//     const updatedData = { ...req.body };

//     if (req.files?.video) updatedData.videoPath = req.files.video[0].path;
//     if (req.files?.pdf) updatedData.pdfPath = req.files.pdf[0].path;
//     if (req.files?.document) updatedData.documentPath = req.files.document[0].path;
//     if (req.files?.excel) updatedData.excelPath = req.files.excel[0].path;
//     if (req.files?.ppt) updatedData.pptPath = req.files.ppt[0].path;

//     const lecture = await Lecture.findByIdAndUpdate(req.params.id, updatedData, { new: true, runValidators: true });
//     if (!lecture) return res.status(404).json({ message: "Lecture not found" });

//     res.json({ message: "Lecture updated successfully", lecture });
//   } catch (error) {
//     console.error("UpdateLecture Error:", error);
//     res.status(500).json({ message: "Server error", error: error.message });
//   }
// };

// // // GET BY COURSE
// // export const getLecturesByCourse = async (req, res) => {
// //   try {
// //     const lectures = await Lecture.find({ course: req.params.courseId, isDeleted: false, status: "Active" })
// //     // .populate("course","title")
// //     .sort({ lectureNumber: 1 });
// //     res.json(lectures);
// //   } catch (error) {
// //     console.error("GetLecturesByCourse Error:", error);
// //     res.status(500).json({ message: "Server error", error: error.message });
// //   }
// // };

// //new


// /* ================= GET LECTURES BY COURSE ================= */
// // Show lectures according to enrollment/payment
// export const getLecturesByCourse = async (req, res) => {
//   try {
//     const courseId = req.params.courseId;
//     const studentId = req.user?._id; // Authenticated user ID

//     if (!mongoose.Types.ObjectId.isValid(courseId)) {
//       return res.status(400).json({ message: "Invalid course ID" });
//     }

//     // Check if student is enrolled and paid
//     const enrollment = await Enrollment.findOne({ student: studentId, course: courseId });

//     let lectures;
//     if (enrollment && enrollment.isPaid) {
//       // Paid student: show all active lectures
//       lectures = await Lecture.find({ course: courseId, status: "Active", isDeleted: false })
//         .sort({ lectureNumber: 1 });
//     } else {
//       // Free student: show only free previews
//       lectures = await Lecture.find({ course: courseId, isFreePreview: true, status: "Active", isDeleted: false })
//         .sort({ lectureNumber: 1 });
//     }

//     res.json(lectures);
//   } catch (error) {
//     console.error("GetLecturesByCourse Error:", error);
//     res.status(500).json({ message: "Server error", error: error.message });
//   }
// };

// // GET SINGLE
// export const getLecture = async (req, res) => {
//   try {
//     const lecture = await Lecture.findById(req.params.id).populate("course", "title");
//     if (!lecture || lecture.isDeleted) return res.status(404).json({ message: "Lecture not found" });
//     res.json(lecture);
//   } catch (error) {
//     console.error("GetLecture Error:", error);
//     res.status(500).json({ message: "Server error", error: error.message });
//   }
// };

// // DELETE (soft)
// export const deleteLecture = async (req, res) => {
//   try {
//     const lecture = await Lecture.findById(req.params.id);
//     if (!lecture) return res.status(404).json({ message: "Lecture not found" });
//     lecture.isDeleted = true;
//     await lecture.save();
//     res.json({ message: "Lecture deleted successfully" });
//   } catch (error) {
//     console.error("DeleteLecture Error:", error);
//     res.status(500).json({ message: "Server error", error: error.message });
//   }
// };















import Lecture from "../models/Lectures.js";
import Course from "../models/Course.js";
import Enrollment from "../models/Enrollment.js"; // ✅ Fixed typo
import mongoose from "mongoose";

// CREATE LECTURE
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
      priceRequired, 
      subCategory 
    } = req.body;

    if (!title || !description || !course) {
      return res.status(400).json({ message: "Title, description, and course are required" });
    }

    const findCourse = await Course.findById(course);
    if (!findCourse) return res.status(404).json({ message: "Course not found" });

    const lecture = await Lecture.create({
      title,
      description,
      course,
      lectureNumber: lectureNumber || 1,
      type,
      videoUrl: videoUrl || "",
      duration: duration || 0,
      isFreePreview: isFreePreview || false,
      priceRequired: priceRequired || 0,
      subCategory: subCategory || "",
      videoPath: req.files?.video?.[0]?.path || "",
      pdfPath: req.files?.pdf?.[0]?.path || "",
      documentPath: req.files?.document?.[0]?.path || "",
      excelPath: req.files?.excel?.[0]?.path || "",
      pptPath: req.files?.ppt?.[0]?.path || "",
    });

    findCourse.totalLectures = (findCourse.totalLectures || 0) + 1;
    await findCourse.save();

    res.status(201).json({ message: "Lecture created successfully", lecture });
  } catch (error) {
    console.error("CreateLecture Error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// UPDATE LECTURE
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
    
    if (!lecture) return res.status(404).json({ message: "Lecture not found" });

    res.json({ message: "Lecture updated successfully", lecture });
  } catch (error) {
    console.error("UpdateLecture Error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

/* ================= GET LECTURES BY COURSE ================= */
// ✅ Show lectures according to enrollment/payment
export const getLecturesByCourse = async (req, res) => {
  try {
    const courseId = req.params.courseId;
    const studentId = req.query.studentId; // ✅ Get from query param instead of req.user

    if (!mongoose.Types.ObjectId.isValid(courseId)) {
      return res.status(400).json({ message: "Invalid course ID" });
    }

    // ✅ Check if student is enrolled and paid
    let isPaidStudent = false;
    
    if (studentId && mongoose.Types.ObjectId.isValid(studentId)) {
      const enrollment = await Enrollment.findOne({ 
        student: studentId, 
        course: courseId 
      });
      
      isPaidStudent = enrollment && enrollment.isPaid === true;
    }

    let lectures;
    
    if (isPaidStudent) {
      // ✅ Paid student: show all active lectures
      lectures = await Lecture.find({ 
        course: courseId, 
        status: "Active", 
        isDeleted: false 
      }).sort({ lectureNumber: 1 });
    } else {
      // ✅ Free/non-enrolled student: show only free previews
      lectures = await Lecture.find({ 
        course: courseId, 
        isFreePreview: true, 
        status: "Active", 
        isDeleted: false 
      }).sort({ lectureNumber: 1 });
    }

    res.json({
      lectures,
      isPaidStudent,
      message: isPaidStudent 
        ? "Full access granted" 
        : "Showing free preview lectures only"
    });
  } catch (error) {
    console.error("GetLecturesByCourse Error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// GET SINGLE LECTURE
export const getLecture = async (req, res) => {
  try {
    const lecture = await Lecture.findById(req.params.id).populate("course", "title");
    if (!lecture || lecture.isDeleted) {
      return res.status(404).json({ message: "Lecture not found" });
    }
    res.json(lecture);
  } catch (error) {
    console.error("GetLecture Error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// DELETE LECTURE (soft)
export const deleteLecture = async (req, res) => {
  try {
    const lecture = await Lecture.findById(req.params.id);
    if (!lecture) return res.status(404).json({ message: "Lecture not found" });
    
    lecture.isDeleted = true;
    await lecture.save();
    
    res.json({ message: "Lecture deleted successfully" });
  } catch (error) {
    console.error("DeleteLecture Error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};