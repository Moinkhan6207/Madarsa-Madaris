'use client';

import React from 'react';
import { Clock, User, ArrowRight } from 'lucide-react';
import type { StudentHistory } from '../types/student';
import { HISTORY_EVENT_LABELS } from '../types/student';

interface HistoryTimelineProps {
  history: StudentHistory[];
}

const EVENT_ICONS: Record<string, React.ReactNode> = {
  CREATED: <span className="w-2 h-2 rounded-full bg-emerald-500" />,
  STATUS_CHANGED: <ArrowRight className="w-3 h-3 text-blue-500" />,
  PROFILE_UPDATED: <span className="w-2 h-2 rounded-full bg-slate-400" />,
  BRANCH_CHANGED: <span className="w-2 h-2 rounded-full bg-purple-500" />,
  SESSION_CHANGED: <span className="w-2 h-2 rounded-full bg-indigo-500" />,
  PROGRAM_CHANGED: <span className="w-2 h-2 rounded-full bg-teal-500" />,
  CLASS_CHANGED: <span className="w-2 h-2 rounded-full bg-cyan-500" />,
  GUARDIAN_ADDED: <span className="w-2 h-2 rounded-full bg-green-500" />,
  GUARDIAN_UPDATED: <span className="w-2 h-2 rounded-full bg-green-400" />,
  GUARDIAN_REMOVED: <span className="w-2 h-2 rounded-full bg-red-400" />,
  SPONSOR_LINKED: <span className="w-2 h-2 rounded-full bg-amber-500" />,
  SPONSOR_UNLINKED: <span className="w-2 h-2 rounded-full bg-orange-400" />,
  SOFT_DELETED: <span className="w-2 h-2 rounded-full bg-red-500" />,
};

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export const HistoryTimeline = React.memo(function HistoryTimeline({ history }: HistoryTimelineProps) {
  if (!history?.length) {
    return (
      <div className="text-center py-8 text-sm text-slate-400 font-medium">
        No history records yet.
      </div>
    );
  }

  return (
    <div className="space-y-0">
      {history.map((item, index) => (
        <div key={item.id} className="relative flex gap-4 pb-6 last:pb-0">
          {/* Timeline line */}
          {index < history.length - 1 && (
            <div className="absolute left-[19px] top-8 bottom-0 w-px bg-slate-100" />
          )}

          {/* Dot */}
          <div className="relative z-10 w-10 h-10 rounded-full bg-slate-50 border border-slate-100 flex items-center justify-center shrink-0">
            {EVENT_ICONS[item.event] || <Clock className="w-3.5 h-3.5 text-slate-400" />}
          </div>

          {/* Content */}
          <div className="flex-1 pt-1.5">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-sm font-bold text-slate-800">
                {HISTORY_EVENT_LABELS[item.event] || item.event}
              </span>
              {item.fieldName && (
                <span className="text-xs font-medium text-slate-400 bg-slate-50 px-2 py-0.5 rounded-full">
                  {item.fieldName}
                </span>
              )}
            </div>

            {item.oldValue !== undefined && item.newValue !== undefined && (
              <div className="mt-1.5 flex items-center gap-2 text-xs">
                <span className="text-slate-400 line-through">{String(item.oldValue ?? '-')}</span>
                <ArrowRight className="w-3 h-3 text-slate-300" />
                <span className="text-emerald-600 font-semibold">{String(item.newValue ?? '-')}</span>
              </div>
            )}

            <div className="mt-2 flex items-center gap-2 text-xs text-slate-400">
              <Clock className="w-3 h-3" />
              {formatDate(item.changedAt)}
              {item.changedBy && (
                <>
                  <span className="mx-1">·</span>
                  <User className="w-3 h-3" />
                  {item.changedBy}
                </>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
});
