import type { FastifyReply, FastifyRequest } from 'fastify';
import { errors, jwtVerify } from 'jose';
import { ensureJwtSecret } from '../lib/jwt.js';

export const authenticate = async (request: FastifyRequest, reply: FastifyReply) => {
  const authorization = request.headers.authorization;

  if (!authorization || !authorization.startsWith('Bearer ')) {
    return reply.code(401).send({
      error: {
        message: 'Authentication required',
        code: 'MISSING_TOKEN',
      },
    });
  }

  const token = authorization.slice('Bearer '.length).trim();

  if (!token) {
    return reply.code(401).send({
      error: {
        message: 'Authentication required',
        code: 'MISSING_TOKEN',
      },
    });
  }

  const secretBytes = new TextEncoder().encode(ensureJwtSecret());

  try {
    const { payload } = await jwtVerify(token, secretBytes, { algorithms: ['HS256'] });

    request.user = {
      id: payload.sub as string,
      email: payload.email as string,
    };
  } catch (error) {
    if (error instanceof errors.JWTExpired) {
      return reply.code(401).send({
        error: {
          message: 'Token expired',
          code: 'TOKEN_EXPIRED',
        },
      });
    }

    return reply.code(401).send({
      error: {
        message: 'Invalid token',
        code: 'INVALID_TOKEN',
      },
    });
  }
};
