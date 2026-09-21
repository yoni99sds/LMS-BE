import enrollmentService from '../services/enrollment.service.js';
import catchAsync from '../utils/catchAsync.js';

export const enrollmentController = {
  enroll: catchAsync(async (req, res) => {
    // A student can enroll themselves, or an Admin can enroll a student
    const studentId = req.user.role === 'Student' ? req.user._id : req.body.studentId;
    const { courseId, classId } = req.body;

    const enrollment = await enrollmentService.enrollStudent(studentId, courseId, classId);

    res.status(201).json({
      status: 'success',
      data: { enrollment }
    });
  }),

  completeLesson: catchAsync(async (req, res) => {
    const studentId = req.user._id;
    const { courseId, lessonId } = req.body;

    const enrollment = await enrollmentService.completeLesson(studentId, courseId, lessonId);

    res.status(200).json({
      status: 'success',
      message: 'Lesson completed successfully',
      data: {
        progressPercent: enrollment.progressPercent,
        status: enrollment.status
      }
    });
  }),

  getProgress: catchAsync(async (req, res) => {
    const studentId = req.query.studentId || req.user._id;
    const { courseId } = req.params;

    const enrollment = await enrollmentService.getEnrollmentProgress(studentId, courseId);

    res.status(200).json({
      status: 'success',
      data: { enrollment }
    });
  })
};

export default enrollmentController;
