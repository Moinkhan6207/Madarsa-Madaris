'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import {
  ArrowLeft,
  Pencil,
  Trash2,
  Loader2,
  AlertTriangle,
  Calendar,
  MapPin,
  Phone,
  Mail,
  Briefcase,
  Shield,
  Heart,
  GraduationCap,
  X,
  FileText,
} from 'lucide-react';
import { useStudent, useDeleteStudent, useChangeStudentStatus, useStudentHistory } from '@/features/students/hooks/useStudents';
import { useSponsors } from '@/features/students/hooks/useReferenceData';
import { StatusBadge } from '@/features/students/components/StatusBadge';
import { HistoryTimeline } from '@/features/students/components/HistoryTimeline';
import { LifecycleModal } from '@/features/students/components/LifecycleModal';
import { GuardianSection } from '@/features/students/components/GuardianSection';
import { SponsorSection } from '@/features/students/components/SponsorSection';
import { useAddGuardian, useUpdateGuardian, useDeleteGuardian } from '@/features/students/hooks/useStudents';
import { useMapSponsor, useUnlinkSponsor } from '@/features/students/hooks/useStudents';
import { hasPermission } from '@/features/students/utils/permissions';

export default function StudentDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const { data: student, isLoading, error } = useStudent(id);
  const { data: history } = useStudentHistory(id);
  const { data: sponsors = [] } = useSponsors();
  const deleteMutation = useDeleteStudent();
  const statusMutation = useChangeStudentStatus(id);
  const addGuardianMutation = useAddGuardian(id);
  const updateGuardianMutation = useUpdateGuardian(id);
  const deleteGuardianMutation = useDeleteGuardian(id);
  const mapSponsorMutation = useMapSponsor(id);
  const unlinkSponsorMutation = useUnlinkSponsor(id);

  const [showStatusModal, setShowStatusModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [toast, setToast] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const canUpdate = hasPermission('student.update');
  const canDelete = hasPermission('student.delete');
  const canChangeStatus = hasPermission('student.status.update');
  const canManageGuardians = hasPermission('student.guardian.manage');
  const canManageSponsors = hasPermission('student.sponsor.manage');

  const showToast = (type: 'success' | 'error', message: string) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 4000);
  };

  const handleDelete = async () => {
    try {
      await deleteMutation.mutateAsync(id);
      router.push('/dashboard/students');
    } catch {
      showToast('error', 'Failed to delete student');
    }
  };

  const handleStatusChange = async (status: any, notes: string) => {
    try {
      await statusMutation.mutateAsync({ status, notes });
      setShowStatusModal(false);
      showToast('success', 'Status updated successfully');
    } catch {
      showToast('error', 'Failed to update status');
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <Loader2 className="w-10 h-10 animate-spin text-emerald-600" />
      </div>
    );
  }

  if (error || !student) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] gap-4">
        <AlertTriangle className="w-12 h-12 text-red-400" />
        <p className="text-lg font-bold text-slate-700">Failed to load student</p>
        <Link href="/dashboard/students" className="px-4 py-2 rounded-xl bg-emerald-50 text-emerald-700 text-sm font-bold hover:bg-emerald-100 transition-colors">
          Back to Students
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-20">
      {/* Toast */}
      {toast && (
        <div className={`fixed top-6 right-6 z-50 px-5 py-3 rounded-2xl shadow-lg border text-sm font-bold transition-all animate-fade-in-up ${
          toast.type === 'success' ? 'bg-emerald-50 border-emerald-200 text-emerald-700' : 'bg-red-50 border-red-200 text-red-700'
        }`}>
          {toast.message}
        </div>
      )}

      {/* Top Nav */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-4">
          <Link
            href="/dashboard/students"
            className="w-10 h-10 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-slate-500 hover:text-slate-700 hover:bg-slate-50 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <div className="flex items-center gap-3 flex-wrap">
              <h1 className="text-2xl font-black text-slate-900 tracking-tight">{student.fullName}</h1>
              <StatusBadge status={student.status} />
            </div>
            <p className="text-sm font-medium text-slate-400 mt-0.5">{student.admissionNumber}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Link
            href={`/dashboard/students/${id}/edit`}
            aria-disabled={!canUpdate}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold text-slate-600 bg-white border border-slate-200 hover:bg-slate-50 transition-colors"
          >
            <Pencil className="w-4 h-4" /> Edit
          </Link>
          {canChangeStatus && (
            <button
              onClick={() => setShowStatusModal(true)}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold text-white bg-emerald-600 hover:bg-emerald-700 shadow-lg shadow-emerald-600/10 transition-colors"
            >
              Change Status
            </button>
          )}
          {canDelete && (
            <button
              onClick={() => setShowDeleteModal(true)}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold text-rose-600 bg-white border border-rose-100 hover:bg-rose-50 transition-colors"
            >
              <Trash2 className="w-4 h-4" /> Archive
            </button>
          )}
        </div>
      </div>

      {/* Profile Card */}
      <div className="bg-white rounded-3xl border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.02)] p-6 md:p-8">
        <div className="flex items-start gap-5">
          <div className="w-20 h-20 rounded-3xl bg-emerald-50 flex items-center justify-center text-3xl font-black text-emerald-600 shrink-0 ring-4 ring-emerald-100/50">
            {student.fullName?.[0]?.toUpperCase() || '?'}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap gap-2 mb-3">
              {student.isOrphan && (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-700 border border-amber-100">
                  <Heart className="w-3 h-3" /> Orphan
                </span>
              )}
              {student.isNeedy && (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-blue-50 text-blue-700 border border-blue-100">
                  <Shield className="w-3 h-3" /> Needy
                </span>
              )}
              {student.isSponsored && (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-purple-50 text-purple-700 border border-purple-100">
                  <Briefcase className="w-3 h-3" /> Sponsored
                </span>
              )}
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-x-6 gap-y-3 text-sm">
              {student.branch?.name && (
                <div className="flex items-center gap-2 text-slate-600">
                  <MapPin className="w-4 h-4 text-slate-400 shrink-0" />
                  <span className="font-medium">{student.branch.name}</span>
                </div>
              )}
              {student.academicSession?.name && (
                <div className="flex items-center gap-2 text-slate-600">
                  <GraduationCap className="w-4 h-4 text-slate-400 shrink-0" />
                  <span className="font-medium">{student.academicSession.name}</span>
                </div>
              )}
              {student.phone && (
                <div className="flex items-center gap-2 text-slate-600">
                  <Phone className="w-4 h-4 text-slate-400 shrink-0" />
                  <span className="font-medium">{student.phone}</span>
                </div>
              )}
              {student.email && (
                <div className="flex items-center gap-2 text-slate-600">
                  <Mail className="w-4 h-4 text-slate-400 shrink-0" />
                  <span className="font-medium">{student.email}</span>
                </div>
              )}
              <div className="flex items-center gap-2 text-slate-600">
                <Calendar className="w-4 h-4 text-slate-400 shrink-0" />
                <span className="font-medium">
                  Admitted {new Date(student.admissionDate).toLocaleDateString('en-IN')}
                </span>
              </div>
              {student.currentProgram && (
                <div className="flex items-center gap-2 text-slate-600">
                  <GraduationCap className="w-4 h-4 text-slate-400 shrink-0" />
                  <span className="font-medium">{student.currentProgram}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Guardians */}
      <GuardianSection
        guardians={student.guardians?.filter((g) => !g.deletedAt) ?? []}
        studentId={id}
        onAdd={(data) => addGuardianMutation.mutateAsync(data as any).then(() => showToast('success', 'Guardian added'))}
        onUpdate={(guardianId, data) => updateGuardianMutation.mutateAsync({ guardianId, data: data as any }).then(() => showToast('success', 'Guardian updated'))}
        onDelete={(guardianId) => deleteGuardianMutation.mutateAsync(guardianId).then(() => showToast('success', 'Guardian removed'))}
        isAdding={addGuardianMutation.isPending}
        isUpdating={updateGuardianMutation.isPending}
        isDeleting={deleteGuardianMutation.isPending}
        canManage={canManageGuardians}
      />

      {/* Sponsors */}
      <SponsorSection
        mappings={student.sponsors?.filter((s) => !s.deletedAt) ?? []}
        sponsors={sponsors}
        studentId={id}
        onMap={(data) => mapSponsorMutation.mutateAsync(data as any).then(() => showToast('success', 'Sponsor linked'))}
        onUnlink={(sponsorId) => unlinkSponsorMutation.mutateAsync(sponsorId).then(() => showToast('success', 'Sponsor unlinked'))}
        isMapping={mapSponsorMutation.isPending}
        isUnlinking={unlinkSponsorMutation.isPending}
        canManage={canManageSponsors}
      />

      {/* History */}
      <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-6 md:p-8">
        <h3 className="text-lg font-black text-slate-900 mb-6">History & Audit</h3>
        <HistoryTimeline history={history ?? []} />
      </div>

      {/* Status Modal */}
      <LifecycleModal
        currentStatus={student.status}
        isOpen={showStatusModal && canChangeStatus}
        onClose={() => setShowStatusModal(false)}
        onConfirm={handleStatusChange}
        isLoading={statusMutation.isPending}
      />

      {/* Delete Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => setShowDeleteModal(false)} />
          <div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-md p-6 md:p-8 animate-fade-in-up">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-rose-50 flex items-center justify-center">
                <AlertTriangle className="w-5 h-5 text-rose-600" />
              </div>
              <h2 className="text-lg font-black text-slate-900">Delete Student?</h2>
            </div>
            <p className="text-sm text-slate-500 mb-6">
              This will archive the student record using soft delete. The data remains in the system but is hidden from default lists.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="flex-1 px-4 py-3 rounded-xl text-sm font-bold text-slate-600 bg-slate-50 hover:bg-slate-100 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={deleteMutation.isPending}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-sm font-bold text-white bg-rose-600 hover:bg-rose-700 disabled:opacity-50 transition-colors"
              >
                {deleteMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                {deleteMutation.isPending ? 'Archiving...' : 'Archive'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
