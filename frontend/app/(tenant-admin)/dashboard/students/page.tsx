'use client';

import React, { useState, useCallback } from 'react';
import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';
import { Plus, Users, ChevronLeft, ChevronRight, Loader2 } from 'lucide-react';
import { useStudents } from '@/features/students/hooks/useStudents';
import { StudentFilters } from '@/features/students/components/StudentFilters';
import { StudentCard } from '@/features/students/components/StudentCard';
import type { StudentListFilters } from '@/features/students/types/student';

function useFiltersFromQuery(): StudentListFilters {
  const params = useSearchParams();
  return {
    page: Number(params.get('page')) || 1,
    limit: Number(params.get('limit')) || 20,
    search: params.get('search') || undefined,
    branchId: params.get('branchId') || undefined,
    status: (params.get('status') as any) || undefined,
    orphan: params.get('orphan') === 'true' ? true : undefined,
    sponsored: params.get('sponsored') === 'true' ? true : undefined,
    needy: params.get('needy') === 'true' ? true : undefined,
    sortBy: (params.get('sortBy') as any) || 'createdAt',
    sortOrder: (params.get('sortOrder') as any) || 'desc',
  };
}

export default function StudentsListPage() {
  const router = useRouter();
  const initialFilters = useFiltersFromQuery();
  const [filters, setFilters] = useState<StudentListFilters>(initialFilters);

  const { data, isLoading, error } = useStudents(filters);

  const updateQueryParams = useCallback(
    (next: StudentListFilters) => {
      const search = new URLSearchParams();
      if (next.page && next.page > 1) search.set('page', String(next.page));
      if (next.limit && next.limit !== 20) search.set('limit', String(next.limit));
      if (next.search) search.set('search', next.search);
      if (next.branchId) search.set('branchId', next.branchId);
      if (next.status) search.set('status', next.status);
      if (next.orphan) search.set('orphan', 'true');
      if (next.sponsored) search.set('sponsored', 'true');
      if (next.needy) search.set('needy', 'true');
      if (next.sortBy && next.sortBy !== 'createdAt') search.set('sortBy', next.sortBy);
      if (next.sortOrder && next.sortOrder !== 'desc') search.set('sortOrder', next.sortOrder);
      const qs = search.toString();
      router.replace(`/dashboard/students${qs ? `?${qs}` : ''}`, { scroll: false });
    },
    [router]
  );

  const handleFilterChange = (next: StudentListFilters) => {
    setFilters(next);
    updateQueryParams(next);
  };

  const goToPage = (page: number) => {
    handleFilterChange({ ...filters, page });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Students</h1>
          <p className="text-sm font-medium text-slate-400 mt-1">Manage all student records and lifecycle</p>
        </div>
        <Link
          href="/dashboard/students/create"
          className="inline-flex items-center gap-2 px-5 py-3 rounded-xl text-sm font-bold text-white bg-emerald-600 hover:bg-emerald-700 shadow-lg shadow-emerald-600/10 transition-all hover:-translate-y-0.5"
        >
          <Plus className="w-4 h-4" /> Add Student
        </Link>
      </div>

      {/* Stats Bar */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Total', value: data?.total ?? '-', icon: Users },
          { label: 'Active', value: data?.students?.filter(s => s.status === 'ACTIVE').length ?? '-', icon: Users },
          { label: 'Pages', value: data?.totalPages ?? '-', icon: Users },
          { label: 'Current Page', value: data?.page ?? '-', icon: Users },
        ].map((stat, i) => (
          <div key={i} className="bg-white rounded-2xl border border-slate-100 p-4 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600">
                <stat.icon className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">{stat.label}</p>
                <p className="text-xl font-black text-slate-900">{stat.value}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <StudentFilters filters={filters} onChange={handleFilterChange} branches={[]} />

      {/* Content */}
      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-10 h-10 animate-spin text-emerald-600" />
        </div>
      ) : error ? (
        <div className="bg-red-50 border border-red-200 rounded-2xl p-8 text-center">
          <p className="text-sm font-semibold text-red-600">Failed to load students.</p>
          <button
            onClick={() => handleFilterChange({ ...filters, page: 1 })}
            className="mt-4 px-4 py-2 rounded-lg bg-red-100 text-red-700 text-sm font-bold hover:bg-red-200 transition-colors"
          >
            Retry
          </button>
        </div>
      ) : !data?.students?.length ? (
        <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-12 text-center">
          <div className="w-16 h-16 rounded-2xl bg-slate-50 flex items-center justify-center mx-auto mb-4">
            <Users className="w-8 h-8 text-slate-300" />
          </div>
          <h3 className="text-lg font-bold text-slate-800">No students found</h3>
          <p className="text-sm text-slate-400 mt-1">Try adjusting filters or add a new student.</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {data.students.map((student) => (
              <StudentCard key={student.id} student={student} />
            ))}
          </div>

          {/* Pagination */}
          {data.totalPages > 1 && (
            <div className="flex items-center justify-between bg-white rounded-2xl border border-slate-100 p-4 shadow-sm">
              <button
                onClick={() => goToPage(Math.max(1, (data.page ?? 1) - 1))}
                disabled={(data.page ?? 1) <= 1}
                className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold text-slate-600 bg-slate-50 hover:bg-slate-100 disabled:opacity-40 transition-colors"
              >
                <ChevronLeft className="w-4 h-4" /> Previous
              </button>
              <span className="text-sm font-bold text-slate-500">
                Page {data.page} of {data.totalPages}
              </span>
              <button
                onClick={() => goToPage(Math.min(data.totalPages ?? 1, (data.page ?? 1) + 1))}
                disabled={(data.page ?? 1) >= (data.totalPages ?? 1)}
                className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold text-slate-600 bg-slate-50 hover:bg-slate-100 disabled:opacity-40 transition-colors"
              >
                Next <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
