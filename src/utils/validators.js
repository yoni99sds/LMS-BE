import { body, param } from 'express-validator';

// ================= AUTH =================
export const signUpValidator = [
  body('firstName')
    .trim()
    .notEmpty().withMessage('First name is required')
    .isLength({ max: 50 }),

  body('lastName')
    .trim()
    .notEmpty().withMessage('Last name is required')
    .isLength({ max: 50 }),

  body('email')
    .isEmail().normalizeEmail(),

  body('password')
    .isLength({ min: 6 }),

  body('role')
    .optional()
    .isIn(['Admin', 'Instructor', 'Student']),
];

export const loginValidator = [
  body('email').isEmail().normalizeEmail(),
  body('password').notEmpty(),
];

// OTP (CLEAN VERSION - NO tempToken)
export const mfaValidator = [
  body('email').isEmail().normalizeEmail(),
  body('otp').isLength({ min: 6, max: 6 }),
];

export const resetPasswordRequestValidator = [
  body('email').isEmail().normalizeEmail(),
];

export const resetPasswordValidator = [
  param('token').notEmpty(),
  body('password').isLength({ min: 6 }),
];

// ================= COURSE =================
export const courseValidator = [
  body('title').notEmpty(),
  body('description').notEmpty(),
  body('category').notEmpty(),
  body('difficulty').optional().isIn(['Beginner', 'Intermediate', 'Advanced']),
  body('price').optional().isFloat({ min: 0 }),
];

// ================= LESSON (FIX FOR YOUR CRASH) =================
export const lessonValidator = [
  body('courseId')
    .isMongoId().withMessage('Must be a valid Course ID'),

  body('title')
    .notEmpty().withMessage('Lesson title is required')
    .isLength({ max: 100 }),

  body('contentType')
    .isIn(['Video', 'PDF', 'SCORM 1.2', 'SCORM 2004', 'xAPI', 'Text']),

  body('duration')
    .optional()
    .isInt({ min: 0 }),
];

// ================= QUIZ =================
export const quizValidator = [
  body('courseId').isMongoId(),
  body('title').notEmpty(),
  body('passingScore').optional().isInt({ min: 0, max: 100 }),

  body('questions')
    .isArray({ min: 1 }),

  body('questions.*.questionText')
    .notEmpty(),

  body('questions.*.questionType')
    .isIn(['MultipleChoice', 'TrueFalse', 'ShortAnswer']),

  body('questions.*.correctAnswer')
    .notEmpty(),
];

// ================= QUIZ SUBMIT =================
export const submitQuizValidator = [
  body('answers').isArray(),
  body('answers.*.questionId').isMongoId(),
  body('answers.*.givenAnswer').notEmpty(),
];

// ================= ENROLLMENT =================
export const enrollmentValidator = [
  body('courseId').isMongoId(),
];

// ================= COMPLETE LESSON =================
export const completeLessonValidator = [
  body('courseId').isMongoId(),
  body('lessonId').isMongoId(),
];

// ================= SCORM =================
export const scormCommitValidator = [
  body('courseId').isMongoId(),
  body('lessonId').isMongoId(),
  body('scormVersion').isIn(['1.2', '2004']),
  body('cmiData').isObject(),
];