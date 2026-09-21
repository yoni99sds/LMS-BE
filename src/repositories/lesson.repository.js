import Lesson from '../models/lesson.model.js';
import { BaseRepository } from './base.repository.js';

class LessonRepository extends BaseRepository {
  constructor() {
    super(Lesson);
  }

  async findByCourseId(courseId) {
    return await this.model.find({ courseId }).sort('order').exec();
  }

  async getNextLessonOrder(courseId) {
    const lastLesson = await this.model.findOne({ courseId }).sort('-order').exec();
    return lastLesson ? lastLesson.order + 1 : 0;
  }
}

export const lessonRepository = new LessonRepository();
export default lessonRepository;
