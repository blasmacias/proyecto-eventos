import eventsDao from '../dao/events.dao.js';
import { EVENT_STATUS } from '../models/Event.js';

class EventsRepository {
  constructor(dao) {
    this.dao = dao;
  }

  getPublished() {
    return this.dao.getAll({ status: EVENT_STATUS.PUBLISHED });
  }

  getById(id) {
    return this.dao.getById(id);
  }

  create(eventData) {
    return this.dao.create(eventData);
  }

  update(id, changes) {
    return this.dao.update(id, changes);
  }
}

export default new EventsRepository(eventsDao);
