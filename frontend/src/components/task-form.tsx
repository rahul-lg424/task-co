import { useState, type FormEvent } from 'react';
import { PRIORITY_LABELS, STATUS_LABELS } from '../constants/badge-styles';
import { TextInput } from './text-input';
import type { Priority, Status } from '../types';

export interface NewTaskValues {
  title: string;
  description?: string;
  status: Status;
  priority: Priority;
  dueDate?: string;
}

interface TaskFormProps {
  // Should throw on failure so the form can surface the error and keep its input.
  onCreate: (values: NewTaskValues) => Promise<void>;
}

const STATUS_OPTIONS: Status[] = ['TODO', 'IN_PROGRESS', 'DONE'];
const PRIORITY_OPTIONS: Priority[] = ['LOW', 'MEDIUM', 'HIGH'];

const selectClass =
  'w-full rounded-lg border border-gray-300 px-4 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500';

// Inline form pinned to the top of the task list.
export const TaskForm = ({ onCreate }: TaskFormProps) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState<Status>('TODO');
  const [priority, setPriority] = useState<Priority>('MEDIUM');
  const [dueDate, setDueDate] = useState('');
  const [titleError, setTitleError] = useState<string | undefined>();
  const [formError, setFormError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setFormError(null);

    if (!title.trim()) {
      setTitleError('Title is required');
      return;
    }
    setTitleError(undefined);

    setPending(true);
    try {
      await onCreate({
        title: title.trim(),
        description: description.trim() || undefined,
        status,
        priority,
        dueDate: dueDate || undefined,
      });
      // Clear on success.
      setTitle('');
      setDescription('');
      setStatus('TODO');
      setPriority('MEDIUM');
      setDueDate('');
    } catch (error) {
      setFormError(typeof error === 'string' ? error : 'Failed to create task');
    } finally {
      setPending(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-lg p-6 space-y-4" noValidate>
      <h2 className="text-xl text-gray-900 font-semibold">New task</h2>

      <TextInput label="Title" value={title} onChange={setTitle} error={titleError} />

      <div className="space-y-1">
        <label className="block text-sm font-medium text-gray-900">Description</label>
        <textarea
          value={description}
          onChange={(event) => setDescription(event.target.value)}
          rows={2}
          className={selectClass}
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="space-y-1">
          <label className="block text-sm font-medium text-gray-900">Status</label>
          <select value={status} onChange={(event) => setStatus(event.target.value as Status)} className={selectClass}>
            {STATUS_OPTIONS.map((option) => (
              <option key={option} value={option}>
                {STATUS_LABELS[option]}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-1">
          <label className="block text-sm font-medium text-gray-900">Priority</label>
          <select
            value={priority}
            onChange={(event) => setPriority(event.target.value as Priority)}
            className={selectClass}
          >
            {PRIORITY_OPTIONS.map((option) => (
              <option key={option} value={option}>
                {PRIORITY_LABELS[option]}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-1">
          <label className="block text-sm font-medium text-gray-900">Due date</label>
          <input
            type="date"
            value={dueDate}
            onChange={(event) => setDueDate(event.target.value)}
            className={selectClass}
          />
        </div>
      </div>

      {formError ? (
        <div className="bg-red-100 text-red-800 rounded-lg px-4 py-2">{formError}</div>
      ) : null}

      <button
        type="submit"
        disabled={pending}
        className="bg-blue-600 hover:bg-blue-700 text-white rounded-lg px-4 py-2 disabled:opacity-60 disabled:cursor-not-allowed"
      >
        {pending ? 'Adding…' : 'Add task'}
      </button>
    </form>
  );
};
