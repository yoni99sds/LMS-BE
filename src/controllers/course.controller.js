import courseService from '../services/course.service.js';
import catchAsync from '../utils/catchAsync.js';

export const courseController = {
  getCourses: catchAsync(async (req, res) => {
    const { page, limit, sort, search, category, status, difficulty } = req.query;

    const filter = {};
    if (category) filter.category = category;
    if (status) filter.status = status;
    if (difficulty) filter.difficulty = difficulty;

    // Students should only see published courses
    if (req.user && req.user.role === 'Student') {
      filter.status = 'Published';
    }

    const result = await courseService.getCourses({
      filter,
      page,
      limit,
      sort,
      searchQuery: search
    });

    res.status(200).json({
      status: 'success',
      pagination: result.pagination,
      data: { courses: result.data }
    });
  }),

  getCourse: catchAsync(async (req, res) => {
    // If request query contains `lessons=true`, populate lesson outline
    const populateLessons = req.query.lessons === 'true';
    const course = await courseService.getCourseById(req.params.id, populateLessons);

    res.status(200).json({
      status: 'success',
      data: { course }
    });
  }),

  createCourse: catchAsync(async (req, res) => {
    const course = await courseService.createCourse(req.body, req.user._id);

    res.status(201).json({
      status: 'success',
      data: { course }
    });
  }),

  updateCourse: catchAsync(async (req, res) => {
    const course = await courseService.updateCourse(
      req.params.id,
      req.body,
      req.user._id,
      req.user.role
    );

    res.status(200).json({
      status: 'success',
      data: { course }
    });
  }),

  deleteCourse: catchAsync(async (req, res) => {
    const result = await courseService.deleteCourse(
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

export default courseController;
