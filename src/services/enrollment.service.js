import enrollmentRepository from '../repositories/enrollment.repository.js';
import lessonRepository from '../repositories/lesson.repository.js';
import courseRepository from '../repositories/course.repository.js';
import certificateService from './certificate.service.js'; // Will be created next
import AppError from '../utils/AppError.js';

export const enrollmentService = {
  enrollStudent: async (studentId, courseId, classId = null) => {
    // 1) Verify course exists
    const course = await courseRepository.findById(courseId);
    if (!course) {
      throw new AppError('Course not found', 404);
    }

    if (course.status !== 'Published') {
      throw new AppError('Cannot enroll in a course that is not published', 400);
    }

    // 2) Check if already enrolled
    const existing = await enrollmentRepository.findByStudentAndCourse(studentId, courseId);
    if (existing) {
      if (existing.status === 'Dropped') {
        // Re-enroll
        existing.status = 'Active';
        return await existing.save();
      }
      throw new AppError('Student is already enrolled in this course', 400);
    }

    // 3) Create enrollment
    return await enrollmentRepository.create({
      studentId,
      courseId,
      classId,
      status: 'Active',
      progressPercent: 0,
      completedLessons: []
    });
  },

  completeLesson: async (studentId, courseId, lessonId) => {
    // 1) Find enrollment
    const enrollment = await enrollmentRepository.findByStudentAndCourse(studentId, courseId);
    if (!enrollment) {
      throw new AppError('Student is not enrolled in this course', 400);
    }

    if (enrollment.status !== 'Active') {
      throw new AppError('Enrollment is no longer active', 400);
    }

    // 2) Verify lesson exists and belongs to the course
    const lesson = await lessonRepository.findById(lessonId);
    if (!lesson || lesson.courseId.toString() !== courseId.toString()) {
      throw new AppError('Lesson not found in this course', 404);
    }

    // 3) Add lesson to completedLessons if not already there
    const lessonAlreadyCompleted = enrollment.completedLessons.some(
      (id) => id.toString() === lessonId.toString()
    );

    if (!lessonAlreadyCompleted) {
      enrollment.completedLessons.push(lessonId);

      // Recalculate progress
      const totalLessonsCount = await lessonRepository.model.countDocuments({ courseId });
      
      if (totalLessonsCount > 0) {
        enrollment.progressPercent = Math.round(
          (enrollment.completedLessons.length / totalLessonsCount) * 100
        );
      } else {
        enrollment.progressPercent = 0;
      }

      // Check if course completed (100%)
      if (enrollment.progressPercent >= 100) {
        enrollment.status = 'Completed';
        enrollment.completedAt = Date.now();

        // Issue Certificate!
        await certificateService.issueCertificate(studentId, courseId);
      }

      await enrollment.save();
    }

    return enrollment;
  },

  getEnrollmentProgress: async (studentId, courseId) => {
    const enrollment = await enrollmentRepository.model.findOne({ studentId, courseId })
      .populate('completedLessons')
      .exec();

    if (!enrollment) {
      throw new AppError('Enrollment not found', 404);
    }

    return enrollment;
  }
};

export default enrollmentService;
