import { HttpError } from '../utils/httpError.js';

const errorHandler = (err, req, res, next) => {
  if (err.type === 'entity.parse.failed') {
    return res.status(400).json({ status: 'error', message: 'El body no es un JSON válido' });
  }

  const statusCode = err instanceof HttpError ? err.statusCode : 500;
  const message = statusCode === 500 ? 'Error interno del servidor' : err.message;

  if (statusCode === 500) console.error(err);

  res.status(statusCode).json({ status: 'error', message });
};

export default errorHandler;
