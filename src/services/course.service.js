import courseRepository from '../repositories/course.repository.js';
import AppError from '../utils/AppError.js';

export const courseService = {
  getCourses: async (queryOptions) => {
    // Supports filter (e.g. status, category, difficulty), sorting, pagination, and search (title, description)
    return await courseRepository.findWithPaginationAndFilter({
      ...queryOptions,
      searchFields: ['title', 'description', 'category']
    });
  },

  getCourseById: async (id, populateLessons = false) => {
    const course = populateLessons 
      ? await courseRepository.findWithLessons(id)
      : await courseRepository.findById(id);

    if (!course) {
      throw new AppError('Course not found', 404);
    }
    return course;
  },

  createCourse: async (courseData, instructorId) => {
    return await courseRepository.create({
      ...courseData,
      instructorId
    });
  },

  updateCourse: async (id, updateData, instructorId, role) => {
    const course = await courseRepository.findById(id);
    if (!course) {
      throw new AppError('Course not found', 404);
    }

    // Authorization check: only Admin or the Course Instructor can modify it
    if (role !== 'Admin' && course.instructorId.toString() !== instructorId.toString()) {
      throw new AppError('You do not have permission to modify this course', 403);
    }

    return await courseRepository.update(id, updateData);
  },

  deleteCourse: async (id, instructorId, role) => {
    const course = await courseRepository.findById(id);
    if (!course) {
      throw new AppError('Course not found', 404);
    }

    // Authorization check
    if (role !== 'Admin' && course.instructorId.toString() !== instructorId.toString()) {
      throw new AppError('You do not have permission to delete this course', 403);
    }

    await courseRepository.delete(id);
    return { message: 'Course deleted successfully' };
  }
};

export default courseService;
