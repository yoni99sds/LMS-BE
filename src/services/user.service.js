import userRepository from '../repositories/user.repository.js';
import auditLogRepository from '../repositories/auditLog.repository.js';
import AppError from '../utils/AppError.js';

export const userService = {
  getUsers: async (queryOptions) => {
    // Supports pagination, search (firstName, lastName, email), filtering by role or status, and sorting
    return await userRepository.findWithPaginationAndFilter({
      ...queryOptions,
      searchFields: ['firstName', 'lastName', 'email']
    });
  },

  getUserById: async (id) => {
    const user = await userRepository.findById(id);
    if (!user) {
      throw new AppError('User not found', 404);
    }
    return user;
  },

  updateUser: async (id, updateData, adminUserId = null, ipAddress = null, userAgent = null) => {
    const user = await userRepository.findById(id);
    if (!user) {
      throw new AppError('User not found', 404);
    }

    // If changing role or status, log as admin action
    const isAdministrativeChange = 
      (updateData.role && updateData.role !== user.role) || 
      (updateData.status && updateData.status !== user.status);

    const updatedUser = await userRepository.update(id, updateData);

    if (isAdministrativeChange && adminUserId) {
      await auditLogRepository.logAction({
        userId: adminUserId,
        action: 'ADMIN_UPDATE_USER',
        details: { targetUserId: id, updates: updateData },
        ipAddress,
        userAgent
      });
    }

    return updatedUser;
  },

  deleteUser: async (id, adminUserId, ipAddress, userAgent) => {
    const user = await userRepository.findById(id);
    if (!user) {
      throw new AppError('User not found', 404);
    }

    await userRepository.delete(id);

    await auditLogRepository.logAction({
      userId: adminUserId,
      action: 'ADMIN_DELETE_USER',
      details: { deletedUserId: id, email: user.email },
      ipAddress,
      userAgent
    });

    return { message: 'User deleted successfully' };
  }
};

export default userService;
