import type { FastifyReply, FastifyRequest } from 'fastify';
import {
  createTaskSchema,
  taskFilterSchema,
  updateTaskSchema,
  type CreateTaskInput,
  type TaskFilterInput,
  type UpdateTaskInput,
} from '../schemas/task-schema.js';
import { taskService } from '../services/task-service.js';

const projectNotFound = {
  error: {
    message: 'Project not found',
    code: 'PROJECT_NOT_FOUND',
  },
};

const taskNotFound = {
  error: {
    message: 'Task not found',
    code: 'TASK_NOT_FOUND',
  },
};

const internalError = {
  error: {
    message: 'Internal server error',
    code: 'INTERNAL_SERVER_ERROR',
  },
};

export const taskController = {
  async list(
    request: FastifyRequest<{ Params: { id: string }; Querystring: TaskFilterInput }>,
    reply: FastifyReply,
  ) {
    const parsed = taskFilterSchema.safeParse(request.query);

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
      const tasks = await taskService.listTasks({
        projectId: request.params.id,
        ownerId: request.user.id,
        filters: parsed.data,
      });

      if (tasks === null) {
        return reply.code(404).send(projectNotFound);
      }

      return reply.code(200).send({ data: { tasks } });
    } catch {
      return reply.code(500).send(internalError);
    }
  },

  async create(
    request: FastifyRequest<{ Params: { id: string }; Body: CreateTaskInput }>,
    reply: FastifyReply,
  ) {
    const parsed = createTaskSchema.safeParse(request.body);

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
      const task = await taskService.createTask({
        projectId: request.params.id,
        ownerId: request.user.id,
        data: parsed.data,
      });

      if (task === null) {
        return reply.code(404).send(projectNotFound);
      }

      return reply.code(201).send({ data: { task } });
    } catch {
      return reply.code(500).send(internalError);
    }
  },

  async update(
    request: FastifyRequest<{ Params: { id: string }; Body: UpdateTaskInput }>,
    reply: FastifyReply,
  ) {
    const parsed = updateTaskSchema.safeParse(request.body);

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
      const task = await taskService.updateTask({
        id: request.params.id,
        ownerId: request.user.id,
        data: parsed.data,
      });

      if (task === null) {
        return reply.code(404).send(taskNotFound);
      }

      return reply.code(200).send({ data: { task } });
    } catch {
      return reply.code(500).send(internalError);
    }
  },

  async remove(request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) {
    try {
      const deletedId = await taskService.deleteTask({
        id: request.params.id,
        ownerId: request.user.id,
      });

      if (deletedId === null) {
        return reply.code(404).send(taskNotFound);
      }

      return reply.code(200).send({ data: { id: deletedId } });
    } catch {
      return reply.code(500).send(internalError);
    }
  },
};
