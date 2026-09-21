import Enrollment from '../models/enrollment.model.js';
import { BaseRepository } from './base.repository.js';

class EnrollmentRepository extends BaseRepository {
  constructor() {
    super(Enrollment);
  }

  async findByStudentAndCourse(studentId, courseId) {
    return await this.model.findOne({ studentId, courseId }).exec();
  }

  async findActiveEnrollments(studentId) {
    return await this.model.find({ studentId, status: 'Active' }).populate('courseId').exec();
  }
}

export const enrollmentRepository = new EnrollmentRepository();
export default enrollmentRepository;
