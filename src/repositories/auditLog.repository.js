import AuditLog from '../models/auditLog.model.js';
import { BaseRepository } from './base.repository.js';

class AuditLogRepository extends BaseRepository {
  constructor() {
    super(AuditLog);
  }

  async logAction({ userId, action, details, ipAddress, userAgent }) {
    return await this.create({
      userId,
      action,
      details,
      ipAddress,
      userAgent
    });
  }
}

export const auditLogRepository = new AuditLogRepository();
export default auditLogRepository;
