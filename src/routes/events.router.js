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
import checkEventOwnership from '../middlewares/eventOwnership.middleware.js';
import { PERMISSIONS } from '../config/permissions.js';

const router = Router();

router.get('/', getEvents);
router.get('/:id', getEventById);
router.post('/', auth, authorize(PERMISSIONS.CREATE_EVENT), createEvent);
router.put('/:id', auth, authorize(PERMISSIONS.MANAGE_OWN_EVENT), checkEventOwnership, updateEvent);
router.patch('/:id/status', auth, authorize(PERMISSIONS.MANAGE_OWN_EVENT), checkEventOwnership, changeEventStatus);

export default router;
