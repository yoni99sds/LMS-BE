import quizService from '../services/quiz.service.js';
import catchAsync from '../utils/catchAsync.js';

export const quizController = {
  createQuiz: catchAsync(async (req, res) => {
    const quiz = await quizService.createQuiz(
      req.body,
      req.user._id,
      req.user.role
    );

    res.status(201).json({
      status: 'success',
      data: { quiz }
    });
  }),

  getQuiz: catchAsync(async (req, res) => {
    const quiz = await quizService.getQuizById(req.params.id, req.user.role);
    res.status(200).json({
      status: 'success',
      data: { quiz }
    });
  }),

  getCourseQuizzes: catchAsync(async (req, res) => {
    const quizzes = await quizService.getQuizzesByCourse(req.params.courseId);
    res.status(200).json({
      status: 'success',
      results: quizzes.length,
      data: { quizzes }
    });
  }),

  submitAttempt: catchAsync(async (req, res) => {
    const result = await quizService.submitQuizAttempt(
      req.params.id,
      req.user._id,
      req.body.answers // Array of { questionId, givenAnswer }
    );

    res.status(200).json({
      status: 'success',
      data: result
    });
  })
};

export default quizController;
