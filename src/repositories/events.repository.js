import eventsDao from '../dao/events.memory.dao.js';

class EventsRepository {
  constructor(dao) {
    this.dao = dao;
  }

  getAll() {
    return this.dao.getAll();
  }
}

export default new EventsRepository(eventsDao);
