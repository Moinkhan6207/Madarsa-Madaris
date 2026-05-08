'use client';

import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Loader2, AlertTriangle } from 'lucide-react';
import { useStudent, useUpdateStudent } from '@/features/students/hooks/useStudents';
import { StudentForm } from '@/features/students/components/StudentForm';
import type { UpdateStudentPayload } from '@/features/students/types/student';

export default function EditStudentPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const { data: student, isLoading } = useStudent(id);
  const updateMutation = useUpdateStudent(id);

  const handleSubmit = async (data: any) => {
    await updateMutation.mutateAsync(data as UpdateStudentPayload);
    router.push(`/dashboard/students/${id}`);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <Loader2 className="w-10 h-10 animate-spin text-emerald-600" />
      </div>
    );
  }

  if (!student) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] gap-4">
        <AlertTriangle className="w-12 h-12 text-red-400" />
        <p className="text-lg font-bold text-slate-700">Student not found</p>
        <Link href="/dashboard/students" className="px-4 py-2 rounded-xl bg-emerald-50 text-emerald-700 text-sm font-bold hover:bg-emerald-100 transition-colors">
          Back to Students
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-20">
      <div className="flex items-center gap-4">
        <Link
          href={`/dashboard/students/${id}`}
          className="w-10 h-10 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-slate-500 hover:text-slate-700 hover:bg-slate-50 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Edit Student</h1>
          <p className="text-sm font-medium text-slate-400">{student.fullName}</p>
        </div>
      </div>

      <StudentForm
        mode="edit"
        student={student}
        branches={[]}
        sessions={[]}
        sponsors={[]}
        onSubmit={handleSubmit}
        isLoading={updateMutation.isPending}
      />
    </div>
  );
}
