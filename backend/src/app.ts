import Fastify from 'fastify';
import type { FastifyError } from 'fastify';
import cors from '@fastify/cors';
import { authRoutes } from './routes/auth-routes.js';
import { projectRoutes } from './routes/project-routes.js';
import { taskRoutes } from './routes/task-routes.js';

export const buildServer = () => {
  const server = Fastify({ logger: false });

  // Allow the frontend dev origin (Vite on :5173 by default) to call the API
  // cross-origin. Credentials aren't needed — auth travels in the Authorization
  // header, not cookies. Override the origin via CORS_ORIGIN if needed.
  server.register(cors, {
    origin: process.env.CORS_ORIGIN ?? 'http://localhost:5173',
    methods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS'],
  });

  server.get('/', async () => ({
    data: {
      status: 'ok',
    },
  }));

  server.register(authRoutes, { prefix: '/auth' });
  server.register(projectRoutes, { prefix: '/projects' });
  server.register(taskRoutes);

  // Unknown routes return the standard { error } envelope instead of Fastify's
  // default { message, error, statusCode } shape.
  server.setNotFoundHandler((_request, reply) => {
    reply.code(404).send({
      error: {
        message: 'Route not found',
        code: 'NOT_FOUND',
      },
    });
  });

  // Central error handler so unhandled errors (e.g. malformed JSON body) never
  // leak stack traces / internal messages. 5xx are collapsed to a generic
  // message; 4xx keep their (request-level, non-sensitive) message.
  server.setErrorHandler((error: FastifyError, _request, reply) => {
    // statusCode can live on the error (most cases) or on the reply (e.g.
    // @fastify/rate-limit sets reply.code(429) before throwing).
    const statusCode = error.statusCode ?? reply.statusCode ?? 500;

    if (statusCode === 429) {
      return reply.code(429).send({
        error: {
          message: 'Too many requests, please try again later',
          code: 'RATE_LIMITED',
        },
      });
    }

    if (statusCode >= 400 && statusCode < 500) {
      return reply.code(statusCode).send({
        error: {
          message: error.message,
          code: 'BAD_REQUEST',
        },
      });
    }

    return reply.code(500).send({
      error: {
        message: 'Internal server error',
        code: 'INTERNAL_SERVER_ERROR',
      },
    });
  });

  return server;
};
