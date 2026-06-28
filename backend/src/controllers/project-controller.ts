import type { FastifyReply, FastifyRequest } from 'fastify';
import {
  createProjectSchema,
  updateProjectSchema,
  type CreateProjectInput,
  type UpdateProjectInput,
} from '../schemas/project-schema.js';
import { projectService } from '../services/project-service.js';

const projectNotFound = {
  error: {
    message: 'Project not found',
    code: 'PROJECT_NOT_FOUND',
  },
};

export const projectController = {
  async create(request: FastifyRequest<{ Body: CreateProjectInput }>, reply: FastifyReply) {
    const parsed = createProjectSchema.safeParse(request.body);

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
      const project = await projectService.createProject({
        ownerId: request.user.id,
        ...parsed.data,
      });

      return reply.code(201).send({
        data: { project },
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

  async list(request: FastifyRequest, reply: FastifyReply) {
    try {
      const projects = await projectService.listProjects({
        ownerId: request.user.id,
      });

      return reply.code(200).send({
        data: { projects },
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

  async getOne(request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) {
    try {
      const project = await projectService.getProject({
        id: request.params.id,
        ownerId: request.user.id,
      });

      if (!project) {
        return reply.code(404).send(projectNotFound);
      }

      return reply.code(200).send({
        data: { project },
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

  async update(
    request: FastifyRequest<{ Params: { id: string }; Body: UpdateProjectInput }>,
    reply: FastifyReply,
  ) {
    const parsed = updateProjectSchema.safeParse(request.body);

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
      const project = await projectService.updateProject({
        id: request.params.id,
        ownerId: request.user.id,
        data: parsed.data,
      });

      if (!project) {
        return reply.code(404).send(projectNotFound);
      }

      return reply.code(200).send({
        data: { project },
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

  async remove(request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) {
    try {
      const deleted = await projectService.deleteProject({
        id: request.params.id,
        ownerId: request.user.id,
      });

      if (!deleted) {
        return reply.code(404).send(projectNotFound);
      }

      return reply.code(200).send({
        data: { deleted: true },
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
