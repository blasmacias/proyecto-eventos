import eventsService from '../services/events.service.js';
import { PERMISSIONS } from '../config/permissions.js';
import { HttpError } from '../utils/httpError.js';

export const createEventOwnershipCheck = ({
  param = 'id',
  forbiddenMessage = 'Solo podés modificar eventos que organizás'
} = {}) => async (req, res, next) => {
  try {
    const event = await eventsService.getById(req.params[param]);
    const isOwner = event.organizer === req.user.id;
    const canManageAnyEvent = PERMISSIONS.MANAGE_ANY_EVENT.includes(req.user.role);

    if (!isOwner && !canManageAnyEvent) {
      throw new HttpError(403, forbiddenMessage);
    }

    req.event = event;
    next();
  } catch (error) {
    next(error);
  }
};

const checkEventOwnership = createEventOwnershipCheck();

export default checkEventOwnership;
