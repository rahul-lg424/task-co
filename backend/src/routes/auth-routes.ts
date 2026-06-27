import type { FastifyInstance } from 'fastify';
import { authController } from '../controllers/auth-controller.js';

export const authRoutes = async (fastify: FastifyInstance) => {
  fastify.post('/register', authController.register);
  fastify.post('/login', authController.login);
};
