import express from 'express';
import lessonController from '../../controllers/lesson.controller.js';
import { protect, restrictTo } from '../../middlewares/auth.middleware.js';
import validateRequest from '../../middlewares/validator.middleware.js';
import { upload } from '../../config/multer.js';
import { lessonValidator } from '../../utils/validators.js';

const router = express.Router();

router.use(protect);

// Get lessons for a course (available to all enrolled/authorized)
router.get('/course/:courseId', lessonController.getLessonsByCourse);

router.route('/')
  .post(
    restrictTo('Admin', 'Instructor'),
    upload.single('file'), // Handle optional file upload for SCORM/PDF/Video
    lessonValidator,
    validateRequest,
    lessonController.createLesson
  );

router.route('/:id')
  .get(lessonController.getLesson)
  .put(
    restrictTo('Admin', 'Instructor'),
    upload.single('file'),
    lessonController.updateLesson
  )
  .delete(
    restrictTo('Admin', 'Instructor'),
    lessonController.deleteLesson
  );

export default router;
