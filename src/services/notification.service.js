import Notification from '../models/notification.model.js';
import AppError from '../utils/AppError.js';

export const notificationService = {
  createNotification: async ({ userId, title, message, type = 'Info' }) => {
    return await Notification.create({
      userId,
      title,
      message,
      type
    });
  },

  getNotificationsForUser: async (userId, limit = 20) => {
    return await Notification.find({ userId })
      .sort('-createdAt')
      .limit(parseInt(limit, 10) || 20)
      .exec();
  },

  markAsRead: async (notificationId, userId) => {
    const notification = await Notification.findOneAndUpdate(
      { _id: notificationId, userId },
      { isRead: true },
      { new: true }
    );

    if (!notification) {
      throw new AppError('Notification not found', 404);
    }
    return notification;
  },

  markAllAsRead: async (userId) => {
    await Notification.updateMany({ userId, isRead: false }, { isRead: true });
    return { message: 'All notifications marked as read' };
  }
};

export default notificationService;
