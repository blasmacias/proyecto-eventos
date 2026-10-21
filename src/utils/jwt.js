import jwt from 'jsonwebtoken';
import config from '../config/config.js';

export const generateToken = ({ id, email, role }) =>
  jwt.sign({ id, email, role }, config.jwtSecret, { expiresIn: config.jwtExpiresIn });

export const verifyToken = (token) => jwt.verify(token, config.jwtSecret);
