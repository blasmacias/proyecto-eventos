import mongoose from 'mongoose';
import { connectDB } from '../src/config/db.js';
import usersRepository from '../src/repositories/users.repository.js';
import eventsRepository from '../src/repositories/events.repository.js';
import { PERMISSIONS } from '../src/config/permissions.js';
import { normalizeEmail } from '../src/utils/validators.js';

const [, , email] = process.argv;

const CITIES = ['Buenos Aires', 'Córdoba', 'Rosario', 'Mendoza'];
const CATEGORIES = ['workshop', 'workshop', 'workshop', 'charla', 'workshop', 'recital'];
const TOTAL_EVENTS = 12;
const DAY_MS = 24 * 60 * 60 * 1000;

const buildEvent = (index, organizer) => {
  const category = CATEGORIES[index % CATEGORIES.length];
  return {
    title: `${category[0].toUpperCase()}${category.slice(1)} de prueba #${index + 1}`,
    description: `Evento de ejemplo generado por seed-events (${category})`,
    category,
    date: new Date(Date.now() + (index + 1) * 7 * DAY_MS),
    location: CITIES[index % CITIES.length],
    capacity: 20 + index * 5,
    price: index % 3 === 0 ? 0 : 1000 * index,
    status: 'published',
    organizer
  };
};

const run = async () => {
  if (!email) {
    throw new Error('Uso: npm run seed:events -- <email de un organizer o admin>');
  }

  await connectDB();

  const user = await usersRepository.getByEmail(normalizeEmail(email));
  if (!user) {
    throw new Error(`No existe un usuario con el email ${email}`);
  }
  if (!PERMISSIONS.CREATE_EVENT.includes(user.role)) {
    throw new Error(`${user.email} tiene rol "${user.role}" y no puede organizar eventos`);
  }

  for (let index = 0; index < TOTAL_EVENTS; index += 1) {
    await eventsRepository.create(buildEvent(index, user._id));
  }

  const workshops = Array.from({ length: TOTAL_EVENTS }, (_, i) => CATEGORIES[i % CATEGORIES.length])
    .filter((category) => category === 'workshop').length;
  console.log(`Se crearon ${TOTAL_EVENTS} eventos publicados (${workshops} de categoría workshop) para ${user.email}`);
};

run()
  .catch((error) => {
    console.error(error.message);
    process.exitCode = 1;
  })
  .finally(() => mongoose.disconnect());
