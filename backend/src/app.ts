import Fastify from 'fastify';
import { authRoutes } from './routes/auth-routes.js';

export const buildServer = () => {
  const server = Fastify({ logger: false });

  server.get('/', async () => ({
    data: {
      status: 'ok',
    },
  }));

  server.register(authRoutes, { prefix: '/auth' });

  return server;
};
