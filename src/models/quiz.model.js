import mongoose from 'mongoose';

const questionSchema = new mongoose.Schema({
  questionText: {
    type: String,
    required: [true, 'Question text is required']
  },
  questionType: {
    type: String,
    enum: ['MultipleChoice', 'TrueFalse', 'ShortAnswer'],
    required: [true, 'Question type is required']
  },
  options: [
    {
      type: String
    }
  ],
  correctAnswer: {
    type: String,
    required: [true, 'Correct answer is required'],
    select: false // Hide correct answer from students during API calls
  },
  points: {
    type: Number,
    default: 1
  }
});

const quizSchema = new mongoose.Schema(
  {
    courseId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Course',
      required: [true, 'Course reference is required'],
      index: true
    },
    lessonId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Lesson',
      index: true
    },
    title: {
      type: String,
      required: [true, 'Quiz title is required'],
      trim: true
    },
    description: {
      type: String
    },
    questions: [questionSchema],
    passingScore: {
      type: Number, // Percentage (e.g. 70)
      default: 70,
      min: 0,
      max: 100
    },
    timeLimit: {
      type: Number, // in minutes (0 means unlimited)
      default: 0
    },
    maxAttempts: {
      type: Number,
      default: 3
    }
  },
  {
    timestamps: true
  }
);

const quizAttemptSchema = new mongoose.Schema(
  {
    quizId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Quiz',
      required: true,
      index: true
    },
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },
    answers: [
      {
        questionId: mongoose.Schema.Types.ObjectId,
        givenAnswer: String
      }
    ],
    score: {
      type: Number,
      required: true
    },
    passed: {
      type: Boolean,
      required: true
    },
    attemptNumber: {
      type: Number,
      default: 1
    },
    completedAt: {
      type: Date,
      default: Date.now
    }
  },
  {
    timestamps: true
  }
);

quizAttemptSchema.index({ quizId: 1, studentId: 1, attemptNumber: 1 }, { unique: true });

export const Quiz = mongoose.model('Quiz', quizSchema);
export const QuizAttempt = mongoose.model('QuizAttempt', quizAttemptSchema);
