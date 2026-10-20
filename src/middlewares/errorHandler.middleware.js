import { HttpError } from '../utils/httpError.js';

const errorHandler = (err, req, res, next) => {
  const statusCode = err instanceof HttpError ? err.statusCode : 500;
  const message = statusCode === 500 ? 'Error interno del servidor' : err.message;

  if (statusCode === 500) console.error(err);

  res.status(statusCode).json({ status: 'error', message });
};

export default errorHandler;
