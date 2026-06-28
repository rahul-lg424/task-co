import type { FastifyInstance } from 'fastify';
import rateLimit from '@fastify/rate-limit';
import { authController } from '../controllers/auth-controller.js';
import { authenticate } from '../middleware/auth-middleware.js';

export const authRoutes = async (fastify: FastifyInstance) => {
  // Rate limiter scoped to this plugin. global: false → routes opt in via
  // `config.rateLimit`, so only the credential endpoints are throttled (not /me,
  // which a SPA calls often). On exceed, the plugin throws a 429 error which the
  // global setErrorHandler renders as the standard { error: { code:'RATE_LIMITED' } }.
  await fastify.register(rateLimit, { global: false });

  const authLimit = { rateLimit: { max: 10, timeWindow: '1 minute' } };

  fastify.post('/register', { config: authLimit }, authController.register);
  fastify.post('/login', { config: authLimit }, authController.login);
  fastify.get('/me', { preHandler: authenticate }, authController.getMe);
};
