import dotenv from 'dotenv';

dotenv.config();

const nodeEnv = process.env.NODE_ENV || 'development';

const config = {
  port: process.env.PORT || 8080,
  nodeEnv,
  isProduction: nodeEnv === 'production',
  mongoUrl: process.env.MONGO_URL,
  jwtSecret: process.env.JWT_SECRET,
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '1h',
  bcryptSaltRounds: Number(process.env.BCRYPT_SALT_ROUNDS) || 10
};

const REQUIRED_ENV = ['MONGO_URL', 'JWT_SECRET'];

export const validateEnv = () => {
  const missing = REQUIRED_ENV.filter((key) => !process.env[key]);
  if (missing.length > 0) {
    throw new Error(`Faltan variables de entorno: ${missing.join(', ')}`);
  }
};

export default config;
