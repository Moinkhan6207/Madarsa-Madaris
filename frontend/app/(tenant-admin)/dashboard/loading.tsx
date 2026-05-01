export default function Loading() {
  return (
    <div className="flex h-screen items-center justify-center bg-gray-50">
      <div className="text-center space-y-4">
        <div className="w-16 h-16 bg-emerald-100 rounded-full mx-auto animate-pulse flex items-center justify-center">
          <div className="w-8 h-8 bg-emerald-600 rounded-full animate-spin" />
        </div>
        <div className="h-4 w-32 bg-gray-200 rounded animate-pulse mx-auto"></div>
        <div className="h-3 w-48 bg-gray-100 rounded animate-pulse mx-auto"></div>
      </div>
    </div>
  );
}
