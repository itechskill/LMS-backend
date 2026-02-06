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
      priceRequired,
      notes,
    } = req.body;

    // Required fields check
    if (!title || !description || !course || !type || !subCategory) {
      return res.status(400).json({
        success: false,
        message: "Required fields are missing",
      });
    }

    // Check if course exists
    const findCourse = await Course.findById(course);
    if (!findCourse) {
      return res.status(404).json({ 
        success: false, 
        message: "Course not found" 
      });
    }

    // Debug: Log uploaded files
    console.log("📁 Uploaded files:", req.files);
    
    // Extract filenames from uploaded files
    let videoFilename = "";
    let pdfFilename = "";
    let documentFilename = "";
    let excelFilename = "";
    let pptFilename = "";
    
    if (req.files?.video?.[0]) {
      videoFilename = req.files.video[0].filename;
      console.log("✅ Video file uploaded:", videoFilename);
    }
    
    if (req.files?.pdf?.[0]) {
      pdfFilename = req.files.pdf[0].filename;
      console.log("✅ PDF file uploaded:", pdfFilename);
    }
    
    if (req.files?.document?.[0]) {
      documentFilename = req.files.document[0].filename;
      console.log("✅ Document file uploaded:", documentFilename);
    }
    
    if (req.files?.excel?.[0]) {
      excelFilename = req.files.excel[0].filename;
      console.log("✅ Excel file uploaded:", excelFilename);
    }
    
    if (req.files?.ppt?.[0]) {
      pptFilename = req.files.ppt[0].filename;
      console.log("✅ PPT file uploaded:", pptFilename);
    }

    // Create lecture with public paths
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
      priceRequired: priceRequired || 0,
      notes: notes || "",
      
      // ✅ Save filenames only, NOT full paths
      videoPath: videoFilename ? `/uploads/${videoFilename}` : "",
      pdfPath: pdfFilename ? `/uploads/${pdfFilename}` : "",
      documentPath: documentFilename ? `/uploads${documentFilename}` : "",
      excelPath: excelFilename ? `/uploads${excelFilename}` : "",
      pptPath: pptFilename ? `/uploads${pptFilename}` : "",
    });

    console.log("✅ Lecture created with paths:", {
      videoPath: lecture.videoPath,
      pdfPath: lecture.pdfPath
    });

    // Update course lecture count
    findCourse.totalLectures = (findCourse.totalLectures || 0) + 1;
    await findCourse.save();

    res.status(201).json({
      success: true,
      message: "Lecture created successfully",
      lecture,
    });
  } catch (error) {
    console.error("❌ CreateLecture Error:", error);
    res.status(500).json({ 
      success: false, 
      message: "Server error",
      error: error.message 
    });
  }
};

/* ================= UPDATE LECTURE ================= */
export const updateLecture = async (req, res) => {
  try {
    const lectureId = req.params.id;
    const updateData = { ...req.body };
    
    // Debug files
    console.log("📁 Update files received:", req.files);
    
    // Update file paths with public URLs
    if (req.files?.video?.[0]) {
      updateData.videoPath = `/uploads/lectures/${req.files.video[0].filename}`;
      console.log("✅ Updated video path:", updateData.videoPath);
    }
    
    if (req.files?.pdf?.[0]) {
      updateData.pdfPath = `/uploads/lectures/${req.files.pdf[0].filename}`;
      console.log("✅ Updated PDF path:", updateData.pdfPath);
    }
    
    if (req.files?.document?.[0]) {
      updateData.documentPath = `/uploads/lectures/${req.files.document[0].filename}`;
      console.log("✅ Updated document path:", updateData.documentPath);
    }
    
    if (req.files?.excel?.[0]) {
      updateData.excelPath = `/uploads/lectures/${req.files.excel[0].filename}`;
      console.log("✅ Updated excel path:", updateData.excelPath);
    }
    
    if (req.files?.ppt?.[0]) {
      updateData.pptPath = `/uploads/lectures/${req.files.ppt[0].filename}`;
      console.log("✅ Updated PPT path:", updateData.pptPath);
    }
    
    // Convert boolean strings to actual booleans
    if (updateData.isFreePreview !== undefined) {
      updateData.isFreePreview = updateData.isFreePreview === 'true' || updateData.isFreePreview === true;
    }
    
    // Update lecture
    const lecture = await Lecture.findByIdAndUpdate(
      lectureId,
      updateData,
      { 
        new: true, 
        runValidators: true 
      }
    );

    if (!lecture) {
      return res.status(404).json({ 
        success: false, 
        message: "Lecture not found" 
      });
    }

    res.json({
      success: true,
      message: "Lecture updated successfully",
      lecture,
    });
  } catch (error) {
    console.error("❌ UpdateLecture Error:", error);
    res.status(500).json({ 
      success: false, 
      message: "Server error",
      error: error.message 
    });
  }
};

