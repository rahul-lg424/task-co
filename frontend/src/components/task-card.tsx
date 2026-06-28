import { PriorityBadge } from './priority-badge';
import { StatusBadge } from './status-badge';
import type { Status, Task } from '../types';

interface TaskCardProps {
  task: Task;
  onToggleStatus: (task: Task) => void;
  onDelete: (task: Task) => void;
}

// TODO -> IN_PROGRESS -> DONE -> TODO
const NEXT_STATUS: Record<Status, Status> = {
  TODO: 'IN_PROGRESS',
  IN_PROGRESS: 'DONE',
  DONE: 'TODO',
};

const dateFormatter = new Intl.DateTimeFormat('en-US', {
  month: 'short',
  day: 'numeric',
  year: 'numeric',
});

const formatDueDate = (iso: string) => dateFormatter.format(new Date(iso));

const isOverdue = (task: Task) =>
  task.dueDate != null && task.status !== 'DONE' && new Date(task.dueDate).getTime() < Date.now();

// Mirrors the dashboard project card styling (bg-white rounded-lg p-6).
export const TaskCard = ({ task, onToggleStatus, onDelete }: TaskCardProps) => {
  const overdue = isOverdue(task);

  return (
    <div className="bg-white rounded-lg p-6 space-y-3">
      <div className="flex items-start justify-between gap-3">
        <h3 className="text-gray-900 font-semibold">{task.title}</h3>
        <button
          type="button"
          onClick={() => onDelete(task)}
          className="text-gray-400 hover:text-red-600 text-sm"
          title="Delete task"
          aria-label="Delete task"
        >
          ✕
        </button>
      </div>

      <p className="text-gray-600 text-sm line-clamp-2">
        {task.description?.trim() ? task.description : 'No description'}
      </p>

      <div className="flex flex-wrap items-center gap-2">
        <PriorityBadge priority={task.priority} />
        <StatusBadge
          status={task.status}
          onClick={() => onToggleStatus({ ...task, status: NEXT_STATUS[task.status] })}
          title="Click to change status"
        />
      </div>

      <p className={`text-sm ${overdue ? 'text-red-600' : 'text-gray-600'}`}>
        {task.dueDate ? `Due ${formatDueDate(task.dueDate)}` : 'No due date'}
      </p>
    </div>
  );
};
