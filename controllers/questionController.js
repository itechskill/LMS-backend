import Question from "../models/Question.js";

export const createQuestion = async (req, res) => {
  try {
    const question = await Question.create(req.body);
    res.status(201).json(question);
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};

export const getQuestionsByExam = async (req, res) => {
  try {
    const questions = await Question.find({ exam: req.params.examId });
    res.json(questions);
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};

export const updateQuestion = async (req, res) => {
  try {
    const question = await Question.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(question);
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};

export const deleteQuestion = async (req, res) => {
  try {
    await Question.findByIdAndDelete(req.params.id);
    res.json({ message: "Question deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};