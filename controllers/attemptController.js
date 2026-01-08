// import Attempt from "../models/Attempt.js";
// import Question from "../models/Question.js";
// import Exam from "../models/Exam.js";

// // ------------------ SUBMIT ATTEMPT ------------------
// export const submitAttempt = async (req, res) => {
//   try {
//     const { userId, examId, answers } = req.body;

//     // Validation
//     if (!userId || !examId || !answers || !Array.isArray(answers) || answers.length === 0) {
//       return res.status(400).json({ success: false, message: "userId, examId and answers are required" });
//     }

//     // Fetch exam
//     const exam = await Exam.findById(examId);
//     if (!exam) return res.status(404).json({ success: false, message: "Exam not found" });

//     const maxAttempts = exam.maxAttempts || 3;
    
//     // ✅ FIXED: Proper passing marks calculation
//     const passingMarks = exam.passingMarks !== undefined && exam.passingMarks !== null
//       ? Math.min(exam.passingMarks, exam.totalMarks || 0)
//       : Math.ceil((exam.totalMarks || 0) * 0.5);

//     // Previous attempts
//     const existingAttempts = await Attempt.find({ userId, exam: examId }).sort({ createdAt: -1 });

//     // Already passed
//     if (existingAttempts.some(a => a.passed)) {
//       return res.status(400).json({ success: false, message: "You have already passed this exam." });
//     }

//     // Attempts exhausted
//     if (existingAttempts.length >= maxAttempts) {
//       return res.status(400).json({ success: false, message: `You have used all ${maxAttempts} attempts.`, attemptsLeft: 0 });
//     }

//     // Fetch questions
//     const questionIds = answers.map(a => a.questionId);
//     const questions = await Question.find({ _id: { $in: questionIds } });

//     // Calculate score and detailed answers
//     let totalScore = 0;
//     const detailedAnswers = answers.map(ans => {
//       const question = questions.find(q => q._id.toString() === ans.questionId);
//       if (!question) return { questionId: ans.questionId, selectedOption: ans.selectedOption, correctAnswer: null, marks: 0 };

//       const isCorrect = ans.selectedOption === question.correctAnswer;
//       const marksEarned = isCorrect ? (question.marks || 1) : 0;
//       totalScore += marksEarned;

//       return {
//         questionId: question._id,
//         selectedOption: ans.selectedOption,
//         correctAnswer: question.correctAnswer,
//         marks: marksEarned
//       };
//     });

//     // ✅ FIXED: Proper pass/fail determination
//     const passed = totalScore >= passingMarks;
    
//     // ✅ Debug log
//     console.log(`🔍 Submit Attempt Debug: Score=${totalScore}, Passing=${passingMarks}, Passed=${passed}`);

//     // Save attempt
//     const attempt = await Attempt.create({
//       userId,
//       exam: examId,
//       answers: detailedAnswers,
//       score: totalScore,
//       passed, // This will be saved correctly now
//       attemptNumber: existingAttempts.length + 1
//     });

//     const attemptsUsed = existingAttempts.length + 1;
//     const attemptsLeft = passed ? 0 : Math.max(0, maxAttempts - attemptsUsed);

//     res.status(201).json({
//       success: true,
//       message: passed ? "🎉 Congratulations! You passed the exam!" : `Exam submitted. You have ${attemptsLeft} attempt(s) remaining.`,
//       data: {
//         attemptId: attempt._id,
//         score: totalScore,
//         totalMarks: exam.totalMarks,
//         passingMarks,
//         passed,
//         status: passed ? "PASS" : "FAIL",
//         attemptNumber: attemptsUsed,
//         attemptsLeft,
//         totalAttemptsAllowed: maxAttempts,
//         submittedAt: attempt.createdAt,
//         exam: { title: exam.title, duration: exam.duration }
//       }
//     });

//   } catch (error) {
//     console.error("❌ Submit Attempt Error:", error);
//     res.status(500).json({ success: false, message: "Server error while submitting attempt", error: error.message });
//   }
// };

// // ------------------ GET ATTEMPTS BY USER ------------------
// export const getAttemptsByUser = async (req, res) => {
//   try {
//     const attempts = await Attempt.find({ userId: req.params.userId })
//       .populate("exam", "title totalMarks passingMarks duration")
//       .sort({ createdAt: -1 });
//     res.json({ success: true, attempts });
//   } catch (error) {
//     res.status(500).json({ success: false, message: error.message });
//   }
// };

// // ------------------ GET ATTEMPTS BY EXAM ------------------
// export const getAttemptsByExam = async (req, res) => {
//   try {
//     const attempts = await Attempt.find({ exam: req.params.examId })
//       .populate("userId", "name email")
//       .populate("exam", "title totalMarks passingMarks")
//       .sort({ createdAt: -1 });
//     res.json({ success: true, attempts });
//   } catch (error) {
//     res.status(500).json({ success: false, message: error.message });
//   }
// };

// // ------------------ GET EXAM STATUS ------------------
// export const getExamStatus = async (req, res) => {
//   try {
//     const { studentId, examId } = req.params;

