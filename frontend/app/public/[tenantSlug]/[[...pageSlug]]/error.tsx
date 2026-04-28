'use client';
import React from 'react';
import { AlertCircle, RefreshCw, Home } from 'lucide-react';
import Link from 'next/link';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-white p-6">
      <div className="max-w-md w-full text-center">
        <div className="w-20 h-20 bg-red-50 text-red-500 rounded-3xl flex items-center justify-center mx-auto mb-8 shadow-sm">
          <AlertCircle className="w-10 h-10" />
        </div>
        
        <h1 className="text-3xl font-black text-gray-900 tracking-tight mb-4 uppercase">
          Something went wrong
        </h1>
        
        <p className="text-gray-500 font-medium mb-10 leading-relaxed">
          {error.message || "We encountered an unexpected error while loading this page. Please try again or return home."}
        </p>

        <div className="flex flex-col gap-3">
          <button
            onClick={() => reset()}
            className="flex items-center justify-center gap-2 w-full py-4 bg-gray-900 text-white rounded-2xl font-black hover:bg-black transition-all shadow-xl"
          >
            <RefreshCw className="w-5 h-5" />
            Try Again
          </button>
          
          <Link
            href="/"
            className="flex items-center justify-center gap-2 w-full py-4 bg-white text-gray-900 border border-gray-100 rounded-2xl font-black hover:bg-gray-50 transition-all"
          >
            <Home className="w-5 h-5" />
            Back to Dashboard
          </Link>
        </div>

        <div className="mt-12 pt-8 border-t border-gray-50">
          <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
            Error Digest: {error.digest || 'N/A'}
          </p>
        </div>
      </div>
    </div>
  );
}
