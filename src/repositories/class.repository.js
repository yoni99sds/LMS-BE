import Class from '../models/class.model.js';
import { BaseRepository } from './base.repository.js';

class ClassRepository extends BaseRepository {
  constructor() {
    super(Class);
  }

  async findWithDetails(id) {
    return await this.model.findById(id)
      .populate('courseId')
      .populate('instructors', 'firstName lastName email')
      .populate('students', 'firstName lastName email')
      .exec();
  }
}

export const classRepository = new ClassRepository();
export default classRepository;