//     const [exam, attempts] = await Promise.all([
//       Exam.findById(examId),
//       Attempt.find({ userId: studentId, exam: examId }).sort({ createdAt: -1 })
//     ]);

//     if (!exam) return res.status(404).json({ success: false, message: "Exam not found" });

//     const maxAttempts = exam.maxAttempts || 3;
    
//     // ✅ FIXED: Use the same passing marks calculation as submitAttempt
//     const passingMarks = exam.passingMarks !== undefined && exam.passingMarks !== null
//       ? Math.min(exam.passingMarks, exam.totalMarks || 0)
//       : Math.ceil((exam.totalMarks || 0) * 0.5);
      
//     const passedAttempt = attempts.find(a => a.passed);
//     const attemptsUsed = attempts.length;

//     console.log(`🔍 Get Exam Status Debug: Passing=${passingMarks}, Found passed attempt:`, passedAttempt);

//     res.json({
//       success: true,
//       data: {
//         canAttempt: !passedAttempt && attemptsUsed < maxAttempts,
//         passed: !!passedAttempt,
//         attemptsUsed,
//         attemptsLeft: passedAttempt ? 0 : Math.max(0, maxAttempts - attemptsUsed),
//         totalAttemptsAllowed: maxAttempts,
//         attempts: attempts.map(a => ({
//           attemptNumber: a.attemptNumber,
//           score: a.score,
//           passed: a.passed,
//           submittedAt: a.createdAt
//         })),
//         passingMarks
//       }
//     });
//   } catch (error) {
//     res.status(500).json({ success: false, message: error.message });
//   }
// };
















//##############################################//
//---------------------Time set--------------------//











import Attempt from "../models/Attempt.js";
import Question from "../models/Question.js";
import Exam from "../models/Exam.js";

// ------------------ SUBMIT ATTEMPT ------------------
export const submitAttempt = async (req, res) => {
  try {
    const { userId, examId, answers } = req.body;

    // Validation
    if (!userId || !examId || !answers || !Array.isArray(answers) || answers.length === 0) {
      return res.status(400).json({ success: false, message: "userId, examId and answers are required" });
    }

    // Fetch exam
    const exam = await Exam.findById(examId);
    if (!exam) return res.status(404).json({ success: false, message: "Exam not found" });

    const maxAttempts = exam.maxAttempts || 3;
    
    // ✅ Proper passing marks calculation
    const passingMarks = exam.passingMarks !== undefined && exam.passingMarks !== null
      ? Math.min(exam.passingMarks, exam.totalMarks || 0)
      : Math.ceil((exam.totalMarks || 0) * 0.5);

    // Previous attempts
    const existingAttempts = await Attempt.find({ userId, exam: examId }).sort({ createdAt: -1 });

    // Already passed
    if (existingAttempts.some(a => a.passed)) {
      return res.status(400).json({ success: false, message: "You have already passed this exam." });
    }

    // Attempts exhausted
    if (existingAttempts.length >= maxAttempts) {
      return res.status(400).json({ success: false, message: `You have used all ${maxAttempts} attempts.`, attemptsLeft: 0 });
    }

    // ✅ NEW: Check 24-hour cooldown after failed attempt
    if (existingAttempts.length > 0) {
      const lastAttempt = existingAttempts[0]; // Latest attempt
      const now = new Date();
      const lastAttemptTime = new Date(lastAttempt.createdAt);
      const hoursSinceLastAttempt = (now - lastAttemptTime) / (1000 * 60 * 60); // Convert to hours
      
      // Agar last attempt fail hua hai aur 24 hours nahi hue hain
      if (!lastAttempt.passed && hoursSinceLastAttempt < 24) {
        const hoursLeft = Math.ceil(24 - hoursSinceLastAttempt);
        const nextAttemptTime = new Date(lastAttemptTime.getTime() + (24 * 60 * 60 * 1000));
        
        return res.status(400).json({
          success: false,
          message: `You must wait ${hoursLeft} hour(s) before attempting again after a failed attempt.`,
          cooldownInfo: {
            hasCooldown: true,
            hoursRemaining: hoursLeft,
            nextAttemptTime: nextAttemptTime,
            lastAttemptTime: lastAttemptTime
          }
        });
      }
    }

    // Fetch questions
    const questionIds = answers.map(a => a.questionId);
    const questions = await Question.find({ _id: { $in: questionIds } });

    // Calculate score and detailed answers
    let totalScore = 0;
    const detailedAnswers = answers.map(ans => {
      const question = questions.find(q => q._id.toString() === ans.questionId);
      if (!question) return { questionId: ans.questionId, selectedOption: ans.selectedOption, correctAnswer: null, marks: 0 };

      const isCorrect = ans.selectedOption === question.correctAnswer;
      const marksEarned = isCorrect ? (question.marks || 1) : 0;
      totalScore += marksEarned;

      return {
        questionId: question._id,
        selectedOption: ans.selectedOption,
        correctAnswer: question.correctAnswer,
        marks: marksEarned
      };
    });

    // ✅ Proper pass/fail determination
    const passed = totalScore >= passingMarks;
    
    // Debug log
    console.log(`🔍 Submit Attempt Debug: Score=${totalScore}, Passing=${passingMarks}, Passed=${passed}`);

    // Save attempt
    const attempt = await Attempt.create({
      userId,
      exam: examId,
      answers: detailedAnswers,
      score: totalScore,
      passed,
      attemptNumber: existingAttempts.length + 1
    });

    const attemptsUsed = existingAttempts.length + 1;
    const attemptsLeft = passed ? 0 : Math.max(0, maxAttempts - attemptsUsed);

    res.status(201).json({
      success: true,
      message: passed ? "🎉 Congratulations! You passed the exam!" : `Exam submitted. You have ${attemptsLeft} attempt(s) remaining.`,
      data: {
        attemptId: attempt._id,
        score: totalScore,
        totalMarks: exam.totalMarks,
        passingMarks,
        passed,
        status: passed ? "PASS" : "FAIL",
        attemptNumber: attemptsUsed,
        attemptsLeft,
        totalAttemptsAllowed: maxAttempts,
        submittedAt: attempt.createdAt,
        exam: { title: exam.title, duration: exam.duration },
        // ✅ NEW: Include cooldown info for failed attempts
        cooldownInfo: !passed ? {
          hasCooldown: true,
          hoursRemaining: 24,
          nextAttemptTime: new Date(Date.now() + (24 * 60 * 60 * 1000))
        } : null
      }
    });

  } catch (error) {
    console.error("❌ Submit Attempt Error:", error);
    res.status(500).json({ success: false, message: "Server error while submitting attempt", error: error.message });
  }
};

