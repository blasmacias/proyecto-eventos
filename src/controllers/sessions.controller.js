import sessionsService from '../services/sessions.service.js';

const notImplemented = (res, action) =>
  res.status(501).json({
    status: 'error',
    message: `${action} pendiente de implementación`
  });

export const register = async (req, res, next) => {
  try {
    const user = await sessionsService.register(req.body);
    res.status(201).json({ status: 'success', payload: user });
  } catch (error) {
    next(error);
  }
};

export const login = (req, res) => notImplemented(res, 'Login');

export const current = (req, res) => notImplemented(res, 'Usuario actual');
