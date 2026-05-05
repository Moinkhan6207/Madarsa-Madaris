import type { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Idara Management System',
    short_name: 'Idara',
    description: 'Multi-tenant SaaS platform for Madarsa/Idara management',
    start_url: '/',
    display: 'standalone',
    background_color: '#f8fafc',
    theme_color: '#0f172a',
    orientation: 'portrait',
    icons: [
      {
        src: '/assets/makka_sharif.png',
        sizes: '192x192',
        type: 'image/png',
      },
      {
        src: '/assets/makka_sharif.png',
        sizes: '512x512',
        type: 'image/png',
      },
    ],
  };
}
