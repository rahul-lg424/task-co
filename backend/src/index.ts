import Fastify from 'fastify';
import { authRoutes } from './routes/auth-routes.js';
import { ensureJwtSecret } from './lib/jwt.js';

const server = Fastify({ logger: false });

server.get('/', async () => ({
  data: {
    status: 'ok',
  },
}));

server.register(authRoutes, { prefix: '/auth' });

const start = async () => {
  try {
    ensureJwtSecret();
    await server.listen({ port: 3000, host: '0.0.0.0' });
  } catch (err) {
    server.log.error(err);
    process.exit(1);
  }
};

void start();
