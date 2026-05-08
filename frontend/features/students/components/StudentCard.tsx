'use client';

import React from 'react';
import Link from 'next/link';
import { Users, Phone, MapPin, ArrowRight } from 'lucide-react';
import { StatusBadge } from './StatusBadge';
import type { Student } from '../types/student';

interface StudentCardProps {
  student: Student;
}

export const StudentCard = React.memo(function StudentCard({ student }: StudentCardProps) {
  const primaryGuardian = student.guardians?.find((g) => g.isPrimary) || student.guardians?.[0];

  return (
    <Link
      href={`/dashboard/students/${student.id}`}
      className="group block bg-white rounded-3xl border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.02)] p-6 hover:shadow-xl hover:shadow-slate-200/50 hover:-translate-y-0.5 transition-all duration-300"
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-4 flex-1 min-w-0">
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 flex items-center justify-center text-emerald-600 font-bold text-lg shrink-0 ring-4 ring-emerald-100/50">
            {student.fullName?.[0]?.toUpperCase() || '?'}
          </div>
          <div className="min-w-0">
            <h3 className="text-base font-bold text-slate-900 truncate group-hover:text-emerald-700 transition-colors">
              {student.fullName}
            </h3>
            <p className="text-xs font-semibold text-slate-400 mt-0.5">
              {student.admissionNumber}
              {student.rollNumber && ` · Roll #${student.rollNumber}`}
            </p>
          </div>
        </div>
        <div className="shrink-0">
          <StatusBadge status={student.status} size="sm" />
        </div>
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-3 text-xs font-medium text-slate-500">
        {student.branch?.name && (
          <span className="flex items-center gap-1">
            <MapPin className="w-3.5 h-3.5" />
            {student.branch.name}
          </span>
        )}
        {primaryGuardian?.phone && (
          <span className="flex items-center gap-1">
            <Phone className="w-3.5 h-3.5" />
            {primaryGuardian.phone}
          </span>
        )}
        {student.sponsors && student.sponsors.length > 0 && (
          <span className="flex items-center gap-1 text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
            <Users className="w-3.5 h-3.5" />
            {student.sponsors.length} Sponsor{student.sponsors.length > 1 ? 's' : ''}
          </span>
        )}
        {student.isOrphan && (
          <span className="bg-amber-50 text-amber-600 px-2 py-0.5 rounded-full">Orphan</span>
        )}
        {student.isNeedy && (
          <span className="bg-blue-50 text-blue-600 px-2 py-0.5 rounded-full">Needy</span>
        )}
      </div>

      <div className="mt-4 flex items-center justify-end">
        <span className="text-xs font-bold text-emerald-600 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          View Profile <ArrowRight className="w-3.5 h-3.5" />
        </span>
      </div>
    </Link>
  );
});
