import type { Priority, Status } from '../types';

// Tailwind class maps for badges — kept here as the single source of truth so
// StatusBadge / PriorityBadge stay presentational.
export const PRIORITY_BADGE_STYLES: Record<Priority, string> = {
  HIGH: 'bg-red-100 text-red-800',
  MEDIUM: 'bg-yellow-100 text-yellow-800',
  LOW: 'bg-green-100 text-green-800',
};

export const STATUS_BADGE_STYLES: Record<Status, string> = {
  TODO: 'bg-gray-100 text-gray-800',
  IN_PROGRESS: 'bg-blue-100 text-blue-800',
  DONE: 'bg-green-100 text-green-800',
};

export const STATUS_LABELS: Record<Status, string> = {
  TODO: 'Todo',
  IN_PROGRESS: 'In Progress',
  DONE: 'Done',
};

export const PRIORITY_LABELS: Record<Priority, string> = {
  LOW: 'Low',
  MEDIUM: 'Medium',
  HIGH: 'High',
};
