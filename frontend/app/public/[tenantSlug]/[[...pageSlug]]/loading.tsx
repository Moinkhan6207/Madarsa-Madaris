'use client';
import React from 'react';

export default function Loading() {
  return (
    <div className="min-h-screen bg-white">
      {/* Navbar Skeleton */}
      <div className="h-20 border-b border-gray-100 flex items-center px-6 justify-between animate-pulse">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gray-100 rounded-xl" />
          <div className="w-32 h-6 bg-gray-100 rounded-lg hidden sm:block" />
        </div>
        <div className="flex gap-4">
          <div className="w-20 h-4 bg-gray-50 rounded-full hidden lg:block" />
          <div className="w-20 h-4 bg-gray-50 rounded-full hidden lg:block" />
          <div className="w-20 h-4 bg-gray-50 rounded-full hidden lg:block" />
        </div>
        <div className="w-24 h-10 bg-gray-100 rounded-xl" />
      </div>

      <main className="max-w-7xl mx-auto px-6 py-20 space-y-12 animate-pulse">
        {/* Hero Section Skeleton */}
        <div className="space-y-6 text-center">
          <div className="w-32 h-6 bg-gray-100 rounded-full mx-auto" />
          <div className="w-full max-w-2xl h-16 bg-gray-100 rounded-3xl mx-auto" />
          <div className="w-full max-w-lg h-6 bg-gray-50 rounded-xl mx-auto" />
          <div className="flex justify-center gap-4 pt-4">
            <div className="w-40 h-14 bg-gray-100 rounded-2xl" />
            <div className="w-40 h-14 bg-gray-50 rounded-2xl" />
          </div>
        </div>

        {/* Content Blocks Skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 pt-20">
          <div className="aspect-[4/5] bg-gray-100 rounded-[3rem]" />
          <div className="space-y-8 py-10">
            <div className="w-24 h-6 bg-gray-100 rounded-full" />
            <div className="w-full h-12 bg-gray-100 rounded-2xl" />
            <div className="space-y-4">
              <div className="w-full h-4 bg-gray-50 rounded-full" />
              <div className="w-full h-4 bg-gray-50 rounded-full" />
              <div className="w-3/4 h-4 bg-gray-50 rounded-full" />
            </div>
            <div className="flex gap-4">
              <div className="w-32 h-12 bg-gray-100 rounded-2xl" />
              <div className="w-32 h-12 bg-gray-50 rounded-2xl" />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
