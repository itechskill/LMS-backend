import Attempt from "../models/Attempt.js";
import User from "../models/User.js";
import Exam from "../models/Exam.js";

// ================= GET ALL EXAM RESULTS =================
export const getAllExamResults = async (req, res) => {
  try {
    const attempts = await Attempt.find({})
      .populate("userId", "fullName email")  
      .populate("exam", "title totalMarks passingMarks") // exam info
      .sort({ createdAt: -1 });

    // console.log("✅ Total Attempts Found:", attempts.length);

    const results = attempts.map(a => {
      const obtained = a.score || 0;
      const total = a.exam?.totalMarks || 0;
      const passing = a.exam?.passingMarks || 0;
      const percentage = total > 0 ? ((obtained / total) * 100).toFixed(2) : 0;
      
      // Calculate status based on passing marks
      const status = obtained >= passing ? "Pass" : "Fail";

      // Debug log
      console.log("Processing Attempt:", {
        attemptId: a._id,
        userId: a.userId?._id,
        userFullName: a.userId?.fullName,  // ⚠️ fullName check karo
        userEmail: a.userId?.email,
        examTitle: a.exam?.title,
        score: obtained,
        total: total,
        passing: passing,
        status: status
      });

      return {
        _id: a._id,
        studentName: a.userId?.fullName || "Unknown Student", 
        studentEmail: a.userId?.email || "No Email",
        examTitle: a.exam?.title || "Deleted Exam",
        totalMarks: total,
        obtainedMarks: obtained,
        passingMarks: passing,
        percentage,
        status,
        attemptNumber: a.attemptNumber || 1,
        submittedAt: a.createdAt,
      };
    });

    console.log("✅ Sending Results:", results.length);
    res.json(results);
  } catch (error) {
    console.error("❌ Get All Exam Results Error:", error);
    res.status(500).json({ 
      success: false, 
      message: "Server error", 
      error: error.message 
    });
  }
};