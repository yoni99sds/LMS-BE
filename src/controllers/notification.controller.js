import notificationService from '../services/notification.service.js';
import catchAsync from '../utils/catchAsync.js';

export const notificationController = {
  getNotifications: catchAsync(async (req, res) => {
    const limit = req.query.limit || 20;
    const notifications = await notificationService.getNotificationsForUser(req.user._id, limit);

    res.status(200).json({
      status: 'success',
      results: notifications.length,
      data: { notifications }
    });
  }),

  markAsRead: catchAsync(async (req, res) => {
    const notification = await notificationService.markAsRead(req.params.id, req.user._id);

    res.status(200).json({
      status: 'success',
      data: { notification }
    });
  }),

  markAllAsRead: catchAsync(async (req, res) => {
    const result = await notificationService.markAllAsRead(req.user._id);

    res.status(200).json({
      status: 'success',
      message: result.message
    });
  })
};

export default notificationController;
