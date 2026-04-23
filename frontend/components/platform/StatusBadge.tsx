import { TenantStatus } from '../../types/tenant';

const STATUS_CONFIG = {
  [TenantStatus.ACTIVE]: { label: 'Active', classes: 'bg-emerald-100 text-emerald-700 border-emerald-200' },
  [TenantStatus.PENDING_ACTIVATION]: { label: 'Pending Approval', classes: 'bg-amber-100 text-amber-700 border-amber-200' },
  [TenantStatus.DRAFT]: { label: 'Draft', classes: 'bg-gray-100 text-gray-700 border-gray-200' },
  [TenantStatus.SUSPENDED]: { label: 'Suspended', classes: 'bg-red-100 text-red-700 border-red-200' },
  [TenantStatus.ARCHIVED]: { label: 'Archived', classes: 'bg-gray-200 text-gray-800 border-gray-300' },
};

export function StatusBadge({ status }: { status: TenantStatus }) {
  const config = STATUS_CONFIG[status] || { label: status, classes: 'bg-gray-100 text-gray-600' };
  
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold border ${config.classes}`}>
      {config.label}
    </span>
  );
}
