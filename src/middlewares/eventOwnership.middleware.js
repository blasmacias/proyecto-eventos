import eventsService from '../services/events.service.js';
import { PERMISSIONS } from '../config/permissions.js';
import { HttpError } from '../utils/httpError.js';

const checkEventOwnership = async (req, res, next) => {
  try {
    const event = await eventsService.getById(req.params.eid);
    const isOwner = event.organizer === req.user.id;
    const canManageAnyEvent = PERMISSIONS.MANAGE_ANY_EVENT.includes(req.user.role);

    if (!isOwner && !canManageAnyEvent) {
      throw new HttpError(403, 'Solo podés modificar eventos que organizás');
    }

    req.event = event;
    next();
  } catch (error) {
    next(error);
  }
};

export default checkEventOwnership;
