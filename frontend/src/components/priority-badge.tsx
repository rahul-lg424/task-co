import { PRIORITY_BADGE_STYLES, PRIORITY_LABELS } from '../constants/badge-styles';
import type { Priority } from '../types';

interface PriorityBadgeProps {
  priority: Priority;
}

const PILL_BASE = 'rounded-full px-2 py-1 text-xs font-medium';

export const PriorityBadge = ({ priority }: PriorityBadgeProps) => (
  <span className={`${PILL_BASE} ${PRIORITY_BADGE_STYLES[priority]}`}>
    {PRIORITY_LABELS[priority]}
  </span>
);