/* ================= GET LECTURES BY COURSE ================= */
export const getLecturesByCourse = async (req, res) => {
  try {
    const { courseId } = req.params;
    const studentId = req.user?._id || req.query.studentId;

    // Validate course ID
    if (!mongoose.Types.ObjectId.isValid(courseId)) {
      return res.status(400).json({ 
        success: false, 
        message: "Invalid course ID" 
      });
    }

    // Get course details
    const course = await Course.findById(courseId).select("price title");
    if (!course) {
      return res.status(404).json({ 
        success: false, 
        message: "Course not found" 
      });
    }

    // Check student access
    let isPaidStudent = false;
    let hasFullAccess = false;

    // ✅ FREE COURSE → FULL ACCESS
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

    // Build query
    const query = {
      course: courseId,
      status: "Active",
      isDeleted: false,
    };

    // If not paid student and course is paid, show only free preview
    if (!isPaidStudent && course.price > 0) {
      query.isFreePreview = true;
    }

    // Get lectures
    const lectures = await Lecture.find(query)
      .sort({ lectureNumber: 1 })
      .select("-__v");

    // Add full URLs to files for frontend
    const lecturesWithUrls = lectures.map(lecture => {
      const lectureObj = lecture.toObject();
      
      // Add full URLs for files
      if (lectureObj.videoPath) {
        lectureObj.videoUrlFull = `${process.env.BASE_URL || 'http://localhost:5000'}${lectureObj.videoPath}`;
      }
      if (lectureObj.pdfPath) {
        lectureObj.pdfUrlFull = `${process.env.BASE_URL || 'http://localhost:5000'}${lectureObj.pdfPath}`;
      }
      if (lectureObj.documentPath) {
        lectureObj.documentUrlFull = `${process.env.BASE_URL || 'http://localhost:5000'}${lectureObj.documentPath}`;
      }
      if (lectureObj.excelPath) {
        lectureObj.excelUrlFull = `${process.env.BASE_URL || 'http://localhost:5000'}${lectureObj.excelPath}`;
      }
      if (lectureObj.pptPath) {
        lectureObj.pptUrlFull = `${process.env.BASE_URL || 'http://localhost:5000'}${lectureObj.pptPath}`;
      }
      
      return lectureObj;
    });

    res.status(200).json({
      success: true,
      isPaidStudent,
      hasFullAccess,
      coursePrice: course.price || 0,
      lectures: lecturesWithUrls,
      message: hasFullAccess
        ? "Full access granted"
        : course.price === 0
        ? "Free course - all lectures available"
        : "Showing free preview lectures only",
    });
  } catch (error) {
    console.error("❌ GetLecturesByCourse Error:", error);
    res.status(500).json({ 
      success: false, 
      message: "Server error",
      error: error.message 
    });
  }
};

/* ================= GET SINGLE LECTURE ================= */
export const getLecture = async (req, res) => {
  try {
    const lecture = await Lecture.findById(req.params.id)
      .populate("course", "title")
      .select("-__v");

    if (!lecture || lecture.isDeleted || lecture.status === "Inactive") {
      return res.status(404).json({ 
        success: false, 
        message: "Lecture not found" 
      });
    }

    // Add full URLs
    const lectureObj = lecture.toObject();
    
    if (lectureObj.videoPath) {
      lectureObj.videoUrlFull = `${process.env.BASE_URL || 'http://localhost:5000'}${lectureObj.videoPath}`;
    }
    if (lectureObj.pdfPath) {
      lectureObj.pdfUrlFull = `${process.env.BASE_URL || 'http://localhost:5000'}${lectureObj.pdfPath}`;
    }
    if (lectureObj.documentPath) {
      lectureObj.documentUrlFull = `${process.env.BASE_URL || 'http://localhost:5000'}${lectureObj.documentPath}`;
    }
    if (lectureObj.excelPath) {
      lectureObj.excelUrlFull = `${process.env.BASE_URL || 'http://localhost:5000'}${lectureObj.excelPath}`;
    }
    if (lectureObj.pptPath) {
      lectureObj.pptUrlFull = `${process.env.BASE_URL || 'http://localhost:5000'}${lectureObj.pptPath}`;
    }

    res.status(200).json({ 
      success: true, 
      lecture: lectureObj 
    });
  } catch (error) {
    console.error("❌ GetLecture Error:", error);
    res.status(500).json({ 
      success: false, 
      message: "Server error",
      error: error.message 
    });
  }
};

/* ================= DELETE LECTURE (SOFT) ================= */
export const deleteLecture = async (req, res) => {
  try {
    const lecture = await Lecture.findById(req.params.id);
    
    if (!lecture) {
      return res.status(404).json({ 
        success: false, 
        message: "Lecture not found" 
      });
    }

    lecture.isDeleted = true;
    lecture.status = "Inactive";
    await lecture.save();

    // Decrement course lecture count
    await Course.findByIdAndUpdate(lecture.course, {
      $inc: { totalLectures: -1 }
    });

    res.json({
      success: true,
      message: "Lecture deleted successfully",
    });
  } catch (error) {
    console.error("❌ DeleteLecture Error:", error);
    res.status(500).json({ 
      success: false, 
      message: "Server error",
      error: error.message 
    });
  }
};

/* ================= GET ALL LECTURES (ADMIN) ================= */
export const getAllLectures = async (req, res) => {
  try {
    const lectures = await Lecture.find({ isDeleted: false })
      .populate("course", "title")
      .sort({ createdAt: -1 })
      .select("-__v");

    res.status(200).json({
      success: true,
      count: lectures.length,
      lectures,
    });
  } catch (error) {
    console.error("❌ GetAllLectures Error:", error);
    res.status(500).json({ 
      success: false, 
      message: "Server error" 
    });
  }
};