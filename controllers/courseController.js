// import Course from "../models/Course.js";

// /* ===============================
//    CREATE COURSE (ADMIN ONLY)
// ================================ */
// export const createCourse = async (req, res) => {
//   try {
//     const {
//       title,
//       description,
//       duration,
//       category,
//       subCategories,
//       level,
//       price,
//       status,
//     } = req.body;

//     if (!title || !description) {
//       return res.status(400).json({
//         message: "Title and description are required",
//       });
//     }

//     const course = await Course.create({
//       title,
//       description,
//       duration,
//       category,
//       subCategories: subCategories ? JSON.parse(subCategories) : [],
//       level,
//       price,
//       status,
//       thumbnail: req.file ? req.file.path : null,
//     });

//     res.status(201).json({
//       success: true,
//       message: "Course created successfully",
//       course,
//     });
//   } catch (error) {
//     res.status(500).json({
//       success: false,
//       message: error.message,
//     });
//   }
// };

// /* ===============================
//    GET ALL COURSES (ADMIN + STUDENT)
// ================================ */
// export const getAllCourses = async (req, res) => {
//   try {
//     const courses = await Course.find().sort({ createdAt: -1 });

//     res.status(200).json({
//       success: true,
//       count: courses.length,
//       courses,
//     });
//   } catch (error) {
//     res.status(500).json({
//       success: false,
//       message: error.message,
//     });
//   }
// };

// /* ===============================
//    GET SINGLE COURSE (ADMIN + STUDENT)
// ================================ */
// export const getCourse = async (req, res) => {
//   try {
//     const course = await Course.findById(req.params.id);

//     if (!course) {
//       return res.status(404).json({
//         success: false,
//         message: "Course not found",
//       });
//     }

//     res.status(200).json({
//       success: true,
//       course,
//     });
//   } catch (error) {
//     res.status(500).json({
//       success: false,
//       message: error.message,
//     });
//   }
// };

// /* ===============================
//    UPDATE COURSE (ADMIN ONLY)
// ================================ */
// export const updateCourse = async (req, res) => {
//   try {
//     const updatedData = { ...req.body };

//     if (req.file) {
//       updatedData.thumbnail = req.file.path;
//     }

//      // subCategories handle 
//     if (updatedData.subCategories) {
//       updatedData.subCategories = JSON.parse(updatedData.subCategories);
//     }

//     const course = await Course.findByIdAndUpdate(
//       req.params.id,
//       updatedData,
//       { new: true }
//     );

//     if (!course) {
//       return res.status(404).json({
//         success: false,
//         message: "Course not found",
//       });
//     }

//     res.status(200).json({
//       success: true,
//       message: "Course updated successfully",
//       course,
//     });
//   } catch (error) {
//     res.status(500).json({
//       success: false,
//       message: error.message,
//     });
//   }
// };

// /* ===============================
//    DELETE COURSE (ADMIN ONLY)
// ================================ */
// export const deleteCourse = async (req, res) => {
//   try {
//     const course = await Course.findById(req.params.id);

//     if (!course) {
//       return res.status(404).json({
//         success: false,
//         message: "Course not found",
//       });
//     }

//     await course.deleteOne();

//     res.status(200).json({
//       success: true,
//       message: "Course deleted successfully",
//     });
//   } catch (error) {
//     res.status(500).json({
//       success: false,
//       message: error.message,
//     });
//   }
// };

// /* ===============================
//    ENROLL STUDENT (STUDENT ONLY)
// ================================ */
// export const enrollStudent = async (req, res) => {
//   try {
//     const course = await Course.findById(req.params.courseId);

//     if (!course) {
//       return res.status(404).json({
//         success: false,
//         message: "Course not found",
//       });
//     }

//     // user ID token se aayega
//     const studentId = req.user._id;

//     if (course.studentsEnrolled.includes(studentId)) {
//       return res.status(400).json({
//         success: false,
//         message: "Already enrolled in this course",
//       });
//     }

//     course.studentsEnrolled.push(studentId);
//     await course.save();

//     res.status(200).json({
//       success: true,
//       message: "Enrolled successfully",
//     });
//   } catch (error) {
//     res.status(500).json({
//       success: false,
//       message: error.message,
//     });
//   }
// };
import Course from "../models/Course.js";

/* ===============================
   CREATE COURSE (ADMIN ONLY)
================================ */
export const createCourse = async (req, res) => {
  try {
    const {
      title,
      description,
      duration,
      category,
      subCategories,
      level,
      price,
      status,
    } = req.body;

    if (!title || !description) {
      return res.status(400).json({
        message: "Title and description are required",
      });
    }

    // Ensure subCategories is always an array
    const parsedSubCategories =
      subCategories && typeof subCategories === "string"
        ? JSON.parse(subCategories)
        : Array.isArray(subCategories)
        ? subCategories
        : [];

    const course = await Course.create({
      title,
      description,
      duration,
      category,
      subCategories: parsedSubCategories,
      level,
      price,
      status,
      thumbnail: req.file ? req.file.path : null,
    });

    res.status(201).json({
      success: true,
      message: "Course created successfully",
      course,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/* ===============================
   GET ALL COURSES (ADMIN + STUDENT)
================================ */
export const getAllCourses = async (req, res) => {
  try {
    const courses = await Course.find().sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: courses.length,
      courses,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/* ===============================
   GET SINGLE COURSE (ADMIN + STUDENT)
================================ */
export const getCourse = async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);

    if (!course) {
      return res.status(404).json({
        success: false,
        message: "Course not found",
      });
    }

    res.status(200).json({
      success: true,
      course,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/* ===============================
   UPDATE COURSE (ADMIN ONLY)
================================ */
export const updateCourse = async (req, res) => {
  try {
    const updatedData = { ...req.body };

    // Update thumbnail if provided
    if (req.file) {
      updatedData.thumbnail = req.file.path;
    }

    // Parse subCategories properly
    if (updatedData.subCategories) {
      updatedData.subCategories =
        typeof updatedData.subCategories === "string"
          ? JSON.parse(updatedData.subCategories)
          : Array.isArray(updatedData.subCategories)
          ? updatedData.subCategories
          : [];
    }

    const course = await Course.findByIdAndUpdate(
      req.params.id,
      updatedData,
      { new: true }
    );

    if (!course) {
      return res.status(404).json({
        success: false,
        message: "Course not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Course updated successfully",
      course,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/* ===============================
   DELETE COURSE (ADMIN ONLY)
================================ */
export const deleteCourse = async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);

    if (!course) {
      return res.status(404).json({
        success: false,
        message: "Course not found",
      });
    }

    await course.deleteOne();

    res.status(200).json({
      success: true,
      message: "Course deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/* ===============================
   ENROLL STUDENT (STUDENT ONLY)
================================ */
export const enrollStudent = async (req, res) => {
  try {
    const course = await Course.findById(req.params.courseId);

    if (!course) {
      return res.status(404).json({
        success: false,
        message: "Course not found",
      });
    }

    const studentId = req.user._id;

    if (course.studentsEnrolled.includes(studentId)) {
      return res.status(400).json({
        success: false,
        message: "Already enrolled in this course",
      });
    }

    course.studentsEnrolled.push(studentId);
    await course.save();

    res.status(200).json({
      success: true,
      message: "Enrolled successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
