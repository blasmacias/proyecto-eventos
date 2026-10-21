import sessionsService from '../services/sessions.service.js';
import {
  AUTH_COOKIE_NAME,
  authCookieOptions,
  clearAuthCookieOptions
} from '../config/cookies.js';

export const register = async (req, res, next) => {
  try {
    const user = await sessionsService.register(req.body);
    res.status(201).json({ status: 'success', payload: user });
  } catch (error) {
    next(error);
  }
};

export const login = async (req, res, next) => {
  try {
    const token = await sessionsService.login(req.body);
    res
      .cookie(AUTH_COOKIE_NAME, token, authCookieOptions)
      .status(200)
      .json({ status: 'success', message: 'Login correcto' });
  } catch (error) {
    next(error);
  }
};

export const current = (req, res) => {
  res.status(200).json({ status: 'success', payload: req.user });
};

export const logout = (req, res) => {
  res
    .clearCookie(AUTH_COOKIE_NAME, clearAuthCookieOptions)
    .status(200)
    .json({ status: 'success', message: 'Sesión cerrada' });
};
