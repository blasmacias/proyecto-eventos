import { generateToken } from '../utils/jwt.js';
import {
  AUTH_COOKIE_NAME,
  authCookieOptions,
  clearAuthCookieOptions
} from '../config/cookies.js';

export const register = (req, res) => {
  res.status(201).json({ status: 'success', payload: req.user });
};

export const login = (req, res) => {
  const token = generateToken(req.user);
  res
    .cookie(AUTH_COOKIE_NAME, token, authCookieOptions)
    .status(200)
    .json({ status: 'success', message: 'Login correcto' });
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
