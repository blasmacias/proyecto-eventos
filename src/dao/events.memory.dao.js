class EventsMemoryDao {
  constructor() {
    this.events = [];
  }

  async getAll() {
    return this.events;
  }
}

export default new EventsMemoryDao();
