import express from 'express';
import enrollmentController from '../../controllers/enrollment.controller.js';
import { protect } from '../../middlewares/auth.middleware.js';
import validateRequest from '../../middlewares/validator.middleware.js';
import { enrollmentValidator, completeLessonValidator } from '../../utils/validators.js';

const router = express.Router();

router.use(protect);

router.post('/enroll', enrollmentValidator, validateRequest, enrollmentController.enroll);
router.post('/complete-lesson', completeLessonValidator, validateRequest, enrollmentController.completeLesson);
router.get('/course/:courseId/progress', enrollmentController.getProgress);

export default router;
