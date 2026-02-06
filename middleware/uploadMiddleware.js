// import multer from "multer";
// import path from "path";
// import fs from "fs";

// // ===============================
// // CREATE UPLOADS FOLDER
// // ===============================
// const uploadDir = "uploads";
// if (!fs.existsSync(uploadDir)) {
//   fs.mkdirSync(uploadDir, { recursive: true });
// }

// // ===============================
// // STORAGE CONFIG
// // ===============================
// const storage = multer.diskStorage({
//   destination: (req, file, cb) => {
//     cb(null, uploadDir);
//   },
//   filename: (req, file, cb) => {
//     const uniqueName =
//       Date.now() + "-" + Math.round(Math.random() * 1e9);
//     cb(null, uniqueName + path.extname(file.originalname));
//   },
// });

// // ===============================
// // FILE FILTER (FIXED & FLEXIBLE)
// // ===============================
// const allowedTypes = [
//   // Images
//   "image/jpeg",
//   "image/png",

//   // Videos (ALL COMMON TYPES)
//   "video/mp4",
//   "video/mpeg",
//   "video/webm",
//   "video/quicktime",
//   "video/x-matroska",
//   "application/octet-stream",

//   // Documents
//   "application/pdf",
//   "application/msword",
//   "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
//   "application/vnd.ms-excel",
//   "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
//   "application/vnd.ms-powerpoint",
//   "application/vnd.openxmlformats-officedocument.presentationml.presentation",
//   "text/csv",
// ];

// const fileFilter = (req, file, cb) => {
//   if (allowedTypes.includes(file.mimetype)) {
//     cb(null, true);
//   } else {
//     console.warn("⚠️ Unknown mimetype allowed:", file.mimetype);
//     cb(null, true); // allow but log (prevents silent failure)
//   }
// };

// // ===============================
// // MULTER INSTANCE
// // ===============================
// const upload = multer({
//   storage,
//   fileFilter,
//   limits: {
//     fileSize: 500 * 1024 * 1024, // 500MB
//   },
// });

// export default upload;









import multer from "multer";
import path from "path";
import fs from "fs";

// Create uploads folder if not exists
const uploadDir = "uploads";
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

// Storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => {
    const uniqueName = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, uniqueName + path.extname(file.originalname));
  },
});

// File filter
const allowedTypes = [
  "image/jpeg", "image/png",
  "video/mp4", "video/mkv", "video/webm",
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/vnd.ms-excel",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  "application/vnd.ms-powerpoint",
  "application/vnd.openxmlformats-officedocument.presentationml.presentation",
  "text/csv",
];

const fileFilter = (req, file, cb) => {
  allowedTypes.includes(file.mimetype)
    ? cb(null, true)
    : cb(new Error(`Unsupported file type: ${file.mimetype}`), false);
};

// Multer upload
const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 200 * 1024 * 1024 }, // 200MB
});

export default upload;
