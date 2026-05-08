'use client';

import React, { useState, useMemo } from 'react';
import { X, ArrowRight, AlertTriangle } from 'lucide-react';
import { StatusBadge } from './StatusBadge';
import { canTransition, getAllowedTransitions, STATUS_DISPLAY, type StudentStatus } from '../types/student';

interface LifecycleModalProps {
  currentStatus: StudentStatus;
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (nextStatus: StudentStatus, notes: string) => void;
  isLoading?: boolean;
}

export function LifecycleModal({ currentStatus, isOpen, onClose, onConfirm, isLoading }: LifecycleModalProps) {
  const [selectedStatus, setSelectedStatus] = useState<StudentStatus | null>(null);
  const [notes, setNotes] = useState('');

  const allowed = useMemo(() => getAllowedTransitions(currentStatus), [currentStatus]);

  if (!isOpen) return null;

  const handleConfirm = () => {
    if (selectedStatus && canTransition(currentStatus, selectedStatus)) {
      onConfirm(selectedStatus, notes);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-lg p-6 md:p-8 animate-fade-in-up">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-black text-slate-900">Change Status</h2>
          <button onClick={onClose} className="w-10 h-10 rounded-xl bg-slate-50 hover:bg-slate-100 flex items-center justify-center transition-colors">
            <X className="w-5 h-5 text-slate-500" />
          </button>
        </div>

        <div className="mb-4">
          <p className="text-sm font-semibold text-slate-500 mb-2">Current Status</p>
          <StatusBadge status={currentStatus} />
        </div>

        {allowed.length === 0 ? (
          <div className="flex items-center gap-3 bg-amber-50 border border-amber-100 rounded-2xl p-4">
            <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0" />
            <p className="text-sm font-medium text-amber-700">
              No further transitions allowed from {STATUS_DISPLAY[currentStatus].label}.
            </p>
          </div>
        ) : (
          <>
            <p className="text-sm font-semibold text-slate-500 mb-3">Allowed Transitions</p>
            <div className="space-y-2 mb-6">
              {allowed.map((status) => (
                <button
                  key={status}
                  onClick={() => setSelectedStatus(status)}
                  className={`w-full flex items-center justify-between p-3 rounded-xl border transition-all ${
                    selectedStatus === status
                      ? 'border-emerald-500 bg-emerald-50 ring-2 ring-emerald-500/10'
                      : 'border-slate-200 hover:border-slate-300 bg-white'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                      selectedStatus === status ? 'border-emerald-500' : 'border-slate-300'
                    }`}>
                      {selectedStatus === status && <div className="w-2 h-2 rounded-full bg-emerald-500" />}
                    </div>
                    <StatusBadge status={status} />
                  </div>
                  <ArrowRight className={`w-4 h-4 ${selectedStatus === status ? 'text-emerald-500' : 'text-slate-300'}`} />
                </button>
              ))}
            </div>

            <div className="mb-6">
              <label className="text-sm font-semibold text-slate-500 mb-2 block">Notes (optional)</label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Add a reason for this status change..."
                rows={3}
                className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-sm font-medium text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 resize-none"
              />
            </div>

            <div className="flex gap-3">
              <button
                onClick={onClose}
                className="flex-1 px-4 py-3 rounded-xl text-sm font-bold text-slate-600 bg-slate-50 hover:bg-slate-100 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirm}
                disabled={!selectedStatus || isLoading}
                className="flex-1 px-4 py-3 rounded-xl text-sm font-bold text-white bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {isLoading ? 'Updating...' : 'Confirm Change'}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
