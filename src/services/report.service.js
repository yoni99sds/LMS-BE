import User from '../models/user.model.js';
import Course from '../models/course.model.js';
import Enrollment from '../models/enrollment.model.js';
import { QuizAttempt } from '../models/quiz.model.js';
import AppError from '../utils/AppError.js';

export const reportService = {
  getPlatformOverviewReport: async () => {
    const [
      totalUsers,
      roleCounts,
      totalCourses,
      courseStatusCounts,
      enrollmentCounts,
      completedEnrollments
    ] = await Promise.all([
      User.countDocuments(),
      User.aggregate([{ $group: { _id: '$role', count: { $sum: 1 } } }]),
      Course.countDocuments(),
      Course.aggregate([{ $group: { _id: '$status', count: { $sum: 1 } } }]),
      Enrollment.countDocuments(),
      Enrollment.countDocuments({ status: 'Completed' })
    ]);

    const completionRate = enrollmentCounts > 0 
      ? Math.round((completedEnrollments / enrollmentCounts) * 100)
      : 0;

    // Structure roles cleanly
    const roles = { Admin: 0, Instructor: 0, Student: 0 };
    roleCounts.forEach((rc) => {
      if (roles[rc._id] !== undefined) roles[rc._id] = rc.count;
    });

    // Structure course status
    const courseStatus = { Draft: 0, Published: 0, Archived: 0 };
    courseStatusCounts.forEach((csc) => {
      if (courseStatus[csc._id] !== undefined) courseStatus[csc._id] = csc.count;
    });

    return {
      users: {
        total: totalUsers,
        breakdown: roles
      },
      courses: {
        total: totalCourses,
        breakdown: courseStatus
      },
      enrollments: {
        total: enrollmentCounts,
        completed: completedEnrollments,
        completionRatePercent: completionRate
      }
    };
  },

  getInstructorPerformanceReport: async (instructorId) => {
    // 1) Find all courses owned by instructor
    const instructorCourses = await Course.find({ instructorId }).select('_id title').exec();
    const courseIds = instructorCourses.map((c) => c._id);

    if (courseIds.length === 0) {
      return {
        coursesCount: 0,
        totalEnrolledStudents: 0,
        completionRatePercent: 0,
        coursesDetail: []
      };
    }

    // 2) Aggregate enrollments details for these courses
    const [enrollmentStats, quizStats] = await Promise.all([
      Enrollment.aggregate([
        { $match: { courseId: { $in: courseIds } } },
        {
          $group: {
            _id: '$status',
            count: { $sum: 1 }
          }
        }
      ]),
      // Average score of quiz attempts for quizzes in instructor's courses
      // First find attempts that join with Quiz in this course
      QuizAttempt.aggregate([
        {
          $lookup: {
            from: 'quizzes',
            localField: 'quizId',
            foreignField: '_id',
            as: 'quiz'
          }
        },
        { $unwind: '$quiz' },
        { $match: { 'quiz.courseId': { $in: courseIds } } },
        {
          $group: {
            _id: null,
            averageScore: { $avg: '$score' },
            attemptsCount: { $sum: 1 }
          }
        }
      ])
    ]);

    let totalEnrolled = 0;
    let totalCompleted = 0;

    enrollmentStats.forEach((stat) => {
      totalEnrolled += stat.count;
      if (stat._id === 'Completed') {
        totalCompleted += stat.count;
      }
    });

    const completionRate = totalEnrolled > 0 
      ? Math.round((totalCompleted / totalEnrolled) * 100)
      : 0;

    const avgQuizScore = quizStats.length > 0 ? Math.round(quizStats[0].averageScore) : 0;
    const quizAttemptsCount = quizStats.length > 0 ? quizStats[0].attemptsCount : 0;

    // 3) Course-specific details
    const coursesDetail = await Promise.all(
      instructorCourses.map(async (course) => {
        const [enrolledCount, completedCount] = await Promise.all([
          Enrollment.countDocuments({ courseId: course._id }),
          Enrollment.countDocuments({ courseId: course._id, status: 'Completed' })
        ]);
        const rate = enrolledCount > 0 ? Math.round((completedCount / enrolledCount) * 100) : 0;

        return {
          courseId: course._id,
          title: course.title,
          enrolledCount,
          completedCount,
          completionRatePercent: rate
        };
      })
    );

    return {
      coursesCount: courseIds.length,
      totalEnrolledStudents: totalEnrolled,
      completionRatePercent: completionRate,
      quizPerformance: {
        averageScorePercent: avgQuizScore,
        totalAttempts: quizAttemptsCount
      },
      coursesDetail
    };
  }
};

export default reportService;
