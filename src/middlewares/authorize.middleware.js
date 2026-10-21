import { HttpError } from '../utils/httpError.js';

export const FORBIDDEN_MESSAGE = 'No tenés permisos para realizar esta acción';

const authorize = (...allowedRoles) => {
  const roles = allowedRoles.flat();

  return (req, res, next) => {
    if (!req.user) {
      return next(new HttpError(401, 'No autenticado'));
    }

    if (!roles.includes(req.user.role)) {
      return next(new HttpError(403, FORBIDDEN_MESSAGE));
    }

    next();
  };
};

export default authorize;
