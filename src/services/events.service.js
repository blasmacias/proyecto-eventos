import eventsRepository from '../repositories/events.repository.js';
import { EVENT_STATUS } from '../models/Event.js';
import { toPublicEvent } from '../dto/event.dto.js';
import { HttpError } from '../utils/httpError.js';
import {
  EVENT_REQUIRED_FIELDS,
  findInvalidField,
  normalizeEventData,
  pickEditableFields
} from '../utils/eventValidators.js';

class EventsService {
  constructor(repository) {
    this.repository = repository;
  }

  async getPublished() {
    const events = await this.repository.getPublished();
    return events.map(toPublicEvent);
  }

  async getById(id) {
    const event = await this.repository.getById(id);
    if (!event) {
      throw new HttpError(404, 'Evento no encontrado');
    }
    return toPublicEvent(event);
  }

  async create(body, organizerId) {
    const data = pickEditableFields(body);

    if (EVENT_REQUIRED_FIELDS.some((field) => data[field] === undefined)) {
      throw new HttpError(400, 'Faltan campos obligatorios');
    }

    const invalidMessage = findInvalidField(data);
    if (invalidMessage) {
      throw new HttpError(400, invalidMessage);
    }

    const event = await this.repository.create({ ...normalizeEventData(data), organizer: organizerId });
    return toPublicEvent(event);
  }

  async update(event, body) {
    this.#assertNotCancelled(event);

    const changes = pickEditableFields(body);
    if (Object.keys(changes).length === 0) {
      throw new HttpError(400, 'No se enviaron campos para actualizar');
    }

    const invalidMessage = findInvalidField(changes);
    if (invalidMessage) {
      throw new HttpError(400, invalidMessage);
    }

    const updated = await this.repository.update(event.id, normalizeEventData(changes));
    return toPublicEvent(updated);
  }

  async cancel(event) {
    this.#assertNotCancelled(event);
    const updated = await this.repository.update(event.id, { status: EVENT_STATUS.CANCELLED });
    return toPublicEvent(updated);
  }

  #assertNotCancelled(event) {
    if (event.status === EVENT_STATUS.CANCELLED) {
      throw new HttpError(400, 'El evento está cancelado y no se puede modificar');
    }
  }
}

export default new EventsService(eventsRepository);
