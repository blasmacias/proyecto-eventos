import mongoose from 'mongoose';
import User from '../models/User.js';

class UsersDao {
  getAll() {
    return User.find().sort({ createdAt: 1 }).lean();
  }

  getById(id) {
    if (!mongoose.isValidObjectId(id)) return null;
    return User.findById(id).lean();
  }

  getByEmail(email) {
    return User.findOne({ email }).lean();
  }

  async create(userData) {
    const user = await User.create(userData);
    return user.toObject();
  }

  updateRole(id, role) {
    if (!mongoose.isValidObjectId(id)) return null;
    return User.findByIdAndUpdate(id, { role }, { new: true, runValidators: true }).lean();
  }
}

export default new UsersDao();
