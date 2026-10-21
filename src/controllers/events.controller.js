import eventsService from '../services/events.service.js';

export const getEvents = async (req, res, next) => {
  try {
    const result = await eventsService.list(req.query);
    res.status(200).json({ status: 'success', ...result });
  } catch (error) {
    next(error);
  }
};

export const getEventById = async (req, res, next) => {
  try {
    const event = await eventsService.getById(req.params.id);
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

export const changeEventStatus = async (req, res, next) => {
  try {
    const event = await eventsService.changeStatus(req.event, req.body?.status);
    res.status(200).json({ status: 'success', payload: event });
  } catch (error) {
    next(error);
  }
};
