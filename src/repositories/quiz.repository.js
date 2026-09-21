import { Quiz, QuizAttempt } from '../models/quiz.model.js';
import { BaseRepository } from './base.repository.js';

class QuizRepository extends BaseRepository {
  constructor() {
    super(Quiz);
  }

  async findWithCorrectAnswers(id) {
    // Allows services to query correct answers for grading
    return await this.model.findById(id).select('+questions.correctAnswer').exec();
  }
}

class QuizAttemptRepository extends BaseRepository {
  constructor() {
    super(QuizAttempt);
  }

  async getAttemptsCount(quizId, studentId) {
    return await this.model.countDocuments({ quizId, studentId }).exec();
  }

  async getBestAttempt(quizId, studentId) {
    return await this.model.findOne({ quizId, studentId }).sort('-score').exec();
  }
}

export const quizRepository = new QuizRepository();
export const quizAttemptRepository = new QuizAttemptRepository();
