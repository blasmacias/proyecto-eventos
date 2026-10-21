import ticketsService from '../services/tickets.service.js';
import { PERMISSIONS } from '../config/permissions.js';
import { HttpError } from '../utils/httpError.js';

const checkTicketOwnership = async (req, res, next) => {
  try {
    const ticket = await ticketsService.getById(req.params.tid);
    const isOwner = ticket.user.toString() === req.user.id;
    const canManageAnyTicket = PERMISSIONS.MANAGE_ANY_TICKET.includes(req.user.role);

    if (!isOwner && !canManageAnyTicket) {
      throw new HttpError(403, 'Solo podés cancelar tus propios tickets');
    }

    req.ticket = ticket;
    next();
  } catch (error) {
    next(error);
  }
};

export default checkTicketOwnership;
