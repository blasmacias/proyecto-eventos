import crypto from 'node:crypto';

const CODE_BYTES = 5;

export const generateReservationCode = () =>
  `EVT-${crypto.randomBytes(CODE_BYTES).toString('hex').toUpperCase()}`;
