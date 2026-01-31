import mongoose from "mongoose";

const lectureSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },

    description: {
      type: String,
      required: true,
    },

    course: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Course",
      required: true,
    },
    subCategory: { type: String, required: true, trim: true },   //new
    lectureNumber: {
      type: Number,
      default: 1,
    },

    type: {
      type: String,
      enum: ["video", "pdf", "document", "excel", "ppt", "quiz", "link"],
      required: true,
    },

    /* =========================
       FILE PATHS
    ========================= */
    videoPath: { type: String, default: "" },
    pdfPath: { type: String, default: "" },
    documentPath: { type: String, default: "" },
    excelPath: { type: String, default: "" },
    pptPath: { type: String, default: "" },

    /* =========================
       VIDEO / FILE URL
    ========================= */
    videoUrl: {
      type: String,
      default: "",
    },

    duration: {
      type: Number,
      default: 0,
    },

    isFreePreview: {
      type: Boolean,
      default: false,
    },
    priceRequired: { type: Number, default: 0 }, // new
    status: {
      type: String,
      enum: ["Active", "Inactive"],
      default: "Active",
    },

    isDeleted: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

export default mongoose.model("Lecture", lectureSchema);
