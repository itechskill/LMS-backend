import mongoose from "mongoose";

const enrollmentSchema = new mongoose.Schema(
  {
    student: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    course: { type: mongoose.Schema.Types.ObjectId, ref: "Course", required: true },
    enrolledAt: { type: Date, default: Date.now },
    endDate: { type: Date }, // optional course end date
  },
  {
    timestamps: true, // automatically adds createdAt and updatedAt
  }
);

export default mongoose.model("Enrollment", enrollmentSchema);
