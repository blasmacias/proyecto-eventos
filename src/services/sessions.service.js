import usersRepository from '../repositories/users.repository.js';
import { createHash } from '../utils/hash.js';
import { HttpError } from '../utils/httpError.js';
import {
  MIN_PASSWORD_LENGTH,
  isNonEmptyString,
  isValidEmail,
  normalizeEmail
} from '../utils/validators.js';
import { toPublicUser } from '../dto/user.dto.js';

const MONGO_DUPLICATE_KEY = 11000;

class SessionsService {
  constructor(repository) {
    this.repository = repository;
  }

  async register({ first_name, last_name, email, password } = {}) {
    const requiredFields = [first_name, last_name, email, password];
    if (!requiredFields.every(isNonEmptyString)) {
      throw new HttpError(400, 'Faltan campos obligatorios');
    }

    const normalizedEmail = normalizeEmail(email);
    if (!isValidEmail(normalizedEmail)) {
      throw new HttpError(400, 'El formato del email es inválido');
    }

    if (password.length < MIN_PASSWORD_LENGTH) {
      throw new HttpError(400, `La contraseña debe tener al menos ${MIN_PASSWORD_LENGTH} caracteres`);
    }

    const existingUser = await this.repository.getByEmail(normalizedEmail);
    if (existingUser) {
      throw new HttpError(409, 'El email ya está registrado');
    }

    try {
      const newUser = await this.repository.create({
        first_name: first_name.trim(),
        last_name: last_name.trim(),
        email: normalizedEmail,
        password: await createHash(password)
      });
      return toPublicUser(newUser);
    } catch (error) {
      if (error.code === MONGO_DUPLICATE_KEY) {
        throw new HttpError(409, 'El email ya está registrado');
      }
      throw error;
    }
  }
}

export default new SessionsService(usersRepository);
