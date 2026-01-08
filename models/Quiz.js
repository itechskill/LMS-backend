import mongoose from "mongoose";

const quizSchema = new mongoose.Schema({
    course: { type: mongoose.Schema.Types.ObjectId, ref: "Course", required: true },
    title: { type: String, required: true },
    questions: [
        {
            question: String,
            options: [String],
            answer: String
        }
    ],
    createdAt: { type: Date, default: Date.now }
});

export default mongoose.model("Quiz", quizSchema);
