import express from 'express';
import reportController from '../../controllers/report.controller.js';
import { protect, restrictTo } from '../../middlewares/auth.middleware.js';

const router = express.Router();

router.use(protect);

router.get('/overview', restrictTo('Admin'), reportController.getPlatformOverview);
router.get('/instructor', restrictTo('Admin', 'Instructor'), reportController.getInstructorPerformance);

export default router;
