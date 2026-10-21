import { EVENT_STATUS } from '../models/Event.js';
import { HttpError } from './httpError.js';

export const PUBLIC_LIST_STATUSES = [EVENT_STATUS.PUBLISHED, EVENT_STATUS.CANCELLED, EVENT_STATUS.FINISHED];
export const SORTABLE_FIELDS = ['date', 'price', 'title', 'capacity', 'createdAt'];
export const DEFAULT_LIMIT = 10;
export const MAX_LIMIT = 50;

const escapeRegex = (text) => text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

const parsePositiveInt = (value, name, defaultValue, max = Infinity) => {
  if (value === undefined) return defaultValue;
  const number = Number(value);
  if (!Number.isInteger(number) || number < 1 || number > max) {
    const range = max === Infinity ? 'mayor a 0' : `entre 1 y ${max}`;
    throw new HttpError(400, `El parámetro ${name} debe ser un entero ${range}`);
  }
  return number;
};

const DATE_ONLY = /^\d{4}-\d{2}-\d{2}$/;
const END_OF_DAY = 'T23:59:59.999Z';

const parseDate = (value, name, { endOfDay = false } = {}) => {
  const text = String(value);
  const date = new Date(endOfDay && DATE_ONLY.test(text) ? `${text}${END_OF_DAY}` : text);
  if (Number.isNaN(date.getTime())) {
    throw new HttpError(400, `El parámetro ${name} debe ser una fecha válida (ej. 2026-12-31)`);
  }
  return date;
};

const parseSort = (value = 'date') => {
  const descending = value.startsWith('-');
  const field = descending ? value.slice(1) : value;
  if (!SORTABLE_FIELDS.includes(field)) {
    throw new HttpError(400, `El parámetro sort debe ser uno de: ${SORTABLE_FIELDS.join(', ')} (con - adelante para orden descendente)`);
  }
  return { [field]: descending ? -1 : 1, _id: 1 };
};

const buildFilter = ({ status, category, location, dateFrom, dateTo }) => {
  const filter = { status: EVENT_STATUS.PUBLISHED };

  if (status !== undefined) {
    if (!PUBLIC_LIST_STATUSES.includes(status)) {
      throw new HttpError(400, `El parámetro status debe ser uno de: ${PUBLIC_LIST_STATUSES.join(', ')}`);
    }
    filter.status = status;
  }

  if (category) filter.category = String(category).trim().toLowerCase();
  if (location) filter.location = { $regex: escapeRegex(String(location).trim()), $options: 'i' };

  if (dateFrom !== undefined || dateTo !== undefined) {
    const from = dateFrom !== undefined ? parseDate(dateFrom, 'dateFrom') : null;
    const to = dateTo !== undefined ? parseDate(dateTo, 'dateTo', { endOfDay: true }) : null;
    if (from && to && from > to) {
      throw new HttpError(400, 'dateFrom no puede ser posterior a dateTo');
    }
    filter.date = {};
    if (from) filter.date.$gte = from;
    if (to) filter.date.$lte = to;
  }

  return filter;
};

export const parseEventQuery = (query = {}) => ({
  filter: buildFilter(query),
  page: parsePositiveInt(query.page, 'page', 1),
  limit: parsePositiveInt(query.limit, 'limit', DEFAULT_LIMIT, MAX_LIMIT),
  sort: parseSort(query.sort)
});
