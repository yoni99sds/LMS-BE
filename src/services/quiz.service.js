import { quizRepository, quizAttemptRepository } from '../repositories/quiz.repository.js';
import courseRepository from '../repositories/course.repository.js';
import AppError from '../utils/AppError.js';

export const quizService = {
  createQuiz: async (quizData, instructorId, role) => {
    const course = await courseRepository.findById(quizData.courseId);
    if (!course) {
      throw new AppError('Course not found', 404);
    }

    if (role !== 'Admin' && course.instructorId.toString() !== instructorId.toString()) {
      throw new AppError('You do not have permission to add quizzes to this course', 403);
    }

    return await quizRepository.create(quizData);
  },

  getQuizById: async (id, userRole) => {
    let quiz;
    if (userRole === 'Student') {
      // Students should not receive the correct answers
      quiz = await quizRepository.findById(id);
    } else {
      // Instructors and Admins can see correct answers
      quiz = await quizRepository.findWithCorrectAnswers(id);
    }

    if (!quiz) {
      throw new AppError('Quiz not found', 404);
    }
    return quiz;
  },

  getQuizzesByCourse: async (courseId) => {
    return await quizRepository.find({ courseId });
  },

  submitQuizAttempt: async (quizId, studentId, studentAnswers) => {
    // 1) Fetch quiz including correct answers
    const quiz = await quizRepository.findWithCorrectAnswers(quizId);
    if (!quiz) {
      throw new AppError('Quiz not found', 404);
    }

    // 2) Check attempt limits
    const currentAttemptCount = await quizAttemptRepository.getAttemptsCount(quizId, studentId);
    if (quiz.maxAttempts > 0 && currentAttemptCount >= quiz.maxAttempts) {
      throw new AppError(`Maximum quiz attempts (${quiz.maxAttempts}) reached for this quiz`, 400);
    }

    // 3) Grade the quiz
    let correctCount = 0;
    let totalPoints = 0;
    let earnedPoints = 0;

    const gradedAnswers = quiz.questions.map((question) => {
      const studentAnswerObj = studentAnswers.find(
        (ans) => ans.questionId.toString() === question._id.toString()
      );
      const givenAnswer = studentAnswerObj ? studentAnswerObj.givenAnswer : '';
      
      const isCorrect = givenAnswer.trim().toLowerCase() === question.correctAnswer.trim().toLowerCase();
      
      totalPoints += question.points;
      if (isCorrect) {
        correctCount += 1;
        earnedPoints += question.points;
      }

      return {
        questionId: question._id,
        givenAnswer,
        isCorrect,
        correctAnswer: question.correctAnswer // visible on submission result
      };
    });

    const scorePercentage = totalPoints > 0 ? Math.round((earnedPoints / totalPoints) * 100) : 0;
    const passed = scorePercentage >= quiz.passingScore;

    // 4) Save attempt
    const attempt = await quizAttemptRepository.create({
      quizId,
      studentId,
      answers: gradedAnswers,
      score: scorePercentage,
      passed,
      attemptNumber: currentAttemptCount + 1
    });

    return {
      attemptId: attempt._id,
      score: scorePercentage,
      passed,
      attemptNumber: attempt.attemptNumber,
      correctCount,
      totalQuestions: quiz.questions.length,
      gradedAnswers
    };
  }
};

export default quizService;
