import eventsRepository from '../repositories/events.repository.js';
import { EVENT_STATUS, EVENT_STATUS_VALUES } from '../models/Event.js';
import { toPublicEvent } from '../dto/event.dto.js';
import { HttpError } from '../utils/httpError.js';
import { parseEventQuery } from '../utils/eventQuery.js';
import {
  EVENT_REQUIRED_FIELDS,
  findInvalidField,
  normalizeEventData,
  pickEditableFields
} from '../utils/eventValidators.js';

const { DRAFT, PUBLISHED, CANCELLED, FINISHED } = EVENT_STATUS;

const INITIAL_STATUSES = [DRAFT, PUBLISHED];

const ALLOWED_TRANSITIONS = Object.freeze({
  [DRAFT]: [PUBLISHED, CANCELLED],
  [PUBLISHED]: [DRAFT, CANCELLED, FINISHED],
  [CANCELLED]: [],
  [FINISHED]: []
});

const LOCKED_MESSAGES = {
  [CANCELLED]: 'El evento está cancelado y no se puede modificar',
  [FINISHED]: 'El evento está finalizado y no se puede modificar'
};

const isPastDate = (date) => new Date(date).getTime() <= Date.now();

class EventsService {
  constructor(repository) {
    this.repository = repository;
  }

  async list(query) {
    const { filter, page, limit, sort } = parseEventQuery(query);
    const { docs, total } = await this.repository.paginate(filter, { page, limit, sort });

    return {
      data: docs.map(toPublicEvent),
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit)
    };
  }

  async getById(id) {
    const event = await this.repository.getById(id);
    if (!event) {
      throw new HttpError(404, 'Evento no encontrado');
    }
    return toPublicEvent(event);
  }

  async create(body = {}, organizerId) {
    const data = pickEditableFields(body);

    if (EVENT_REQUIRED_FIELDS.some((field) => data[field] === undefined)) {
      throw new HttpError(400, `Faltan campos obligatorios: ${EVENT_REQUIRED_FIELDS.join(', ')}`);
    }

    this.#validateFields(data);

    const status = body.status ?? PUBLISHED;
    if (!INITIAL_STATUSES.includes(status)) {
      throw new HttpError(400, `Un evento nuevo solo puede crearse como ${INITIAL_STATUSES.join(' o ')}`);
    }

    const event = await this.repository.create({
      ...normalizeEventData(data),
      status,
      organizer: organizerId
    });
    return toPublicEvent(event);
  }

  async update(event, body = {}) {
    this.#assertEditable(event);

    const changes = pickEditableFields(body);
    if (Object.keys(changes).length === 0) {
      throw new HttpError(400, 'No se enviaron campos para actualizar');
    }

    this.#validateFields(changes);

    const updated = await this.repository.update(event.id, normalizeEventData(changes));
    return toPublicEvent(updated);
  }

  async changeStatus(event, newStatus) {
    if (!EVENT_STATUS_VALUES.includes(newStatus)) {
      throw new HttpError(400, `El estado debe ser uno de: ${EVENT_STATUS_VALUES.join(', ')}`);
    }

    this.#assertEditable(event);

    if (event.status === newStatus) {
      throw new HttpError(400, `El evento ya está en estado ${newStatus}`);
    }

    if (!ALLOWED_TRANSITIONS[event.status].includes(newStatus)) {
      throw new HttpError(400, `No se puede pasar un evento de ${event.status} a ${newStatus}`);
    }

    if (newStatus === PUBLISHED && isPastDate(event.date)) {
      throw new HttpError(400, 'No se puede publicar un evento con fecha pasada');
    }

    const updated = await this.repository.update(event.id, { status: newStatus });
    return toPublicEvent(updated);
  }

  #validateFields(data) {
    const invalidMessage = findInvalidField(data);
    if (invalidMessage) {
      throw new HttpError(400, invalidMessage);
    }

    if (data.date !== undefined && isPastDate(data.date)) {
      throw new HttpError(400, 'La fecha del evento no puede ser pasada');
    }
  }

  #assertEditable(event) {
    if (LOCKED_MESSAGES[event.status]) {
      throw new HttpError(400, LOCKED_MESSAGES[event.status]);
    }
  }
}

export default new EventsService(eventsRepository);
