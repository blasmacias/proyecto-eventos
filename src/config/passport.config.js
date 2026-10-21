import passport from 'passport';
import passportLocal from 'passport-local';
import passportJwt from 'passport-jwt';
import config from './config.js';
import { AUTH_COOKIE_NAME } from './cookies.js';
import usersRepository from '../repositories/users.repository.js';
import { createHash, isValidPassword } from '../utils/hash.js';
import {
  MIN_PASSWORD_LENGTH,
  isNonEmptyString,
  isValidEmail,
  normalizeEmail
} from '../utils/validators.js';
import { toPublicUser } from '../dto/user.dto.js';

const LocalStrategy = passportLocal.Strategy;
const JwtStrategy = passportJwt.Strategy;

const MONGO_DUPLICATE_KEY = 11000;
const INVALID_CREDENTIALS = 'Credenciales inválidas';

const rejectWith = (done, status, message) => done(null, false, { status, message });

const localOptions = {
  usernameField: 'email',
  passwordField: 'password',
  passReqToCallback: true,
  session: false
};

const registerStrategy = new LocalStrategy(localOptions, async (req, email, password, done) => {
  try {
    const { first_name, last_name } = req.body;

    if (![first_name, last_name, email, password].every(isNonEmptyString)) {
      return rejectWith(done, 400, 'Faltan campos obligatorios');
    }

    const normalizedEmail = normalizeEmail(email);
    if (!isValidEmail(normalizedEmail)) {
      return rejectWith(done, 400, 'El formato del email es inválido');
    }

    if (password.length < MIN_PASSWORD_LENGTH) {
      return rejectWith(done, 400, `La contraseña debe tener al menos ${MIN_PASSWORD_LENGTH} caracteres`);
    }

    const existingUser = await usersRepository.getByEmail(normalizedEmail);
    if (existingUser) {
      return rejectWith(done, 409, 'El email ya está registrado');
    }

    const newUser = await usersRepository.create({
      first_name: first_name.trim(),
      last_name: last_name.trim(),
      email: normalizedEmail,
      password: await createHash(password)
    });

    return done(null, toPublicUser(newUser));
  } catch (error) {
    if (error.code === MONGO_DUPLICATE_KEY) {
      return rejectWith(done, 409, 'El email ya está registrado');
    }
    return done(error);
  }
});

const loginStrategy = new LocalStrategy(localOptions, async (req, email, password, done) => {
  try {
    if (!isNonEmptyString(email) || !isNonEmptyString(password)) {
      return rejectWith(done, 400, 'Faltan campos obligatorios');
    }

    const user = await usersRepository.getByEmail(normalizeEmail(email));
    const passwordMatches = user ? await isValidPassword(password, user.password) : false;

    if (!passwordMatches) {
      return rejectWith(done, 401, INVALID_CREDENTIALS);
    }

    return done(null, toPublicUser(user));
  } catch (error) {
    return done(error);
  }
});

const cookieExtractor = (req) => req?.cookies?.[AUTH_COOKIE_NAME] ?? null;

const currentStrategy = new JwtStrategy(
  {
    jwtFromRequest: cookieExtractor,
    secretOrKeyProvider: (req, rawToken, done) => done(null, config.jwtSecret)
  },
  ({ id, email, role }, done) => done(null, { id, email, role })
);

const strategies = {
  register: registerStrategy,
  login: loginStrategy,
  current: currentStrategy
};

export const initializePassport = () => {
  Object.entries(strategies).forEach(([name, strategy]) => passport.use(name, strategy));
  return passport.initialize();
};
