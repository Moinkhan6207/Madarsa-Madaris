'use client';

import { useRouter } from 'next/navigation';
import { ArrowLeft, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { useCreateStudent } from '@/features/students/hooks/useStudents';
import { useBranches, useSessions, useSponsors } from '@/features/students/hooks/useReferenceData';
import { StudentForm } from '@/features/students/components/StudentForm';
import type { CreateStudentPayload } from '@/features/students/types/student';

export default function CreateStudentPage() {
  const router = useRouter();
  const createMutation = useCreateStudent();
  const { data: branches = [], isLoading: branchesLoading } = useBranches();
  const { data: sessions = [], isLoading: sessionsLoading } = useSessions();
  const { data: sponsors = [], isLoading: sponsorsLoading } = useSponsors();

  const handleSubmit = async (data: any) => {
    await createMutation.mutateAsync(data as CreateStudentPayload);
    router.push('/dashboard/students');
  };

  const isLoading = branchesLoading || sessionsLoading || sponsorsLoading;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <Loader2 className="w-10 h-10 animate-spin text-emerald-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-20">
      <div className="flex items-center gap-4">
        <Link
          href="/dashboard/students"
          className="w-10 h-10 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-slate-500 hover:text-slate-700 hover:bg-slate-50 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Add Student</h1>
          <p className="text-sm font-medium text-slate-400">Create a new student record</p>
        </div>
      </div>

      <StudentForm
        mode="create"
        branches={branches}
        sessions={sessions}
        sponsors={sponsors}
        onSubmit={handleSubmit}
        isLoading={createMutation.isPending}
      />
    </div>
  );
}
