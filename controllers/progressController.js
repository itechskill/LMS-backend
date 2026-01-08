import Progress from "../models/Progress.js";
import Course from "../models/Course.js";

// Track Lecture Completion
export const trackLecture = async (req, res) => {
    try {
        const { studentId, courseId, lectureId } = req.body;

        let progress = await Progress.findOne({ student: studentId, course: courseId });
        if(!progress){
            progress = new Progress({ student: studentId, course: courseId, completedLectures: [lectureId] });
        } else {
            if(!progress.completedLectures.includes(lectureId)){
                progress.completedLectures.push(lectureId);
            }
        }

        await progress.save();
        res.status(200).json(progress);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};



export const getProgress = async (req, res) => {
  try {
    const progress = await Progress.findOne({
      student: req.params.studentId,
      course: req.params.courseId,
    })
      .populate("course", "title duration")
      .populate("completedLectures", "title lectureNumber");

    if (!progress) {
      return res.status(200).json({ message: "No progress found", progress: null });
    }

    const totalCompleted = progress.completedLectures.length;

    res.status(200).json({
      progress,
      totalCompleted,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
