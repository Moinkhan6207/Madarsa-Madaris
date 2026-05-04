'use client';

import { useReportWebVitals } from 'next/web-vitals';

export default function WebVitalsReporter() {
  useReportWebVitals((metric) => {
    if (process.env.NODE_ENV !== 'development') return;

    const payload = {
      name: metric.name,
      value: Number(metric.value.toFixed(2)),
      rating: metric.rating,
      navigationType: metric.navigationType,
      id: metric.id,
    };

    // Keep lightweight logging for profiling in browser devtools.
    console.debug('[WebVitals]', payload);
  });

  return null;
}
