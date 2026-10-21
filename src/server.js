import app from './app.js';
import config, { validateEnv, missingMailEnv } from './config/config.js';
import { connectDB } from './config/db.js';

const startServer = async () => {
  try {
    validateEnv();

    const missingMail = missingMailEnv();
    if (missingMail.length > 0) {
      console.warn(`Emails desactivados: faltan ${missingMail.join(', ')} en el .env`);
    }

    await connectDB();
    app.listen(config.port, () => {
      console.log(`Servidor escuchando en el puerto ${config.port} (${config.nodeEnv})`);
    });
  } catch (error) {
    console.error('No se pudo iniciar el servidor:', error.message);
    process.exit(1);
  }
};

startServer();
