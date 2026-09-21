import lessonService from '../services/lesson.service.js';
import catchAsync from '../utils/catchAsync.js';

export const lessonController = {
  getLessonsByCourse: catchAsync(async (req, res) => {
    const lessons = await lessonService.getLessonsByCourse(req.params.courseId);
    res.status(200).json({
      status: 'success',
      results: lessons.length,
      data: { lessons }
    });
  }),

  getLesson: catchAsync(async (req, res) => {
    const lesson = await lessonService.getLessonById(req.params.id);
    res.status(200).json({
      status: 'success',
      data: { lesson }
    });
  }),

  createLesson: catchAsync(async (req, res) => {
    // If a file is uploaded, map to contentUrl
    const lessonData = { ...req.body };
    if (req.file) {
      lessonData.contentUrl = `/uploads/lessons/${req.file.filename}`;
    }

    const lesson = await lessonService.createLesson(
      lessonData,
      req.user._id,
      req.user.role
    );

    res.status(201).json({
      status: 'success',
      data: { lesson }
    });
  }),

  updateLesson: catchAsync(async (req, res) => {
    const updateData = { ...req.body };
    if (req.file) {
      updateData.contentUrl = `/uploads/lessons/${req.file.filename}`;
    }

    const lesson = await lessonService.updateLesson(
      req.params.id,
      updateData,
      req.user._id,
      req.user.role
    );

    res.status(200).json({
      status: 'success',
      data: { lesson }
    });
  }),

  deleteLesson: catchAsync(async (req, res) => {
    const result = await lessonService.deleteLesson(
      req.params.id,
      req.user._id,
      req.user.role
    );

    res.status(200).json({
      status: 'success',
      message: result.message
    });
  })
};

export default lessonController;
