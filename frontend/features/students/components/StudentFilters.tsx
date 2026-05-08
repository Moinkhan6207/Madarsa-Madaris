'use client';

import React from 'react';
import { Search, SlidersHorizontal, ArrowUpDown, X } from 'lucide-react';
import type { StudentStatus, StudentListFilters } from '../types/student';
import { STATUS_DISPLAY } from '../types/student';

interface StudentFiltersProps {
  filters: StudentListFilters;
  onChange: (filters: StudentListFilters) => void;
  branches?: { id: string; name: string }[];
}

const sortableFields = [
  { key: 'createdAt', label: 'Created' },
  { key: 'updatedAt', label: 'Updated' },
  { key: 'fullName', label: 'Name' },
  { key: 'admissionNumber', label: 'Admission #' },
  { key: 'status', label: 'Status' },
  { key: 'admissionDate', label: 'Admission Date' },
] as const;

export const StudentFilters = React.memo(function StudentFilters({ filters, onChange, branches }: StudentFiltersProps) {
  const hasActiveFilters = Boolean(
    filters.search || filters.status || filters.branchId || filters.orphan !== undefined || filters.sponsored !== undefined || filters.needy !== undefined
  );

  const update = (patch: Partial<StudentListFilters>) => {
    onChange({ ...filters, page: 1, ...patch });
  };

  const clearAll = () => {
    onChange({ page: 1, limit: filters.limit, sortBy: filters.sortBy, sortOrder: filters.sortOrder });
  };

  return (
    <div className="space-y-4">
      {/* Search + Sort Row */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search by name, admission #, or phone..."
            value={filters.search || ''}
            onChange={(e) => update({ search: e.target.value || undefined })}
            className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-medium text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
          />
          {filters.search && (
            <button onClick={() => update({ search: undefined })} className="absolute right-3 top-1/2 -translate-y-1/2">
              <X className="w-4 h-4 text-slate-400 hover:text-slate-600" />
            </button>
          )}
        </div>

        <div className="flex items-center gap-2">
          <div className="relative">
            <ArrowUpDown className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <select
              value={`${filters.sortBy || 'createdAt'}-${filters.sortOrder || 'desc'}`}
              onChange={(e) => {
                const [field, order] = e.target.value.split('-') as [any, 'asc' | 'desc'];
                update({ sortBy: field, sortOrder: order });
              }}
              className="pl-9 pr-8 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 appearance-none cursor-pointer"
            >
              {sortableFields.map((f) => (
                <React.Fragment key={f.key}>
                  <option value={`${f.key}-asc`}>{f.label} (A-Z)</option>
                  <option value={`${f.key}-desc`}>{f.label} (Z-A)</option>
                </React.Fragment>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Filter Chips */}
      <div className="flex flex-wrap items-center gap-2">
        {branches && branches.length > 0 && (
          <select
            value={filters.branchId || ''}
            onChange={(e) => update({ branchId: e.target.value || undefined })}
            className="px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-semibold text-slate-600 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 cursor-pointer"
          >
            <option value="">All Branches</option>
            {branches.map((b) => (
              <option key={b.id} value={b.id}>{b.name}</option>
            ))}
          </select>
        )}

        <select
          value={filters.status || ''}
          onChange={(e) => update({ status: (e.target.value as StudentStatus) || undefined })}
          className="px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-semibold text-slate-600 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 cursor-pointer"
        >
          <option value="">All Statuses</option>
          {Object.entries(STATUS_DISPLAY).map(([key, val]) => (
            <option key={key} value={key}>{val.label}</option>
          ))}
        </select>

        {(['orphan', 'sponsored', 'needy'] as const).map((flag) => {
          const value = filters[flag];
          const label = flag.charAt(0).toUpperCase() + flag.slice(1);
          return (
            <button
              key={flag}
              onClick={() => update({ [flag]: value === true ? undefined : true })}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all border ${
                value === true
                  ? 'bg-emerald-50 border-emerald-200 text-emerald-700'
                  : 'bg-white border-slate-200 text-slate-500 hover:text-slate-700'
              }`}
            >
              {label}
            </button>
          );
        })}

        {hasActiveFilters && (
          <button
            onClick={clearAll}
            className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold text-rose-600 hover:bg-rose-50 transition-colors"
          >
            <X className="w-3 h-3" />
            Clear
          </button>
        )}
      </div>
    </div>
  );
});
