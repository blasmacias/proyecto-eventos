import { isNonEmptyString } from './validators.js';

export const EVENT_EDITABLE_FIELDS = ['title', 'description', 'category', 'date', 'location', 'capacity', 'price'];
export const EVENT_REQUIRED_FIELDS = ['title', 'description', 'category', 'date', 'location', 'capacity'];

const isValidDate = (value) =>
  (typeof value === 'string' || typeof value === 'number') && !Number.isNaN(new Date(value).getTime());

const FIELD_RULES = {
  title: { isValid: isNonEmptyString, message: 'El título no puede estar vacío' },
  description: { isValid: isNonEmptyString, message: 'La descripción no puede estar vacía' },
  category: { isValid: isNonEmptyString, message: 'La categoría no puede estar vacía' },
  date: { isValid: isValidDate, message: 'La fecha es inválida' },
  location: { isValid: isNonEmptyString, message: 'La ubicación no puede estar vacía' },
  capacity: {
    isValid: (value) => Number.isInteger(value) && value > 0,
    message: 'El cupo (capacity) debe ser un número entero mayor a 0'
  },
  price: {
    isValid: (value) => typeof value === 'number' && Number.isFinite(value) && value >= 0,
    message: 'El precio (price) debe ser un número mayor o igual a 0'
  }
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
  ['title', 'description', 'category', 'location'].forEach((field) => {
    if (typeof normalized[field] === 'string') normalized[field] = normalized[field].trim();
  });
  if (typeof normalized.category === 'string') normalized.category = normalized.category.toLowerCase();
  if (normalized.date !== undefined) normalized.date = new Date(normalized.date);
  return normalized;
};
