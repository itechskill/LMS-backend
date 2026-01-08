// import mongoose from "mongoose";
// import Exam from "./Exam.js";

// const attemptSchema = new mongoose.Schema(
//   {
//     userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
//     exam: { type: mongoose.Schema.Types.ObjectId, ref: "Exam", required: true },
//     answers: [
//       {
//         questionId: { type: mongoose.Schema.Types.ObjectId, ref: "Question", required: true },
//         selectedOption: { type: String, required: true },
//         correctAnswer: String,
//         marks: { type: Number, default: 0 },
//       },
//     ],
//     score: { type: Number, default: 0 },
//     passed: { type: Boolean, default: false },
//     attemptNumber: { type: Number, default: 1 },
//     submittedAt: { type: Date, default: Date.now },
//   },
//   { timestamps: true }
// );

// // ✅ Compound index for faster queries
// attemptSchema.index({ userId: 1, exam: 1, createdAt: -1 });

// // ------------------ PRE-SAVE HOOK ------------------
// // Automatically calculate total score and passed status
// attemptSchema.pre("save", async function (next) {
//   try {
//     console.log("🔍 Attempt Pre-Save Hook Triggered");
    
//     // Total score = sum of marks in answers
//     const calculatedScore = this.answers.reduce((sum, ans) => sum + (ans.marks || 0), 0);
//     this.score = calculatedScore;

//     console.log("Calculated Score:", calculatedScore);
//     console.log("Current passed status:", this.passed);

//     // Fetch exam to determine passing marks (USE SAME LOGIC AS submitAttempt)
//     const exam = await Exam.findById(this.exam);
//     if (exam) {
//       // ✅ FIXED: Use same logic as submitAttempt controller
//       const passingMarks = exam.passingMarks !== undefined && exam.passingMarks !== null
//         ? Math.min(exam.passingMarks, exam.totalMarks || 0)
//         : Math.ceil((exam.totalMarks || 0) * 0.5);
        
//       const shouldPass = calculatedScore >= passingMarks;
      
//       console.log("Exam passingMarks:", exam.passingMarks);
//       console.log("Calculated passingMarks:", passingMarks);
//       console.log("Should pass:", shouldPass);
      
//       // Only update if different from current
//       if (this.passed !== shouldPass) {
//         this.passed = shouldPass;
//         console.log("Updated passed to:", this.passed);
//       }
//     }

//     // Auto-increment attemptNumber based on previous attempts
//     // Only for new documents and if not already set
//     if (this.isNew && (!this.attemptNumber || this.attemptNumber === 1)) {
//       const lastAttempt = await mongoose.model("Attempt").findOne({ 
//         userId: this.userId, 
//         exam: this.exam 
//       }).sort({ createdAt: -1 });
      
//       if (lastAttempt) {
//         this.attemptNumber = lastAttempt.attemptNumber + 1;
//         console.log("Auto-incremented attemptNumber to:", this.attemptNumber);
//       }
//     }

//     next();
//   } catch (err) {
//     console.error("Attempt pre-save error:", err);
//     next(err);
//   }
// });

// export default mongoose.model("Attempt", attemptSchema);








//##############################################//
//---------------------Time set--------------------//





import mongoose from "mongoose";
import Exam from "./Exam.js";

const attemptSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    exam: { type: mongoose.Schema.Types.ObjectId, ref: "Exam", required: true },
    answers: [
      {
        questionId: { type: mongoose.Schema.Types.ObjectId, ref: "Question", required: true },
        selectedOption: { type: String, required: true },
        correctAnswer: String,
        marks: { type: Number, default: 0 },
      },
    ],
    score: { type: Number, default: 0 },
    passed: { type: Boolean, default: false },
    attemptNumber: { type: Number, default: 1 },
    submittedAt: { type: Date, default: Date.now },
    // ✅ NEW: Cooldown field
    canRetryAfter: { 
      type: Date, 
      default: null
    }
  },
  { timestamps: true }
);

// ✅ Compound index for faster queries
attemptSchema.index({ userId: 1, exam: 1, createdAt: -1 });

// ------------------ PRE-SAVE HOOK ------------------
attemptSchema.pre("save", async function (next) {
  try {
    console.log("🔍 Attempt Pre-Save Hook Triggered");
    
    // Total score = sum of marks in answers
    const calculatedScore = this.answers.reduce((sum, ans) => sum + (ans.marks || 0), 0);
    this.score = calculatedScore;

    // Fetch exam to determine passing marks
    const exam = await Exam.findById(this.exam);
    if (exam) {
      // ✅ Use same logic as submitAttempt controller
      const passingMarks = exam.passingMarks !== undefined && exam.passingMarks !== null
        ? Math.min(exam.passingMarks, exam.totalMarks || 0)
        : Math.ceil((exam.totalMarks || 0) * 0.5);
        
      const shouldPass = calculatedScore >= passingMarks;
      
      // Only update if different from current
      if (this.passed !== shouldPass) {
        this.passed = shouldPass;
      }
      
      // ✅ NEW: Set cooldown for failed attempts
      if (!shouldPass) {
        const cooldownHours = 24;
        this.canRetryAfter = new Date(Date.now() + (cooldownHours * 60 * 60 * 1000));
      } else {
        this.canRetryAfter = null;
      }
    }

    // Auto-increment attemptNumber based on previous attempts
    if (this.isNew && (!this.attemptNumber || this.attemptNumber === 1)) {
      const lastAttempt = await mongoose.model("Attempt").findOne({ 
        userId: this.userId, 
        exam: this.exam 
      }).sort({ createdAt: -1 });
      
      if (lastAttempt) {
        this.attemptNumber = lastAttempt.attemptNumber + 1;
      }
    }

    next();
  } catch (err) {
    console.error("Attempt pre-save error:", err);
    next(err);
  }
});

export default mongoose.model("Attempt", attemptSchema);