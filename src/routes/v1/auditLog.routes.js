import express from 'express';
import auditLogController from '../../controllers/auditLog.controller.js';
import { protect, restrictTo } from '../../middlewares/auth.middleware.js';

const router = express.Router();

router.use(protect);
router.use(restrictTo('Admin'));

router.get('/', auditLogController.getAuditLogs);

export default router;
