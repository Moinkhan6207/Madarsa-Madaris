import { Loader2 } from 'lucide-react';

export default function GlobalLoading() {
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-white/50 backdrop-blur-sm z-50">
      <div className="flex flex-col items-center gap-4">
        <Loader2 className="w-10 h-10 animate-spin text-emerald-600" />
        <p className="text-sm font-medium text-gray-500 animate-pulse">Loading IdaraSys...</p>
      </div>
    </div>
  );
}
