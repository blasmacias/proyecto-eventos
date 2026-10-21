import mongoose from 'mongoose';
import { connectDB } from '../src/config/db.js';
import usersRepository from '../src/repositories/users.repository.js';
import { ROLE_VALUES } from '../src/config/roles.js';
import { normalizeEmail } from '../src/utils/validators.js';

const [, , email, role] = process.argv;

const run = async () => {
  if (!email || !ROLE_VALUES.includes(role)) {
    throw new Error(`Uso: npm run set-role -- <email> <${ROLE_VALUES.join('|')}>`);
  }

  await connectDB();

  const user = await usersRepository.getByEmail(normalizeEmail(email));
  if (!user) {
    throw new Error(`No existe un usuario con el email ${email}`);
  }

  await usersRepository.updateRole(user._id, role);
  console.log(`Rol de ${user.email} actualizado a "${role}"`);
};

run()
  .catch((error) => {
    console.error(error.message);
    process.exitCode = 1;
  })
  .finally(() => mongoose.disconnect());
