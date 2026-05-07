export const shadows = {
  // Web: shadow-[0_8px_30px_rgb(0,0,0,0.02)] - ultra subtle
  xs: {
    shadowColor: '#0f172a',
    shadowOpacity: 0.02,
    shadowRadius: 30,
    shadowOffset: { width: 0, height: 8 },
    elevation: 1,
  },
  // Web: shadow-sm
  sm: {
    shadowColor: '#0f172a',
    shadowOpacity: 0.04,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  // Web: shadow-[0_8px_30px_rgb(0,0,0,0.04)]
  md: {
    shadowColor: '#0f172a',
    shadowOpacity: 0.04,
    shadowRadius: 30,
    shadowOffset: { width: 0, height: 8 },
    elevation: 4,
  },
  // Web: shadow-lg shadow-slate-200/50
  lg: {
    shadowColor: '#0f172a',
    shadowOpacity: 0.08,
    shadowRadius: 24,
    shadowOffset: { width: 0, height: 12 },
    elevation: 8,
  },
  // Web: shadow-xl
  xl: {
    shadowColor: '#0f172a',
    shadowOpacity: 0.12,
    shadowRadius: 32,
    shadowOffset: { width: 0, height: 16 },
    elevation: 12,
  },
  // Colored shadows for buttons
  primary: {
    shadowColor: '#059669',
    shadowOpacity: 0.2,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 6 },
    elevation: 6,
  },
  slate: {
    shadowColor: '#0f172a',
    shadowOpacity: 0.1,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 6 },
    elevation: 6,
  },
};
