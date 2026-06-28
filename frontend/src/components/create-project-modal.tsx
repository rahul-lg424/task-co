import { useState, type FormEvent } from 'react';
import { useAppDispatch } from '../store/hooks';
import { createProject } from '../store/projects-slice';
import { TextInput } from './text-input';

interface CreateProjectModalProps {
  open: boolean;
  onClose: () => void;
}

const DEFAULT_COLOR = '#3b82f6';

// Modal containing the "New Project" form. Dispatches the createProject thunk;
// the slice prepends the result so the dashboard list updates without a reload.
export const CreateProjectModal = ({ open, onClose }: CreateProjectModalProps) => {
  const dispatch = useAppDispatch();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [color, setColor] = useState(DEFAULT_COLOR);
  const [nameError, setNameError] = useState<string | undefined>();
  const [formError, setFormError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  if (!open) {
    return null;
  }

  const reset = () => {
    setName('');
    setDescription('');
    setColor(DEFAULT_COLOR);
    setNameError(undefined);
    setFormError(null);
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setFormError(null);

    if (!name.trim()) {
      setNameError('Name is required');
      return;
    }
    setNameError(undefined);

    setPending(true);
    try {
      await dispatch(
        createProject({
          name: name.trim(),
          description: description.trim() || undefined,
          color,
        }),
      ).unwrap();
      reset();
      onClose();
    } catch (error) {
      // rejectWithValue gives us the string message from the slice.
      setFormError(typeof error === 'string' ? error : 'Failed to create project');
    } finally {
      setPending(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      onClick={handleClose}
    >
      <div
        className="w-full max-w-md bg-white rounded-lg p-6 space-y-4"
        onClick={(event) => event.stopPropagation()}
      >
        <h2 className="text-xl text-gray-900 font-semibold">New project</h2>

        <form onSubmit={handleSubmit} className="space-y-4" noValidate>
          <TextInput label="Name" value={name} onChange={setName} error={nameError} />

          <div className="space-y-1">
            <label className="block text-sm font-medium text-gray-900">Description</label>
            <textarea
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              rows={3}
              className="w-full rounded-lg border border-gray-300 px-4 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="space-y-1">
            <label className="block text-sm font-medium text-gray-900">Color</label>
            <div className="flex items-center gap-3">
              <input
                type="color"
                value={color}
                onChange={(event) => setColor(event.target.value)}
                className="h-10 w-16 rounded-lg border border-gray-300"
              />
              <span className="text-gray-600 text-sm">{color}</span>
            </div>
          </div>

          {formError ? (
            <div className="bg-red-100 text-red-800 rounded-lg px-4 py-2">{formError}</div>
          ) : null}

          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={handleClose}
              className="rounded-lg px-4 py-2 text-gray-600 hover:bg-gray-100"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={pending}
              className="bg-blue-600 hover:bg-blue-700 text-white rounded-lg px-4 py-2 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {pending ? 'Creating…' : 'Create project'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
