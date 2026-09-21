import lessonRepository from '../repositories/lesson.repository.js';
import courseRepository from '../repositories/course.repository.js';
import AppError from '../utils/AppError.js';

export const lessonService = {
  getLessonsByCourse: async (courseId) => {
    return await lessonRepository.findByCourseId(courseId);
  },

  getLessonById: async (id) => {
    const lesson = await lessonRepository.findById(id);
    if (!lesson) {
      throw new AppError('Lesson not found', 404);
    }
    return lesson;
  },

  createLesson: async (lessonData, instructorId, role) => {
    const course = await courseRepository.findById(lessonData.courseId);
    if (!course) {
      throw new AppError('Course not found', 404);
    }

    // Check permissions
    if (role !== 'Admin' && course.instructorId.toString() !== instructorId.toString()) {
      throw new AppError('You do not have permission to add lessons to this course', 403);
    }

    // Auto-calculate order if not provided
    if (lessonData.order === undefined) {
      lessonData.order = await lessonRepository.getNextLessonOrder(lessonData.courseId);
    }

    return await lessonRepository.create(lessonData);
  },

  updateLesson: async (id, updateData, instructorId, role) => {
    const lesson = await lessonRepository.findById(id);
    if (!lesson) {
      throw new AppError('Lesson not found', 404);
    }

    const course = await courseRepository.findById(lesson.courseId);
    if (role !== 'Admin' && course.instructorId.toString() !== instructorId.toString()) {
      throw new AppError('You do not have permission to modify this lesson', 403);
    }

    return await lessonRepository.update(id, updateData);
  },

  deleteLesson: async (id, instructorId, role) => {
    const lesson = await lessonRepository.findById(id);
    if (!lesson) {
      throw new AppError('Lesson not found', 404);
    }

    const course = await courseRepository.findById(lesson.courseId);
    if (role !== 'Admin' && course.instructorId.toString() !== instructorId.toString()) {
      throw new AppError('You do not have permission to delete this lesson', 403);
    }

    await lessonRepository.delete(id);
    return { message: 'Lesson deleted successfully' };
  }
};

export default lessonService;
