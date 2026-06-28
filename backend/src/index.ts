import { buildServer } from './app.js';
import { ensureJwtSecret } from './lib/jwt.js';

const server = buildServer();

const start = async () => {
  try {
    ensureJwtSecret();
    const port = Number(process.env.PORT) || 3000;
    await server.listen({ port, host: '0.0.0.0' });
  } catch (err) {
    server.log.error(err);
    process.exit(1);
  }
};

void start();
