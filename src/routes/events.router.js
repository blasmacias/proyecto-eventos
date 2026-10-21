import { Router } from 'express';
import {
  getEvents,
  getEventById,
  createEvent,
  updateEvent,
  cancelEvent
} from '../controllers/events.controller.js';
import auth from '../middlewares/auth.middleware.js';
import authorize from '../middlewares/authorize.middleware.js';
import checkEventOwnership from '../middlewares/eventOwnership.middleware.js';
import { PERMISSIONS } from '../config/permissions.js';

const router = Router();

router.get('/', getEvents);
router.get('/:eid', getEventById);
router.post('/', auth, authorize(PERMISSIONS.CREATE_EVENT), createEvent);
router.put('/:eid', auth, authorize(PERMISSIONS.MANAGE_OWN_EVENT), checkEventOwnership, updateEvent);
router.patch('/:eid/cancel', auth, authorize(PERMISSIONS.MANAGE_OWN_EVENT), checkEventOwnership, cancelEvent);

export default router;
