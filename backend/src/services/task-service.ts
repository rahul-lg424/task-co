import { prisma } from '../lib/prisma.js';
import type { CreateTaskInput, TaskFilterInput, UpdateTaskInput } from '../schemas/task-schema.js';

const taskSelect = {
  id: true,
  title: true,
  description: true,
  status: true,
  priority: true,
  dueDate: true,
  projectId: true,
  createdAt: true,
} as const;

// Ownership is enforced through the parent project: a user may only touch tasks
// that belong to a project they own. Reads/writes are scoped by ownerId either
// directly (project lookup) or via the `project: { ownerId }` relation filter.
export const taskService = {
  async listTasks(input: { projectId: string; ownerId: string; filters: TaskFilterInput }) {
    const project = await prisma.project.findFirst({
      where: { id: input.projectId, ownerId: input.ownerId },
      select: { id: true },
    });

    if (!project) {
      return null;
    }

    // Undefined filters are ignored by Prisma, so omitting them returns all tasks.
    return prisma.task.findMany({
      where: {
        projectId: input.projectId,
        status: input.filters.status,
        priority: input.filters.priority,
      },
      select: taskSelect,
      orderBy: { createdAt: 'desc' },
    });
  },

  async createTask(input: { projectId: string; ownerId: string; data: CreateTaskInput }) {
    const project = await prisma.project.findFirst({
      where: { id: input.projectId, ownerId: input.ownerId },
      select: { id: true },
    });

    if (!project) {
      return null;
    }

    return prisma.task.create({
      data: {
        projectId: input.projectId,
        title: input.data.title,
        description: input.data.description,
        status: input.data.status,
        priority: input.data.priority,
        dueDate: input.data.dueDate,
      },
      select: taskSelect,
    });
  },

  async updateTask(input: { id: string; ownerId: string; data: UpdateTaskInput }) {
    const existing = await prisma.task.findFirst({
      where: { id: input.id, project: { ownerId: input.ownerId } },
      select: { id: true },
    });

    if (!existing) {
      return null;
    }

    return prisma.task.update({
      where: { id: input.id },
      data: input.data,
      select: taskSelect,
    });
  },

  async deleteTask(input: { id: string; ownerId: string }) {
    const existing = await prisma.task.findFirst({
      where: { id: input.id, project: { ownerId: input.ownerId } },
      select: { id: true },
    });

    if (!existing) {
      return null;
    }

    await prisma.task.delete({ where: { id: input.id } });
    return input.id;
  },
};
