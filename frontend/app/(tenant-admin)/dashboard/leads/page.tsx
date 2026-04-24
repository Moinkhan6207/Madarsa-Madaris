'use client';

import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { leadService, Lead } from '@/services/lead.service';
import { 
  Mail, 
  Phone, 
  Calendar, 
  User, 
  CheckCircle, 
  Clock, 
  XCircle, 
  Search, 
  Filter, 
  ArrowRight,
  MoreHorizontal,
  X,
  MessageSquare
} from 'lucide-react';

export default function LeadsDashboard() {
  const queryClient = useQueryClient();
  const [filter, setFilter] = useState({ status: '', type: '', page: 1 });
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ['leads', filter],
    queryFn: () => leadService.listLeads(filter),
  });

  const statusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string, status: string }) => leadService.updateStatus(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['leads'] });
      if (selectedLead) {
        setSelectedLead(prev => prev ? { ...prev, status: statusMutation.variables?.status as any } : null);
      }
    },
  });

  const leads = data?.data?.leads || [];

  const getStatusStyle = (status: string) => {
    switch(status) {
      case 'NEW': return 'bg-blue-50 text-blue-600 border-blue-100';
      case 'IN_PROGRESS': return 'bg-amber-50 text-amber-600 border-amber-100';
      case 'CONVERTED': return 'bg-emerald-50 text-emerald-600 border-emerald-100';
      case 'REJECTED': return 'bg-red-50 text-red-600 border-red-100';
      default: return 'bg-gray-50 text-gray-600 border-gray-100';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-end border-b border-gray-100 pb-6">
        <div>
          <h1 className="text-3xl font-black text-gray-900 tracking-tight uppercase">Lead Engine</h1>
          <p className="text-gray-500 text-xs font-bold uppercase tracking-widest mt-1">Transform Inquiries into Institutional Growth</p>
        </div>
      </div>

      <div className="flex gap-4 items-center bg-white p-4 rounded-3xl border border-gray-100 shadow-xl shadow-gray-200/30">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
          <input 
            placeholder="Search responses..." 
            className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-transparent rounded-2xl focus:outline-none focus:border-emerald-500 transition-all font-medium text-sm"
          />
        </div>
        <div className="flex gap-2">
           <select 
             className="bg-gray-50 border border-transparent rounded-2xl px-6 py-3 text-[10px] font-black uppercase tracking-widest text-gray-500 focus:outline-none"
             value={filter.status}
             onChange={(e) => setFilter({...filter, status: e.target.value})}
           >
             <option value="">All Statuses</option>
             <option value="NEW">New</option>
             <option value="IN_PROGRESS">In Progress</option>
             <option value="CONVERTED">Converted</option>
             <option value="REJECTED">Rejected</option>
           </select>
           <select 
             className="bg-gray-50 border border-transparent rounded-2xl px-6 py-3 text-[10px] font-black uppercase tracking-widest text-gray-500 focus:outline-none"
             value={filter.type}
             onChange={(e) => setFilter({...filter, type: e.target.value})}
           >
             <option value="">All Types</option>
             <option value="ADMISSION">Admission</option>
             <option value="CONTACT">Contact</option>
             <option value="INQUIRY">Inquiry</option>
           </select>
        </div>
      </div>

      <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-2xl shadow-gray-200/40 overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-50/50">
              <th className="px-8 py-5 text-[9px] font-black text-gray-400 uppercase tracking-widest">Lead Identity</th>
              <th className="px-8 py-5 text-[9px] font-black text-gray-400 uppercase tracking-widest">Category</th>
              <th className="px-8 py-5 text-[9px] font-black text-gray-400 uppercase tracking-widest">Date Received</th>
              <th className="px-8 py-5 text-[9px] font-black text-gray-400 uppercase tracking-widest">Status</th>
              <th className="px-8 py-5 text-[9px] font-black text-gray-400 uppercase tracking-widest text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {isLoading ? (
              [1,2,3].map(i => <tr key={i} className="animate-pulse"><td colSpan={5} className="px-8 py-6"><div className="h-4 bg-gray-50 rounded-lg w-full"></div></td></tr>)
            ) : leads.length === 0 ? (
              <tr><td colSpan={5} className="px-8 py-20 text-center text-gray-400 font-bold uppercase tracking-widest text-xs">No leads found</td></tr>
            ) : (
              leads.map((lead: Lead) => (
                <tr key={lead.id} className="hover:bg-emerald-50/30 transition-colors group cursor-pointer" onClick={() => setSelectedLead(lead)}>
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-3">
                       <div className="w-10 h-10 bg-emerald-100 text-emerald-600 rounded-2xl flex items-center justify-center font-black text-[10px] uppercase">
                         {lead.formData?.name?.slice(0,2) || 'LE'}
                       </div>
                       <div>
                         <div className="font-black text-gray-900 uppercase tracking-tight group-hover:text-emerald-700 transition-colors">{lead.formData?.name || 'Anonymous'}</div>
                         <div className="text-[9px] text-gray-400 font-bold tracking-wider">{lead.formData?.email}</div>
                       </div>
                    </div>
                  </td>
                  <td className="px-8 py-6 text-[10px] font-black text-gray-500 uppercase tracking-widest">
                     {lead.type}
                  </td>
                  <td className="px-8 py-6 text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                     {new Date(lead.createdAt).toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' })}
                  </td>
                  <td className="px-8 py-6">
                     <span className={`inline-flex items-center px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-wider border ${getStatusStyle(lead.status)}`}>
                       {lead.status}
                     </span>
                  </td>
                  <td className="px-8 py-6 text-right">
                     <button className="p-2.5 text-gray-300 hover:text-emerald-600 hover:bg-emerald-100 rounded-xl transition-all">
                       <ArrowRight className="w-4 h-4" />
                     </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Selected Lead Modal */}
      {selectedLead && (
        <div className="fixed inset-0 z-[150] flex items-center justify-center p-8 bg-gray-900/40 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-white w-full max-w-2xl rounded-[3rem] shadow-2xl overflow-hidden flex flex-col border border-white/20 animate-in zoom-in-95 duration-300">
             <div className="px-10 py-8 bg-gray-50 flex justify-between items-center border-b border-gray-100">
                <div className="flex items-center gap-4">
                   <div className="w-14 h-14 bg-emerald-600 text-white rounded-[1.5rem] flex items-center justify-center font-black text-xl shadow-lg shadow-emerald-100">
                     {selectedLead.formData?.name?.[0]}
                   </div>
                   <div>
                      <h2 className="text-2xl font-black text-gray-900 uppercase tracking-tight">{selectedLead.formData?.name || 'Inquiry Details'}</h2>
                      <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-0.5">Reference ID: {selectedLead.id.slice(0,8)}</p>
                   </div>
                </div>
                <button onClick={() => setSelectedLead(null)} className="p-3 hover:bg-gray-200 rounded-full transition-all">
                  <X className="w-6 h-6 text-gray-500" />
                </button>
             </div>

             <div className="flex-1 overflow-y-auto p-10 space-y-10">
                <section>
                   <h3 className="text-[10px] font-black text-emerald-600 uppercase tracking-[0.2em] mb-6">Submission Data</h3>
                   <div className="grid grid-cols-2 gap-x-8 gap-y-6">
                      {Object.entries(selectedLead.formData || {}).map(([key, value]) => {
                        if (typeof value !== 'string' && typeof value !== 'number') return null;
                        const label = key
                          .replace(/([A-Z])/g, ' $1')
                          .replace(/^./, (str) => str.toUpperCase());
                        
                        return (
                          <div key={key} className="space-y-1">
                             <label className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">{label}</label>
                             <p className="text-sm font-black text-gray-900 break-words">{value || 'N/A'}</p>
                          </div>
                        );
                      })}
                   </div>
                </section>

                {selectedLead.formData?.message && (
                  <section>
                    <h3 className="text-[10px] font-black text-emerald-600 uppercase tracking-[0.2em] mb-6">Additional Message</h3>
                    <div className="p-8 bg-gray-50 rounded-[2rem] border border-gray-100 italic text-gray-700 font-medium leading-relaxed shadow-inner">
                        "{selectedLead.formData.message}"
                    </div>
                  </section>
                )}

                <section>
                   <h3 className="text-[10px] font-black text-emerald-600 uppercase tracking-[0.2em] mb-6">Action Center</h3>
                   <div className="flex gap-4">
                      {[
                        { label: 'In Progress', status: 'IN_PROGRESS', icon: Clock, color: 'Amber' },
                        { label: 'Converted', status: 'CONVERTED', icon: CheckCircle, color: 'Emerald' },
                        { label: 'Rejected', status: 'REJECTED', icon: XCircle, color: 'Red' }
                      ].map((action) => (
                        <button 
                          key={action.status}
                          onClick={() => statusMutation.mutate({ id: selectedLead.id, status: action.status })}
                          className={`flex-1 p-6 rounded-[2rem] border transition-all flex flex-col items-center gap-3 ${
                            selectedLead.status === action.status 
                             ? `bg-${action.color.toLowerCase()}-600 text-white shadow-xl ring-4 ring-${action.color.toLowerCase()}-500/10` 
                             : `bg-white border-gray-100 text-gray-400 hover:border-${action.color.toLowerCase()}-200 hover:text-${action.color.toLowerCase()}-600`
                          }`}
                        >
                           <action.icon className="w-6 h-6" />
                           <span className="text-[10px] font-black uppercase tracking-widest">{action.label}</span>
                        </button>
                      ))}
                   </div>
                </section>
             </div>
          </div>
        </div>
      )}
    </div>
  );
}
