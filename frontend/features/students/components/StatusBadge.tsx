'use client';

import { STATUS_DISPLAY, type StudentStatus } from '../types/student';

interface StatusBadgeProps {
  status: StudentStatus;
  size?: 'sm' | 'md';
}

export function StatusBadge({ status, size = 'md' }: StatusBadgeProps) {
  const config = STATUS_DISPLAY[status];
  const sizeClasses = size === 'sm' ? 'text-xs px-2 py-0.5' : 'text-sm px-2.5 py-1';

  return (
    <span
      className={`inline-flex items-center rounded-full font-semibold ${sizeClasses} ${config.color} ${config.bg}`}
    >
      {config.label}
    </span>
  );
}
