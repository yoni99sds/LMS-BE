import auditLogRepository from '../repositories/auditLog.repository.js';

export const auditLogService = {
  getAuditLogs: async (queryOptions) => {
    // Supports filter (e.g. action, userId), sorting, pagination, and search (action)
    return await auditLogRepository.findWithPaginationAndFilter({
      ...queryOptions,
      searchFields: ['action'],
      populate: 'userId' // Populate user information
    });
  }
};

export default auditLogService;
