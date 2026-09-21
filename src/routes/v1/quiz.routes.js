import express from 'express';
import quizController from '../../controllers/quiz.controller.js';
import { protect, restrictTo } from '../../middlewares/auth.middleware.js';
import validateRequest from '../../middlewares/validator.middleware.js';
import { quizValidator, submitQuizValidator } from '../../utils/validators.js';

const router = express.Router();

router.use(protect);

router.route('/')
  .post(restrictTo('Admin', 'Instructor'), quizValidator, validateRequest, quizController.createQuiz);

router.get('/course/:courseId', quizController.getCourseQuizzes);

router.route('/:id')
  .get(quizController.getQuiz);

router.post('/:id/submit', submitQuizValidator, validateRequest, quizController.submitAttempt);

export default router;
