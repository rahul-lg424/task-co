import type { FastifyInstance } from 'fastify';
import { taskController } from '../controllers/task-controller.js';
import { authenticate } from '../middleware/auth-middleware.js';
import type { CreateTaskInput, TaskFilterInput, UpdateTaskInput } from '../schemas/task-schema.js';

// Registered with no prefix — the full paths are declared here because tasks span
// two resources (/projects/:id/tasks for the collection, /tasks/:id for an item).
export const taskRoutes = async (fastify: FastifyInstance) => {
  fastify.get<{ Params: { id: string }; Querystring: TaskFilterInput }>(
    '/projects/:id/tasks',
    { preHandler: authenticate },
    taskController.list,
  );
  fastify.post<{ Params: { id: string }; Body: CreateTaskInput }>(
    '/projects/:id/tasks',
    { preHandler: authenticate },
    taskController.create,
  );
  fastify.patch<{ Params: { id: string }; Body: UpdateTaskInput }>(
    '/tasks/:id',
    { preHandler: authenticate },
    taskController.update,
  );
  fastify.delete<{ Params: { id: string } }>(
    '/tasks/:id',
    { preHandler: authenticate },
    taskController.remove,
  );
};
