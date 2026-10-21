import { AUTH_COOKIE_NAME } from '../config/cookies.js';
import { verifyToken } from '../utils/jwt.js';
import { HttpError } from '../utils/httpError.js';

const auth = (req, res, next) => {
  const token = req.cookies?.[AUTH_COOKIE_NAME];

  if (!token) {
    return next(new HttpError(401, 'No autenticado'));
  }

  try {
    const { id, email, role } = verifyToken(token);
    req.user = { id, email, role };
    next();
  } catch {
    next(new HttpError(401, 'No autenticado'));
  }
};

export default auth;
