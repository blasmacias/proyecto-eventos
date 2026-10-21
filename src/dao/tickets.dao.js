import mongoose from 'mongoose';
import Ticket, { ACTIVE_TICKET_STATUSES, TICKET_STATUS } from '../models/Ticket.js';

const EVENT_SUMMARY_FIELDS = 'title date location status';
const ATTENDEE_FIELDS = 'first_name last_name email';

class TicketsDao {
  async create(ticketData) {
    const ticket = await Ticket.create(ticketData);
    return ticket.toObject();
  }

  getById(id) {
    if (!mongoose.isValidObjectId(id)) return null;
    return Ticket.findById(id).lean();
  }

  getActiveByUserAndEvent(userId, eventId) {
    return Ticket.findOne({ user: userId, event: eventId, status: { $in: ACTIVE_TICKET_STATUSES } }).lean();
  }

  async sumActiveQuantity(eventId) {
    const [result] = await Ticket.aggregate([
      { $match: { event: new mongoose.Types.ObjectId(eventId), status: { $in: ACTIVE_TICKET_STATUSES } } },
      { $group: { _id: null, total: { $sum: '$quantity' } } }
    ]);
    return result?.total ?? 0;
  }

  getByUserWithEvent(userId) {
    return Ticket.find({ user: userId })
      .sort({ createdAt: -1 })
      .populate('event', EVENT_SUMMARY_FIELDS)
      .lean();
  }

  getByEventWithAttendees(eventId) {
    return Ticket.find({ event: eventId })
      .sort({ createdAt: 1 })
      .populate('user', ATTENDEE_FIELDS)
      .lean();
  }

  cancel(id) {
    if (!mongoose.isValidObjectId(id)) return null;
    return Ticket.findOneAndUpdate(
      { _id: id, status: { $ne: TICKET_STATUS.CANCELLED } },
      { status: TICKET_STATUS.CANCELLED, cancelledAt: new Date() },
      { new: true }
    ).lean();
  }
}

export default new TicketsDao();
