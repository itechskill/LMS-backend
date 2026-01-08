import Exam from "../models/Exam.js";

// ================= CREATE EXAM =================
export const createExam = async (req, res) => {
  try {
    const { title, description, duration, totalMarks, passingMarks, maxAttempts } = req.body;

    // ✅ Validation
    if (!title || !duration || !totalMarks || passingMarks === undefined) {
      return res.status(400).json({
        success: false,
        message: "All fields are required: title, duration, totalMarks, passingMarks",
      });
    }

    if (passingMarks > totalMarks) {
      return res.status(400).json({
        success: false,
        message: "passingMarks cannot be greater than totalMarks",
      });
    }

    if (passingMarks < 0 || totalMarks < 0) {
      return res.status(400).json({
        success: false,
        message: "Marks cannot be negative",
      });
    }

    const createdBy = req.user ? req.user._id : null;

    const exam = await Exam.create({
      title,
      description,
      duration,
      totalMarks,
      passingMarks,
      maxAttempts: maxAttempts || 3, // ✅ default 3 attempts
      createdBy,
    });

    res.status(201).json({
      success: true,
      message: "Exam created successfully",
      exam,
    });
  } catch (error) {
    console.error("❌ Create Exam Error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};

// ================= GET ALL EXAMS =================
export const getAllExams = async (req, res) => {
  try {
    const exams = await Exam.find()
      .populate("questions")
      .populate("createdBy", "name email")
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      exams,
    });
  } catch (error) {
    console.error("❌ Get All Exams Error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};

// ================= GET EXAM BY ID =================
export const getExamById = async (req, res) => {
  try {
    const exam = await Exam.findById(req.params.id)
      .populate("questions")
      .populate("createdBy", "name email");

    if (!exam) {
      return res.status(404).json({
        success: false,
        message: "Exam not found",
      });
    }

    // ✅ Include maxAttempts for front-end
    res.json({
      success: true,
      exam: {
        ...exam.toObject(),
        maxAttempts: exam.maxAttempts || 3
      },
    });
  } catch (error) {
    console.error("❌ Get Exam By ID Error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};

// ================= UPDATE EXAM =================
export const updateExam = async (req, res) => {
  try {
    const { totalMarks, passingMarks, maxAttempts } = req.body;

    if (totalMarks !== undefined && passingMarks !== undefined) {
      if (passingMarks > totalMarks) {
        return res.status(400).json({
          success: false,
          message: "passingMarks cannot be greater than totalMarks",
        });
      }
    }

    if (totalMarks !== undefined && totalMarks < 0) {
      return res.status(400).json({
        success: false,
        message: "Total marks cannot be negative",
      });
    }

    if (passingMarks !== undefined && passingMarks < 0) {
      return res.status(400).json({
        success: false,
        message: "Passing marks cannot be negative",
      });
    }

    if (maxAttempts !== undefined && maxAttempts <= 0) {
      return res.status(400).json({
        success: false,
        message: "maxAttempts must be greater than 0",
      });
    }

    const exam = await Exam.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!exam) {
      return res.status(404).json({
        success: false,
        message: "Exam not found",
      });
    }

    res.json({
      success: true,
      message: "Exam updated successfully",
      exam,
    });
  } catch (error) {
    console.error("❌ Update Exam Error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};

// ================= DELETE EXAM =================
export const deleteExam = async (req, res) => {
  try {
    const exam = await Exam.findByIdAndDelete(req.params.id);

    if (!exam) {
      return res.status(404).json({
        success: false,
        message: "Exam not found",
      });
    }

    res.json({
      success: true,
      message: "Exam deleted successfully",
    });
  } catch (error) {
    console.error("❌ Delete Exam Error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};
