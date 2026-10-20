const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const MIN_PASSWORD_LENGTH = 8;

export const normalizeEmail = (email) => String(email).trim().toLowerCase();

export const isValidEmail = (email) => EMAIL_REGEX.test(email);

export const isNonEmptyString = (value) => typeof value === 'string' && value.trim().length > 0;
