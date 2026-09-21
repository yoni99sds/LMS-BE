import express from 'express';
import notificationController from '../../controllers/notification.controller.js';
import { protect } from '../../middlewares/auth.middleware.js';

const router = express.Router();

router.use(protect);

router.route('/')
  .get(notificationController.getNotifications)
  .put(notificationController.markAllAsRead);

router.route('/:id/read')
  .put(notificationController.markAsRead);

export default router;
