import { STATUS_BADGE_STYLES, STATUS_LABELS } from '../constants/badge-styles';
import type { Status } from '../types';

interface StatusBadgeProps {
  status: Status;
  // When provided, the badge becomes a button (used to cycle task status).
  onClick?: () => void;
  title?: string;
}

const PILL_BASE = 'rounded-full px-2 py-1 text-xs font-medium';

export const StatusBadge = ({ status, onClick, title }: StatusBadgeProps) => {
  const className = `${PILL_BASE} ${STATUS_BADGE_STYLES[status]}`;

  if (onClick) {
    return (
      <button type="button" onClick={onClick} title={title} className={className}>
        {STATUS_LABELS[status]}
      </button>
    );
  }

  return <span className={className}>{STATUS_LABELS[status]}</span>;
};
