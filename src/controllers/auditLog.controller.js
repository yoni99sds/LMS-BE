import auditLogService from '../services/auditLog.service.js';
import catchAsync from '../utils/catchAsync.js';

export const auditLogController = {
  getAuditLogs: catchAsync(async (req, res) => {
    const { page, limit, sort, search, action, userId } = req.query;

    const filter = {};
    if (action) filter.action = action;
    if (userId) filter.userId = userId;

    const result = await auditLogService.getAuditLogs({
      filter,
      page,
      limit,
      sort,
      searchQuery: search
    });

    res.status(200).json({
      status: 'success',
      pagination: result.pagination,
      data: { logs: result.data }
    });
  })
};

export default auditLogController;
