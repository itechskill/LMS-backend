import mongoose from "mongoose";

const questionSchema = new mongoose.Schema(
  {
    exam: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Exam",
      required: true,
    },
    questionText: {
      type: String,
      required: true,
    },
    options: {
      type: [String],
      required: true,
      validate: {
        validator: function(v) {
          return v && v.length >= 2; // At least 2 options
        },
        message: 'A question must have at least 2 options'
      }
    },
    correctAnswer: {
      type: String,
      required: true,
      validate: {
        validator: function(v) {
          // Ensure correctAnswer is one of the options
          return this.options && this.options.includes(v);
        },
        message: 'Correct answer must be one of the options'
      }
    },
    marks: {
      type: Number,
      default: 1,  // Default 1 mark per question
    },
  },
  { timestamps: true }
);

export default mongoose.model("Question", questionSchema);