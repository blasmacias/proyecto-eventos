import eventsService from '../services/events.service.js';

export const getEvents = async (req, res, next) => {
  try {
    const events = await eventsService.getPublished();
    res.status(200).json({ status: 'success', payload: events });
  } catch (error) {
    next(error);
  }
};

export const getEventById = async (req, res, next) => {
  try {
    const event = await eventsService.getById(req.params.eid);
    res.status(200).json({ status: 'success', payload: event });
  } catch (error) {
    next(error);
  }
};

export const createEvent = async (req, res, next) => {
  try {
    const event = await eventsService.create(req.body, req.user.id);
    res.status(201).json({ status: 'success', payload: event });
  } catch (error) {
    next(error);
  }
};

export const updateEvent = async (req, res, next) => {
  try {
    const event = await eventsService.update(req.event, req.body);
    res.status(200).json({ status: 'success', payload: event });
  } catch (error) {
    next(error);
  }
};

export const cancelEvent = async (req, res, next) => {
  try {
    const event = await eventsService.cancel(req.event);
    res.status(200).json({ status: 'success', payload: event });
  } catch (error) {
    next(error);
  }
};
