import { PRIORITY_LABELS, STATUS_LABELS } from '../constants/badge-styles';
import type { PriorityFilter, StatusFilter } from '../store/tasks-slice';
import type { Priority, Status } from '../types';

interface FilterBarProps {
  status: StatusFilter;
  priority: PriorityFilter;
  onStatusChange: (value: StatusFilter) => void;
  onPriorityChange: (value: PriorityFilter) => void;
}

const STATUS_OPTIONS: StatusFilter[] = ['ALL', 'TODO', 'IN_PROGRESS', 'DONE'];
const PRIORITY_OPTIONS: PriorityFilter[] = ['ALL', 'LOW', 'MEDIUM', 'HIGH'];

const buttonClass = (active: boolean) =>
  `rounded-lg px-4 py-2 text-sm ${
    active
      ? 'bg-blue-600 text-white'
      : 'bg-white text-gray-600 border border-gray-300 hover:bg-gray-50'
  }`;

const statusLabel = (value: StatusFilter) => (value === 'ALL' ? 'All' : STATUS_LABELS[value as Status]);
const priorityLabel = (value: PriorityFilter) =>
  value === 'ALL' ? 'All' : PRIORITY_LABELS[value as Priority];

export const FilterBar = ({ status, priority, onStatusChange, onPriorityChange }: FilterBarProps) => (
  <div className="space-y-3">
    <div className="flex flex-wrap items-center gap-2">
      <span className="text-gray-600 text-sm w-16">Status</span>
      {STATUS_OPTIONS.map((option) => (
        <button
          key={option}
          type="button"
          onClick={() => onStatusChange(option)}
          className={buttonClass(option === status)}
        >
          {statusLabel(option)}
        </button>
      ))}
    </div>
    <div className="flex flex-wrap items-center gap-2">
      <span className="text-gray-600 text-sm w-16">Priority</span>
      {PRIORITY_OPTIONS.map((option) => (
        <button
          key={option}
          type="button"
          onClick={() => onPriorityChange(option)}
          className={buttonClass(option === priority)}
        >
          {priorityLabel(option)}
        </button>
      ))}
    </div>
  </div>
);
