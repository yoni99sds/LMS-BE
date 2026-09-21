import Certificate from '../models/certificate.model.js';
import { BaseRepository } from './base.repository.js';

class CertificateRepository extends BaseRepository {
  constructor() {
    super(Certificate);
  }

  async findByHash(hash) {
    return await this.model.findOne({ certificateHash: hash })
      .populate('studentId', 'firstName lastName email')
      .populate('courseId', 'title description')
      .exec();
  }

  async findByStudentAndCourse(studentId, courseId) {
    return await this.model.findOne({ studentId, courseId }).exec();
  }
}

export const certificateRepository = new CertificateRepository();
export default certificateRepository;
