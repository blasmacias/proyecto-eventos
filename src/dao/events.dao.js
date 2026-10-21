import mongoose from 'mongoose';
import Event from '../models/Event.js';

class EventsDao {
  getAll(filter = {}) {
    return Event.find(filter).sort({ date: 1 }).lean();
  }

  getById(id) {
    if (!mongoose.isValidObjectId(id)) return null;
    return Event.findById(id).lean();
  }

  async create(eventData) {
    const event = await Event.create(eventData);
    return event.toObject();
  }

  update(id, changes) {
    if (!mongoose.isValidObjectId(id)) return null;
    return Event.findByIdAndUpdate(id, changes, { new: true, runValidators: true }).lean();
  }
}

export default new EventsDao();
