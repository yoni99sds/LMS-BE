import express from 'express';
import courseController from '../../controllers/course.controller.js';
import { protect, restrictTo } from '../../middlewares/auth.middleware.js';
import validateRequest from '../../middlewares/validator.middleware.js';
import { courseValidator } from '../../utils/validators.js';

const router = express.Router();

// Allow catalog checking (GET routes) without strict auth or optional auth
// For pagination/search, let's protect it so we know student context, but keep it flexible
router.use(protect);

router.route('/')
  .get(courseController.getCourses)
  .post(restrictTo('Admin', 'Instructor'), courseValidator, validateRequest, courseController.createCourse);

router.route('/:id')
  .get(courseController.getCourse)
  .put(restrictTo('Admin', 'Instructor'), courseController.updateCourse)
  .delete(restrictTo('Admin', 'Instructor'), courseController.deleteCourse);

export default router;
