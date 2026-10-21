import eventsDao from '../dao/events.dao.js';

class EventsRepository {
  constructor(dao) {
    this.dao = dao;
  }

  paginate(filter, options) {
    return this.dao.paginate(filter, options);
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
