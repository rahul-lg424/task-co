import { useNavigate } from 'react-router-dom';
import type { Project } from '../types';

interface ProjectCardProps {
  project: Project;
}

// Single dashboard card. The whole card is clickable and navigates to the
// project view. The accent comes from the project's `color` via inline style.
export const ProjectCard = ({ project }: ProjectCardProps) => {
  const navigate = useNavigate();

  // Task count is read defensively — the list endpoint may not include it yet.
  const taskCount = project.taskCount ?? project._count?.tasks ?? 0;

  return (
    <button
      type="button"
      onClick={() => navigate(`/projects/${project.id}`)}
      style={{ borderLeftColor: project.color }}
      className="block w-full text-left bg-white rounded-lg p-6 border-l-4 hover:shadow-md transition-shadow focus:outline-none focus:ring-2 focus:ring-blue-500"
    >
      <h3 className="text-gray-900 font-semibold truncate">{project.name}</h3>
      <p className="text-gray-600 text-sm mt-1 line-clamp-2">
        {project.description?.trim() ? project.description : 'No description'}
      </p>
      <p className="text-gray-600 text-sm mt-3">
        {taskCount} {taskCount === 1 ? 'task' : 'tasks'}
      </p>
    </button>
  );
};
