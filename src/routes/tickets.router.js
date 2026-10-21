import { Router } from 'express';
import { getMyTickets, cancelTicket } from '../controllers/tickets.controller.js';
import auth from '../middlewares/auth.middleware.js';
import checkTicketOwnership from '../middlewares/ticketOwnership.middleware.js';

const router = Router();

router.get('/my-tickets', auth, getMyTickets);
router.patch('/:tid/cancel', auth, checkTicketOwnership, cancelTicket);

export default router;
