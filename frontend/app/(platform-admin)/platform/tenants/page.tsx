'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getTenants, approveTenant, suspendTenant, activateTenant } from '@services/platform.service';
import { TenantStatus } from '@/types/tenant';
import { StatusBadge } from '@components/platform/StatusBadge';
import Image from 'next/image';
import { Loader2, RefreshCcw, ShieldCheck, ShieldAlert, Ban, Eye, X } from 'lucide-react';

function TenantDetailsModal({ tenant, onClose }: { tenant: any; onClose: () => void }) {
  if (!tenant) return null;

  const backendUrl = (process.env.NEXT_PUBLIC_API_BASE_URL || process.env.NEXT_PUBLIC_API_URL)?.replace('/api/v1', '') || 'http://localhost:5001';
  let rawLogo = tenant.branding?.logoUrl;
  if (rawLogo && !rawLogo.startsWith('http') && !rawLogo.startsWith('/')) {
    rawLogo = '/' + rawLogo;
  }
  const logoSrc = rawLogo?.startsWith('http') 
    ? rawLogo 
    : rawLogo 
      ? `${backendUrl}${rawLogo}` 
      : null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/40 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-3xl overflow-hidden animate-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-gray-50/50">
          <div>
            <h3 className="text-xl font-bold text-gray-900">{tenant.displayName} - Review Details</h3>
            <p className="text-xs text-gray-500 font-medium">{tenant.slug}</p>
          </div>
          <button onClick={onClose} className="p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-600 rounded-lg transition">
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <div className="p-6 max-h-[70vh] overflow-y-auto space-y-6">
          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-4">
              <h4 className="font-semibold text-gray-900 border-b pb-2">Institution Data</h4>
              <ul className="text-sm space-y-2 text-gray-600">
                <li><span className="font-medium text-gray-800">Legal Name:</span> {tenant.legalName || tenant.profile?.trustName || 'N/A'}</li>
                <li><span className="font-medium text-gray-800">Type:</span> <span className="bg-gray-100 px-2 py-0.5 rounded text-xs">{tenant.institutionType}</span></li>
                <li><span className="font-medium text-gray-800">Email:</span> {tenant.profile?.email || tenant.primaryEmail || 'N/A'}</li>
                <li><span className="font-medium text-gray-800">Phone:</span> {tenant.profile?.phone || tenant.primaryPhone || 'N/A'}</li>
              </ul>
            </div>
            
            <div className="space-y-4">
              <h4 className="font-semibold text-gray-900 border-b pb-2">Profile & Location</h4>
              <ul className="text-sm space-y-2 text-gray-600">
                <li><span className="font-medium text-gray-800">City / State:</span> {tenant.profile?.city || 'N/A'}, {tenant.profile?.state || ''}</li>
                <li><span className="font-medium text-gray-800">Country:</span> {tenant.profile?.country || 'N/A'}</li>
                <li><span className="font-medium text-gray-800">Division:</span> {tenant.profile?.divisionType || 'BOTH'}</li>
                <li><span className="font-medium text-gray-800">Facilities:</span> 
                  {tenant.profile?.hasHostel && ' Hostel |'} {tenant.profile?.hasTransport && ' Transport |'} {tenant.profile?.hasMasjidLinkedOps && ' Masjid'}
                </li>
              </ul>
            </div>
            
            <div className="space-y-4 border-t pt-4 col-span-2">
              <h4 className="font-semibold text-gray-900">Branding Look & Feel</h4>
              <div className="flex gap-4">
                 <div className="relative w-16 h-16 rounded-xl border border-gray-200 bg-gray-50 flex items-center justify-center overflow-hidden">
                    {logoSrc ? (
                      <Image src={logoSrc} alt="Logo" fill className="object-cover" />
                    ) : (
                      <span className="text-xs text-gray-400">No Logo</span>
                    )}
                 </div>

                 <div className="flex flex-col justify-center space-y-1">
                    <div className="flex items-center gap-2 text-sm text-gray-600">Primary Color: 
                      <span className="w-4 h-4 rounded shadow-sm border" style={{ backgroundColor: tenant.branding?.primaryColor || '#059669' }}></span>
                      {tenant.branding?.primaryColor || 'Default'}
                    </div>
                    <div className="text-sm text-gray-600">Public Contact: {tenant.branding?.publicContactPhone || 'N/A'}</div>
                 </div>
              </div>
            </div>
          </div>
        </div>
        
        <div className="px-6 py-4 border-t border-gray-100 bg-gray-50 flex justify-end gap-3">
           <button onClick={onClose} className="px-5 py-2 font-medium text-gray-600 bg-white border border-gray-200 rounded-xl shadow-sm hover:bg-gray-50">
             Close
           </button>
        </div>
      </div>
    </div>
  );
}

