import { Router } from 'express';
import {
  getEvents,
  getEventById,
  createEvent,
  updateEvent,
  changeEventStatus
} from '../controllers/events.controller.js';
import auth from '../middlewares/auth.middleware.js';
import authorize from '../middlewares/authorize.middleware.js';
import checkEventOwnership, { createEventOwnershipCheck } from '../middlewares/eventOwnership.middleware.js';
import { enroll, getEventTickets } from '../controllers/tickets.controller.js';
import { PERMISSIONS } from '../config/permissions.js';

const router = Router();

const checkEventTicketsOwnership = createEventOwnershipCheck({
  param: 'eid',
  forbiddenMessage: 'Solo podés ver las inscripciones de eventos que organizás'
});

router.get('/', getEvents);
router.get('/:id', getEventById);
router.post('/', auth, authorize(PERMISSIONS.CREATE_EVENT), createEvent);
router.put('/:id', auth, authorize(PERMISSIONS.MANAGE_OWN_EVENT), checkEventOwnership, updateEvent);
router.patch('/:id/status', auth, authorize(PERMISSIONS.MANAGE_OWN_EVENT), checkEventOwnership, changeEventStatus);

router.post('/:eid/tickets', auth, enroll);
router.get('/:eid/tickets', auth, authorize(PERMISSIONS.VIEW_EVENT_TICKETS), checkEventTicketsOwnership, getEventTickets);

export default router;
