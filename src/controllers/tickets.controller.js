import ticketsService from '../services/tickets.service.js';

export const enroll = async (req, res, next) => {
  try {
    const ticket = await ticketsService.enroll(req.params.eid, req.user, req.body);
    res.status(201).json({ status: 'success', payload: ticket });
  } catch (error) {
    next(error);
  }
};

export const getMyTickets = async (req, res, next) => {
  try {
    const tickets = await ticketsService.getMyTickets(req.user.id);
    res.status(200).json({ status: 'success', payload: tickets });
  } catch (error) {
    next(error);
  }
};

export const getEventTickets = async (req, res, next) => {
  try {
    const result = await ticketsService.getEventTickets(req.event);
    res.status(200).json({ status: 'success', payload: result });
  } catch (error) {
    next(error);
  }
};

export const cancelTicket = async (req, res, next) => {
  try {
    const ticket = await ticketsService.cancel(req.ticket);
    res.status(200).json({ status: 'success', payload: ticket });
  } catch (error) {
    next(error);
  }
};
