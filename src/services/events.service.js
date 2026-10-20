import eventsRepository from '../repositories/events.repository.js';

class EventsService {
  constructor(repository) {
    this.repository = repository;
  }

  getAll() {
    return this.repository.getAll();
  }
}

export default new EventsService(eventsRepository);