export default function TenantsPage() {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [selectedTenant, setSelectedTenant] = useState<any>(null);

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['tenants', page],
    queryFn: () => getTenants({ page, limit: 10 }),
  });

  const mutation = useMutation({
    mutationFn: async ({ id, action }: { id: string; action: 'approve' | 'suspend' | 'activate' }) => {
      if (action === 'approve') return approveTenant(id);
      if (action === 'suspend') return suspendTenant(id);
      return activateTenant(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tenants'] });
    },
    onError: (err: any) => {
      alert(`Action failed: ${err.message || 'Unknown error occurred. (Draft tenants cannot be directly approved without completing profile setup)'}`);
    }
  });

  const handleAction = async (id: string, name: string, action: 'approve' | 'suspend' | 'activate') => {
    if (!window.confirm(`Are you sure you want to ${action} "${name}"?`)) return;
    mutation.mutate({ id, action });
  };

  if (isLoading) return (
    <div className="flex h-64 items-center justify-center">
      <Loader2 className="w-8 h-8 animate-spin text-emerald-600" />
    </div>
  );

  const tenants = data?.tenants || [];

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Institutions Control</h1>
          <p className="text-sm text-gray-500 mt-1">Review onboarding profiles and manage activations.</p>
        </div>
        <button 
          onClick={() => refetch()}
          className="p-2 rounded-lg bg-white border shadow-sm hover:bg-gray-50 transition-colors text-gray-500"
          title="Refresh List"
        >
          <RefreshCcw className="w-5 h-5" />
        </button>
      </div>

      <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Institution</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Created</th>
                <th className="px-6 py-4 text-right text-xs font-bold text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {tenants.map((tenant: any) => (
                <tr key={tenant.id} className="hover:bg-gray-50 transition-all group">
                  <td className="px-6 py-4">
                    <div className="font-semibold text-gray-900">{tenant.displayName}</div>
                    <div className="text-xs text-gray-400 mt-0.5">{tenant.slug}</div>
                  </td>
                  <td className="px-6 py-4">
                    <StatusBadge status={tenant.status} />
                  </td>
                  <td className="px-6 py-4 text-xs font-medium text-gray-500">
                    {new Date(tenant.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 text-right space-x-2">
                    <button
                      onClick={() => setSelectedTenant(tenant)}
                      className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-600 hover:text-blue-700 bg-blue-50 px-3 py-1.5 rounded-lg border border-blue-100 transition-all hover:bg-blue-100 opacity-0 group-hover:opacity-100"
                    >
                      <Eye className="w-3.5 h-3.5" /> View
                    </button>
                    {tenant.status === TenantStatus.PENDING_ACTIVATION && (
                      <button
                        onClick={() => handleAction(tenant.id, tenant.displayName, 'approve')}
                        className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-600 hover:text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-lg border border-emerald-100 transition-all hover:bg-emerald-100"
                      >
                        <ShieldCheck className="w-3.5 h-3.5" /> Approve
                      </button>
                    )}
                    {tenant.status === TenantStatus.ACTIVE && (
                      <button
                        onClick={() => handleAction(tenant.id, tenant.displayName, 'suspend')}
                        className="inline-flex items-center gap-1.5 text-xs font-bold text-red-600 hover:text-red-700 bg-red-50 px-3 py-1.5 rounded-lg border border-red-100 transition-all hover:bg-red-100"
                      >
                        <Ban className="w-3.5 h-3.5" /> Suspend
                      </button>
                    )}
                    {tenant.status === TenantStatus.SUSPENDED && (
                      <button
                        onClick={() => handleAction(tenant.id, tenant.displayName, 'activate')}
                        className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-600 hover:text-amber-700 bg-amber-50 px-3 py-1.5 rounded-lg border border-amber-100 transition-all hover:bg-amber-100"
                      >
                        <ShieldAlert className="w-3.5 h-3.5" /> Activate
                      </button>
                    )}
                  </td>
                </tr>
              ))}
              {tenants.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center">
                    <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-gray-100 text-gray-400 mb-3">
                      <Ban className="w-6 h-6" />
                    </div>
                    <p className="text-gray-500 font-medium text-sm">No institutions found.</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
      
      {/* Detail Review Modal */}
      {selectedTenant && (
        <TenantDetailsModal 
          tenant={selectedTenant} 
          onClose={() => setSelectedTenant(null)} 
        />
      )}
    </div>
  );
}
