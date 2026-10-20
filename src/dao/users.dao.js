import User from '../models/User.js';

class UsersDao {
  getByEmail(email) {
    return User.findOne({ email }).lean();
  }

  async create(userData) {
    const user = await User.create(userData);
    return user.toObject();
  }
}

export default new UsersDao();