// ------------------ GET ATTEMPTS BY USER ------------------
export const getAttemptsByUser = async (req, res) => {
  try {
    const attempts = await Attempt.find({ userId: req.params.userId })
      .populate("exam", "title totalMarks passingMarks duration")
      .sort({ createdAt: -1 });
    res.json({ success: true, attempts });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ------------------ GET ATTEMPTS BY EXAM ------------------
export const getAttemptsByExam = async (req, res) => {
  try {
    const attempts = await Attempt.find({ exam: req.params.examId })
      .populate("userId", "name email")
      .populate("exam", "title totalMarks passingMarks")
      .sort({ createdAt: -1 });
    res.json({ success: true, attempts });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ------------------ GET EXAM STATUS ------------------
export const getExamStatus = async (req, res) => {
  try {
    const { studentId, examId } = req.params;

    const [exam, attempts] = await Promise.all([
      Exam.findById(examId),
      Attempt.find({ userId: studentId, exam: examId }).sort({ createdAt: -1 })
    ]);

    if (!exam) return res.status(404).json({ success: false, message: "Exam not found" });

    const maxAttempts = exam.maxAttempts || 3;
    
    // ✅ Use the same passing marks calculation as submitAttempt
    const passingMarks = exam.passingMarks !== undefined && exam.passingMarks !== null
      ? Math.min(exam.passingMarks, exam.totalMarks || 0)
      : Math.ceil((exam.totalMarks || 0) * 0.5);
      
    const passedAttempt = attempts.find(a => a.passed);
    const attemptsUsed = attempts.length;
    
    // ✅ NEW: Calculate cooldown time
    let canAttempt = !passedAttempt && attemptsUsed < maxAttempts;
    let cooldownRemaining = null;
    let nextAttemptTime = null;
    let hasCooldown = false;
    
    if (attempts.length > 0) {
      const lastAttempt = attempts[0];
      if (!lastAttempt.passed) {
        const now = new Date();
        const lastAttemptTime = new Date(lastAttempt.createdAt);
        const hoursSinceLastAttempt = (now - lastAttemptTime) / (1000 * 60 * 60);
        
        if (hoursSinceLastAttempt < 24) {
          canAttempt = false;
          hasCooldown = true;
          cooldownRemaining = Math.ceil(24 - hoursSinceLastAttempt);
          nextAttemptTime = new Date(lastAttemptTime.getTime() + (24 * 60 * 60 * 1000));
        }
      }
    }

    res.json({
      success: true,
      data: {
        canAttempt,
        passed: !!passedAttempt,
        attemptsUsed,
        attemptsLeft: passedAttempt ? 0 : Math.max(0, maxAttempts - attemptsUsed),
        totalAttemptsAllowed: maxAttempts,
        attempts: attempts.map(a => ({
          attemptNumber: a.attemptNumber,
          score: a.score,
          passed: a.passed,
          submittedAt: a.createdAt
        })),
        passingMarks,
        // ✅ NEW: Cooldown information
        cooldownInfo: {
          hasCooldown,
          hoursRemaining: cooldownRemaining,
          nextAttemptTime: nextAttemptTime,
          lastAttemptTime: attempts.length > 0 ? attempts[0].createdAt : null
        }
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};