import User from '../models/user.model.js';
import { BaseRepository } from './base.repository.js';

class UserRepository extends BaseRepository {
  constructor() {
    super(User);
  }

  async findByEmail(email, selectPassword = false) {
    let query = this.model.findOne({ email: email.toLowerCase() });
    if (selectPassword) {
      query = query.select('+password');
    }
    return await query.exec();
  }

  async findByPasswordResetToken(token) {
    return await this.model.findOne({
      passwordResetToken: token,
      passwordResetExpires: { $gt: Date.now() }
    }).select('+passwordResetToken +passwordResetExpires').exec();
  }
}

export const userRepository = new UserRepository();
export default userRepository;
