import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { fetchProject } from '../store/projects-slice';
import {
  createTask,
  deleteTask,
  fetchTasks,
  updateTask,
  type PriorityFilter,
  type StatusFilter,
} from '../store/tasks-slice';
import { FilterBar } from '../components/filter-bar';
import { TaskCard } from '../components/task-card';
import { TaskForm, type NewTaskValues } from '../components/task-form';
import type { Task } from '../types';

const SkeletonList = () => (
  <div className="space-y-4">
    {Array.from({ length: 3 }).map((_, index) => (
      <div key={index} className="bg-white rounded-lg p-6 animate-pulse">
        <div className="h-5 w-1/2 bg-gray-200 rounded" />
        <div className="h-4 w-full bg-gray-100 rounded mt-3" />
        <div className="h-4 w-1/4 bg-gray-100 rounded mt-3" />
      </div>
    ))}
  </div>
);

export const ProjectPage = () => {
  const { id } = useParams();
  const dispatch = useAppDispatch();

  const { selected, selectedStatus, selectedError } = useAppSelector((state) => state.projects);
  const { items, status, error } = useAppSelector((state) => state.tasks);

  const [statusFilter, setStatusFilter] = useState<StatusFilter>('ALL');
  const [priorityFilter, setPriorityFilter] = useState<PriorityFilter>('ALL');
  const [actionError, setActionError] = useState<string | null>(null);

  // Project header (GET /projects/:id).
  useEffect(() => {
    if (id) {
      void dispatch(fetchProject(id));
    }
  }, [id, dispatch]);

  // Tasks refetch whenever the project id or a filter changes — the filter
  // values act as part of the "query key".
  useEffect(() => {
    if (id) {
      void dispatch(
        fetchTasks({ projectId: id, filters: { status: statusFilter, priority: priorityFilter } }),
      );
    }
  }, [id, statusFilter, priorityFilter, dispatch]);

  if (!id) {
    return (
      <div className="bg-red-100 text-red-800 rounded-lg px-4 py-2">Missing project id.</div>
    );
  }

  // Re-fetch tasks (with active filters) and the project (for its count) after a
  // mutation — the Redux equivalent of invalidating ['tasks', id] and ['project', id].
  const refresh = () => {
    void dispatch(
      fetchTasks({ projectId: id, filters: { status: statusFilter, priority: priorityFilter } }),
    );
    void dispatch(fetchProject(id));
  };

  const handleCreate = async (values: NewTaskValues) => {
    // Let errors propagate so TaskForm can show them and keep the input.
    await dispatch(createTask({ projectId: id, ...values })).unwrap();
    refresh();
  };

  const handleToggle = async (task: Task) => {
    setActionError(null);
    try {
      // task.status is already the NEXT status (computed in TaskCard).
      await dispatch(updateTask({ id: task.id, status: task.status })).unwrap();
      refresh();
    } catch (caught) {
      setActionError(typeof caught === 'string' ? caught : 'Failed to update task');
    }
  };

  const handleDelete = async (task: Task) => {
    setActionError(null);
    try {
      await dispatch(deleteTask(task.id)).unwrap();
      refresh();
    } catch (caught) {
      setActionError(typeof caught === 'string' ? caught : 'Failed to delete task');
    }
  };

  const filtersActive = statusFilter !== 'ALL' || priorityFilter !== 'ALL';
  const taskCount = selected ? selected.taskCount ?? selected._count?.tasks ?? 0 : 0;
  const tasksLoading = status === 'loading' || status === 'idle';

  return (
    <div className="space-y-6">
      {selectedStatus === 'failed' ? (
        <div className="bg-red-100 text-red-800 rounded-lg px-4 py-2">
          {selectedError ?? 'Failed to load project.'}
        </div>
      ) : (
        <div>
          <h1 className="text-3xl text-gray-900 font-semibold">{selected?.name ?? 'Project'}</h1>
          {selected?.description?.trim() ? (
            <p className="text-gray-600 mt-1">{selected.description}</p>
          ) : null}
          <p className="text-gray-600 text-sm mt-2">
            {taskCount} {taskCount === 1 ? 'task' : 'tasks'}
          </p>
        </div>
      )}

      <TaskForm onCreate={handleCreate} />

      <FilterBar
        status={statusFilter}
        priority={priorityFilter}
        onStatusChange={setStatusFilter}
        onPriorityChange={setPriorityFilter}
      />

      {actionError ? (
        <div className="bg-red-100 text-red-800 rounded-lg px-4 py-2">{actionError}</div>
      ) : null}

      {tasksLoading ? <SkeletonList /> : null}

      {status === 'failed' ? (
        <div className="bg-red-100 text-red-800 rounded-lg px-4 py-2">
          {error ?? 'Something went wrong while loading tasks.'}
        </div>
      ) : null}

      {status === 'succeeded' && items.length === 0 ? (
        <div className="bg-white rounded-lg p-6 text-center text-gray-600">
          {filtersActive ? 'No tasks match these filters.' : 'No tasks yet.'}
        </div>
      ) : null}

      {status === 'succeeded' && items.length > 0 ? (
        <div className="space-y-4">
          {items.map((task) => (
            <TaskCard
              key={task.id}
              task={task}
              onToggleStatus={handleToggle}
              onDelete={handleDelete}
            />
          ))}
        </div>
      ) : null}
    </div>
  );
};
