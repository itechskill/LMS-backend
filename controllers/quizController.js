import Quiz from "../models/Quiz.js";

// Add Quiz
export const addQuiz = async (req, res) => {
    try {
        const quiz = new Quiz(req.body);
        await quiz.save();
        res.status(201).json(quiz);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// Update Quiz
export const updateQuiz = async (req, res) => {
    try {
        const quiz = await Quiz.findByIdAndUpdate(req.params.id, req.body, { new: true });
        res.status(200).json(quiz);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// Delete Quiz
export const deleteQuiz = async (req, res) => {
    try {
        await Quiz.findByIdAndDelete(req.params.id);
        res.status(200).json({ message: "Quiz deleted" });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// Submit Quiz (Student)
export const submitQuiz = async (req, res) => {
    try {
        const { studentId, quizId, answers } = req.body;
        const quiz = await Quiz.findById(quizId);

        let score = 0;
        quiz.questions.forEach((q, i) => {
            if(q.answer === answers[i]) score++;
        });

        res.status(200).json({ student: studentId, quiz: quizId, score });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};
