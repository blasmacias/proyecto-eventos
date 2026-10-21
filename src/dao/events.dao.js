import mongoose from 'mongoose';
import Event from '../models/Event.js';

class EventsDao {
  async paginate(filter, { page, limit, sort }) {
    const [docs, total] = await Promise.all([
      Event.find(filter).sort(sort).skip((page - 1) * limit).limit(limit).lean(),
      Event.countDocuments(filter)
    ]);
    return { docs, total };
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
