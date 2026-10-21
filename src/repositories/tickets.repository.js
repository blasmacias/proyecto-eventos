import ticketsDao from '../dao/tickets.dao.js';

class TicketsRepository {
  constructor(dao) {
    this.dao = dao;
  }

  create(ticketData) {
    return this.dao.create(ticketData);
  }

  getById(id) {
    return this.dao.getById(id);
  }

  getActiveByUserAndEvent(userId, eventId) {
    return this.dao.getActiveByUserAndEvent(userId, eventId);
  }

  sumActiveQuantity(eventId) {
    return this.dao.sumActiveQuantity(eventId);
  }

  getByUserWithEvent(userId) {
    return this.dao.getByUserWithEvent(userId);
  }

  getByEventWithAttendees(eventId) {
    return this.dao.getByEventWithAttendees(eventId);
  }

  cancel(id) {
    return this.dao.cancel(id);
  }
}

export default new TicketsRepository(ticketsDao);
