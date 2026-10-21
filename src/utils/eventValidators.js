import { isNonEmptyString } from './validators.js';

export const EVENT_EDITABLE_FIELDS = ['title', 'description', 'date', 'location', 'capacity'];
export const EVENT_REQUIRED_FIELDS = ['title', 'date', 'location', 'capacity'];

const isValidDate = (value) =>
  (typeof value === 'string' || typeof value === 'number') && !Number.isNaN(new Date(value).getTime());

const isValidCapacity = (value) => Number.isInteger(value) && value >= 1;

const FIELD_RULES = {
  title: { isValid: isNonEmptyString, message: 'El título no puede estar vacío' },
  description: { isValid: (value) => typeof value === 'string', message: 'La descripción debe ser un texto' },
  date: { isValid: isValidDate, message: 'La fecha es inválida' },
  location: { isValid: isNonEmptyString, message: 'La ubicación no puede estar vacía' },
  capacity: { isValid: isValidCapacity, message: 'El cupo debe ser un número entero mayor a 0' }
};

export const pickEditableFields = (body = {}) =>
  Object.fromEntries(
    EVENT_EDITABLE_FIELDS.filter((field) => body[field] !== undefined).map((field) => [field, body[field]])
  );

export const findInvalidField = (data) => {
  const invalidField = Object.keys(data).find((field) => !FIELD_RULES[field].isValid(data[field]));
  return invalidField ? FIELD_RULES[invalidField].message : null;
};

export const normalizeEventData = (data) => {
  const normalized = { ...data };
  ['title', 'description', 'location'].forEach((field) => {
    if (typeof normalized[field] === 'string') normalized[field] = normalized[field].trim();
  });
  if (normalized.date !== undefined) normalized.date = new Date(normalized.date);
  return normalized;
};
