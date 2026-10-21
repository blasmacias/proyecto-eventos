import ticketsRepository from '../repositories/tickets.repository.js';
import eventsRepository from '../repositories/events.repository.js';
import notificationService from './notification.service.js';
import { EVENT_STATUS } from '../models/Event.js';
import { TICKET_STATUS } from '../models/Ticket.js';
import { toMyTicket, toEventAttendeeTicket } from '../dto/ticket.dto.js';
import { generateReservationCode } from '../utils/reservationCode.js';
import { HttpError } from '../utils/httpError.js';

export const MAX_TICKETS_PER_ENROLLMENT = 10;

const MONGO_DUPLICATE_KEY = 11000;

const UNAVAILABLE_EVENT_MESSAGES = {
  [EVENT_STATUS.CANCELLED]: 'El evento está cancelado y no acepta inscripciones',
  [EVENT_STATUS.FINISHED]: 'El evento ya finalizó y no acepta inscripciones',
  [EVENT_STATUS.DRAFT]: 'El evento todavía no está publicado'
};

const parseQuantity = (value = 1) => {
  if (!Number.isInteger(value) || value < 1 || value > MAX_TICKETS_PER_ENROLLMENT) {
    throw new HttpError(400, `La cantidad (quantity) debe ser un entero entre 1 y ${MAX_TICKETS_PER_ENROLLMENT}`);
  }
  return value;
};

const describeAvailability = (available, requested) => {
  if (available === 0) return 'El evento no tiene cupos disponibles';
  const seats = available === 1 ? 'Solo queda 1 lugar' : `Solo quedan ${available} lugares`;
  return `${seats} y pediste ${requested}`;
};

class TicketsService {
  constructor(repository, events, notifications) {
    this.repository = repository;
    this.events = events;
    this.notifications = notifications;
  }

  async enroll(eventId, user, body = {}) {
    const quantity = parseQuantity(body.quantity);

    const event = await this.events.getById(eventId);
    if (!event) {
      throw new HttpError(404, 'Evento no encontrado');
    }

    if (UNAVAILABLE_EVENT_MESSAGES[event.status]) {
      throw new HttpError(400, UNAVAILABLE_EVENT_MESSAGES[event.status]);
    }

    if (new Date(event.date).getTime() <= Date.now()) {
      throw new HttpError(400, 'El evento ya ocurrió y no acepta inscripciones');
    }

    const activeTicket = await this.repository.getActiveByUserAndEvent(user.id, eventId);
    if (activeTicket) {
      throw new HttpError(409, `Ya tenés una inscripción activa para este evento (código ${activeTicket.reservationCode})`);
    }

    const available = await this.#availableSeats(event);
    if (quantity > available) {
      throw new HttpError(409, `No hay cupo suficiente. ${describeAvailability(available, quantity)}`);
    }

    const ticket = await this.#createTicket({ user: user.id, event: event._id, quantity });

    await this.#notifyConfirmation(user.email, event, ticket);

    return toMyTicket({ ...ticket, event });
  }

  async getMyTickets(userId) {
    const tickets = await this.repository.getByUserWithEvent(userId);
    return tickets.map(toMyTicket);
  }

  async getEventTickets(event) {
    const [tickets, sold] = await Promise.all([
      this.repository.getByEventWithAttendees(event.id),
      this.repository.sumActiveQuantity(event.id)
    ]);

    return {
      event: { id: event.id, title: event.title, capacity: event.capacity },
      sold,
      available: Math.max(event.capacity - sold, 0),
      tickets: tickets.map(toEventAttendeeTicket)
    };
  }

  async getById(ticketId) {
    const ticket = await this.repository.getById(ticketId);
    if (!ticket) {
      throw new HttpError(404, 'Ticket no encontrado');
    }
    return ticket;
  }

  async cancel(ticket) {
    if (ticket.status === TICKET_STATUS.CANCELLED) {
      throw new HttpError(400, 'El ticket ya está cancelado');
    }

    const event = await this.events.getById(ticket.event);
    if (event?.status === EVENT_STATUS.FINISHED) {
      throw new HttpError(400, 'No se puede cancelar una inscripción de un evento finalizado');
    }

    const cancelled = await this.repository.cancel(ticket._id);
    if (!cancelled) {
      throw new HttpError(400, 'El ticket ya está cancelado');
    }

    return toMyTicket({ ...cancelled, event: event ?? cancelled.event });
  }

  async #availableSeats(event) {
    const sold = await this.repository.sumActiveQuantity(event._id);
    return Math.max(event.capacity - sold, 0);
  }

  async #createTicket(data) {
    try {
      return await this.repository.create({
        ...data,
        status: TICKET_STATUS.CONFIRMED,
        reservationCode: generateReservationCode()
      });
    } catch (error) {
      if (error.code === MONGO_DUPLICATE_KEY) {
        throw new HttpError(409, 'Ya tenés una inscripción activa para este evento');
      }
      throw error;
    }
  }

  async #notifyConfirmation(email, event, ticket) {
    try {
      await this.notifications.sendTicketConfirmation({ to: email, event, ticket });
    } catch (error) {
      console.error(`No se pudo enviar el email de confirmación a ${email}: ${error.message}`);
    }
  }
}

export default new TicketsService(ticketsRepository, eventsRepository, notificationService);
