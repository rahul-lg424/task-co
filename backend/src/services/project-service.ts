import { prisma } from '../lib/prisma.js';
import type { CreateProjectInput, UpdateProjectInput } from '../schemas/project-schema.js';

const projectSelect = {
  id: true,
  name: true,
  description: true,
  color: true,
  ownerId: true,
  createdAt: true,
  // Live task count for the dashboard cards and project header.
  _count: { select: { tasks: true } },
} as const;

export const projectService = {
  async createProject(input: CreateProjectInput & { ownerId: string }) {
    return prisma.project.create({
      data: {
        ownerId: input.ownerId,
        name: input.name,
        description: input.description,
        color: input.color,
      },
      select: projectSelect,
    });
  },

  async listProjects(input: { ownerId: string }) {
    return prisma.project.findMany({
      where: { ownerId: input.ownerId },
      select: projectSelect,
      orderBy: { createdAt: 'desc' },
    });
  },

  async getProject(input: { id: string; ownerId: string }) {
    // projectSelect includes _count.tasks, so the header/count is live.
    return prisma.project.findFirst({
      where: { id: input.id, ownerId: input.ownerId },
      select: projectSelect,
    });
  },

  async updateProject(input: { id: string; ownerId: string; data: UpdateProjectInput }) {
    const existing = await prisma.project.findFirst({
      where: { id: input.id, ownerId: input.ownerId },
      select: { id: true },
    });

    if (!existing) {
      return null;
    }

    return prisma.project.update({
      where: { id: input.id },
      data: input.data,
      select: projectSelect,
    });
  },

  async deleteProject(input: { id: string; ownerId: string }) {
    const existing = await prisma.project.findFirst({
      where: { id: input.id, ownerId: input.ownerId },
      select: { id: true },
    });

    if (!existing) {
      return false;
    }

    // Deleting the project also removes its tasks via the onDelete: Cascade that
    // will be defined on the Task→Project relation in a later lab. No manual task
    // deletion here — the Task model doesn't exist yet.
    await prisma.project.delete({ where: { id: input.id } });
    return true;
  },
};
