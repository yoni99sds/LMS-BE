import express from 'express';
import authRoutes from './auth.routes.js';
import userRoutes from './user.routes.js';
import courseRoutes from './course.routes.js';
import lessonRoutes from './lesson.routes.js';
import quizRoutes from './quiz.routes.js';
import enrollmentRoutes from './enrollment.routes.js';
import certificateRoutes from './certificate.routes.js';
import trackingRoutes from './tracking.routes.js';
import reportRoutes from './report.routes.js';
import notificationRoutes from './notification.routes.js';
import auditLogRoutes from './auditLog.routes.js';

const router = express.Router();

router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/courses', courseRoutes);
router.use('/lessons', lessonRoutes);
router.use('/quizzes', quizRoutes);
router.use('/enrollments', enrollmentRoutes);
router.use('/certificates', certificateRoutes);
router.use('/tracking', trackingRoutes);
router.use('/reports', reportRoutes);
router.use('/notifications', notificationRoutes);
router.use('/audit-logs', auditLogRoutes);

export default router;
// Note: Swagger metadata annotations will be documented centrally or inside routers.
