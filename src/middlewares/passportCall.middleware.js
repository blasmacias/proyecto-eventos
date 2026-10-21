import passport from 'passport';
import { HttpError } from '../utils/httpError.js';

const MISSING_FIELDS = 'Faltan campos obligatorios';
const NOT_AUTHENTICATED = 'No autenticado';

const toHttpError = (info, status) => {
  if (info?.status) return new HttpError(info.status, info.message);
  if (status === 400) return new HttpError(400, MISSING_FIELDS);
  return new HttpError(401, NOT_AUTHENTICATED);
};

const passportCall = (strategy) => (req, res, next) => {
  passport.authenticate(strategy, { session: false }, (error, user, info, status) => {
    if (error) return next(error);
    if (!user) return next(toHttpError(info, status));

    req.user = user;
    next();
  })(req, res, next);
};

export default passportCall;
