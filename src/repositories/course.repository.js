import Course from '../models/course.model.js';
import { BaseRepository } from './base.repository.js';

class CourseRepository extends BaseRepository {
  constructor() {
    super(Course);
  }

  async findWithLessons(id) {
    return await this.model.findById(id).populate('lessons').exec();
  }
}

export const courseRepository = new CourseRepository();
export default courseRepository;
