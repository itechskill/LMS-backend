// import mongoose from "mongoose";

// const courseSchema = new mongoose.Schema(
//   {
//     title: {
//       type: String,
//       required: true,
//       trim: true,
//     },
//     description: {
//       type: String,
//       required: true,
//     },
//     duration: {
//       type: Number,
//       default: 0,
//     },
//     studentsEnrolled: [
//       {
//         type: mongoose.Schema.Types.ObjectId,
//         ref: "User",
//       },
//     ],
//     thumbnail: {
//       type: String,
//     },
//     category: {
//       type: String,
//       enum: ["Programming", "Design", "AI", "Business", "Other"],
//       default: "Programming",
//     },
//     level: {
//       type: String,
//       enum: ["Beginner", "Intermediate", "Advanced"],
//       default: "Beginner",
//     },
//     price: {
//       type: Number,
//       default: 0,
//     },
//     totalLectures: {
//       type: Number,
//       default: 0,
//     },
//     status: {
//       type: String,
//       enum: ["Active", "Inactive"],
//       default: "Active",
//     },
//   },
//   { timestamps: true }
// );

// export default mongoose.model("Course", courseSchema);











import mongoose from "mongoose";

const courseSchema = new mongoose.Schema(
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
    duration: {
      type: Number,
      default: 0,
    },
    studentsEnrolled: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    thumbnail: {
      type: String,
    },
    category: {
      type: String,
      required: true,
      // default: [],
      trim: true,
    },
    subCategories: [
      {
        type: [String],
        default:[]
      },
    ],
    level: {
      type: String,
      enum: ["Beginner", "Intermediate", "Advanced"],
      default: "Beginner",
    },
    price: {
      type: Number,
      default: 0,
    },
    totalLectures: {
      type: Number,
      default: 0,
    },
    status: {
      type: String,
      enum: ["Active", "Inactive"],
      default: "Active",
    },
  },
  { timestamps: true }
);

export default mongoose.model("Course", courseSchema);
