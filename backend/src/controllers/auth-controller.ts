import type { FastifyReply, FastifyRequest } from 'fastify';
import { loginSchema, registerSchema, type LoginInput, type RegisterInput } from '../schemas/auth-schema.js';
import { authService } from '../services/auth-service.js';

export const authController = {
  async register(request: FastifyRequest<{ Body: RegisterInput }>, reply: FastifyReply) {
    const parsed = registerSchema.safeParse(request.body);

    if (!parsed.success) {
      const firstIssue = parsed.error.issues[0];
      return reply.code(400).send({
        error: {
          message: firstIssue?.message ?? 'Validation failed',
          code: 'VALIDATION_ERROR',
        },
      });
    }

    try {
      const result = await authService.registerUser(parsed.data);

      return reply.code(201).send({
        data: result,
      });
    } catch (error) {
      // Duplicate email is reported generically so the response does not confirm
      // whether an account already exists (avoids user enumeration). Note: full
      // mitigation would require an email-verification flow; a distinct failure
      // on otherwise-valid input is still a weak timing/behavior signal.
      if ((error as Error & { code?: string }).code === 'EMAIL_ALREADY_EXISTS') {
        return reply.code(400).send({
          error: {
            message: 'Unable to register with the provided information',
            code: 'REGISTRATION_FAILED',
          },
        });
      }

      return reply.code(500).send({
        error: {
          message: 'Internal server error',
          code: 'INTERNAL_SERVER_ERROR',
        },
      });
    }
  },

  async login(request: FastifyRequest<{ Body: LoginInput }>, reply: FastifyReply) {
    const parsed = loginSchema.safeParse(request.body);

    if (!parsed.success) {
      const firstIssue = parsed.error.issues[0];
      return reply.code(400).send({
        error: {
          message: firstIssue?.message ?? 'Validation failed',
          code: 'VALIDATION_ERROR',
        },
      });
    }

    try {
      const result = await authService.loginUser(parsed.data);

      return reply.code(200).send({
        data: result,
      });
    } catch (error) {
      if ((error as Error & { code?: string }).code === 'INVALID_CREDENTIALS') {
        return reply.code(401).send({
          error: {
            message: 'Invalid email or password',
            code: 'INVALID_CREDENTIALS',
          },
        });
      }

      return reply.code(500).send({
        error: {
          message: 'Internal server error',
          code: 'INTERNAL_SERVER_ERROR',
        },
      });
    }
  },

  async getMe(request: FastifyRequest, reply: FastifyReply) {
    try {
      const user = await authService.getUserById(request.user.id);

      if (!user) {
        return reply.code(404).send({
          error: {
            message: 'User not found',
            code: 'USER_NOT_FOUND',
          },
        });
      }

      return reply.code(200).send({
        data: user,
      });
    } catch {
      return reply.code(500).send({
        error: {
          message: 'Internal server error',
          code: 'INTERNAL_SERVER_ERROR',
        },
      });
    }
  },
};
