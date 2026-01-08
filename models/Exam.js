import mongoose from "mongoose";

const examSchema = new mongoose.Schema(
  {
    title: { 
      type: String, 
      required: true 
    },
    description: { 
      type: String 
    },
    duration: { 
      type: Number, 
      required: true   // minutes
    },
    totalMarks: { 
      type: Number, 
      required: true,
      min: [0, "Total marks cannot be negative"]
    },
    passingMarks: {
      type: Number,
      required: true,
      min: [0, "Passing marks cannot be negative"],
      validate: {
        validator: function(value) {
          // Agar totalMarks undefined ho to 0 consider karo
          const maxMarks = this.totalMarks || 0;
          return value <= maxMarks;
        },
        message: "Passing marks cannot exceed total marks"
      }
    },
    maxAttempts: { // optional, default 3
      type: Number,
      default: 3,
      min: [1, "Max attempts must be at least 1"]
    },
    questions: [
      { type: mongoose.Schema.Types.ObjectId, ref: "Question" }
    ],
    createdBy: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: "User" 
    },
  },
  { timestamps: true }
);

// Compound index for user-exam lookups
examSchema.index({ createdBy: 1, createdAt: -1 });

export default mongoose.model("Exam", examSchema);
