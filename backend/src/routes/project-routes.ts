import type { FastifyInstance } from 'fastify';
import { projectController } from '../controllers/project-controller.js';
import { authenticate } from '../middleware/auth-middleware.js';
import type { CreateProjectInput, UpdateProjectInput } from '../schemas/project-schema.js';

export const projectRoutes = async (fastify: FastifyInstance) => {
  fastify.post<{ Body: CreateProjectInput }>('/', { preHandler: authenticate }, projectController.create);
  fastify.get('/', { preHandler: authenticate }, projectController.list);
  fastify.get<{ Params: { id: string } }>('/:id', { preHandler: authenticate }, projectController.getOne);
  fastify.patch<{ Params: { id: string }; Body: UpdateProjectInput }>(
    '/:id',
    { preHandler: authenticate },
    projectController.update,
  );
  fastify.delete<{ Params: { id: string } }>('/:id', { preHandler: authenticate }, projectController.remove);
};
