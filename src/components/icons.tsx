"use client";

// Nest — inline Lucide-style icon set (ported from app/shell.jsx `NIcon`).
// PRODUCTION NOTE: replace with lucide-react + @carvana/ds-icons (Cvna/Spot). No emoji.

import type { ReactElement } from "react";

type P = { s?: number };
const base = {
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 2,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
};

export const NIcon: Record<string, (p?: P) => ReactElement> = {
  dash: (p = {}) => (<svg width={p.s || 22} height={p.s || 22} viewBox="0 0 24 24" {...base}><rect x="3" y="3" width="7" height="9" rx="1.5" /><rect x="14" y="3" width="7" height="5" rx="1.5" /><rect x="14" y="12" width="7" height="9" rx="1.5" /><rect x="3" y="16" width="7" height="5" rx="1.5" /></svg>),
  roleplay: (p = {}) => (<svg width={p.s || 22} height={p.s || 22} viewBox="0 0 24 24" {...base}><path d="M8 10h8M8 14h5" /><path d="M21 11.5a8.38 8.38 0 0 1-8.5 8.5 8.5 8.5 0 0 1-3.8-.9L3 21l1.9-5.7A8.38 8.38 0 0 1 4 11.5 8.5 8.5 0 0 1 12.5 3 8.38 8.38 0 0 1 21 11.5z" /></svg>),
  classes: (p = {}) => (<svg width={p.s || 22} height={p.s || 22} viewBox="0 0 24 24" {...base}><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" /></svg>),
  advocate: (p = {}) => (<svg width={p.s || 22} height={p.s || 22} viewBox="0 0 24 24" {...base}><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="m16 11 2 2 4-4" /></svg>),
  coaching: (p = {}) => (<svg width={p.s || 22} height={p.s || 22} viewBox="0 0 24 24" {...base}><path d="M9 11l3 3L22 4" /><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" /></svg>),
  report: (p = {}) => (<svg width={p.s || 22} height={p.s || 22} viewBox="0 0 24 24" {...base}><circle cx="12" cy="8" r="6" /><path d="M15.477 12.89 17 22l-5-3-5 3 1.523-9.11" /></svg>),
  bell: (p = {}) => (<svg width={p.s || 20} height={p.s || 20} viewBox="0 0 24 24" {...base}><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" /><path d="M13.73 21a2 2 0 0 1-3.46 0" /></svg>),
  search: (p = {}) => (<svg width={p.s || 18} height={p.s || 18} viewBox="0 0 24 24" {...base}><circle cx="11" cy="11" r="7" /><path d="m21 21-4.3-4.3" /></svg>),
  chevDown: (p = {}) => (<svg width={p.s || 16} height={p.s || 16} viewBox="0 0 24 24" {...base}><path d="m6 9 6 6 6-6" /></svg>),
  up: (p = {}) => (<svg width={p.s || 16} height={p.s || 16} viewBox="0 0 24 24" {...base} strokeWidth={2.2}><path d="M7 17 17 7M9 7h8v8" /></svg>),
  down: (p = {}) => (<svg width={p.s || 16} height={p.s || 16} viewBox="0 0 24 24" {...base} strokeWidth={2.2}><path d="M7 7 17 17M17 9v8H9" /></svg>),
  filter: (p = {}) => (<svg width={p.s || 16} height={p.s || 16} viewBox="0 0 24 24" {...base}><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" /></svg>),
  flag: (p = {}) => (<svg width={p.s || 16} height={p.s || 16} viewBox="0 0 24 24" {...base}><path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z" /><line x1="4" y1="22" x2="4" y2="15" /></svg>),
  spark: (p = {}) => (<svg width={p.s || 16} height={p.s || 16} viewBox="0 0 24 24" {...base}><path d="M3 17l6-6 4 4 8-8" /><path d="M21 7v6h-6" /></svg>),
  dot: (p = {}) => (<svg width={p.s || 16} height={p.s || 16} viewBox="0 0 24 24" fill="currentColor"><circle cx="12" cy="12" r="4" /></svg>),
  back: (p = {}) => (<svg width={p.s || 18} height={p.s || 18} viewBox="0 0 24 24" {...base}><path d="M19 12H5M12 19l-7-7 7-7" /></svg>),
  chevRight: (p = {}) => (<svg width={p.s || 16} height={p.s || 16} viewBox="0 0 24 24" {...base}><path d="m9 18 6-6-6-6" /></svg>),
  calendar: (p = {}) => (<svg width={p.s || 16} height={p.s || 16} viewBox="0 0 24 24" {...base}><rect x="3" y="4" width="18" height="18" rx="2" /><path d="M16 2v4M8 2v4M3 10h18" /></svg>),
  mail: (p = {}) => (<svg width={p.s || 16} height={p.s || 16} viewBox="0 0 24 24" {...base}><rect x="2" y="4" width="20" height="16" rx="2" /><path d="m22 7-10 6L2 7" /></svg>),
  check: (p = {}) => (<svg width={p.s || 16} height={p.s || 16} viewBox="0 0 24 24" {...base} strokeWidth={2.4}><path d="M20 6 9 17l-5-5" /></svg>),
  play: (p = {}) => (<svg width={p.s || 16} height={p.s || 16} viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z" /></svg>),
  mic: (p = {}) => (<svg width={p.s || 16} height={p.s || 16} viewBox="0 0 24 24" {...base}><rect x="9" y="2" width="6" height="12" rx="3" /><path d="M19 10a7 7 0 0 1-14 0M12 19v3" /></svg>),
  download: (p = {}) => (<svg width={p.s || 16} height={p.s || 16} viewBox="0 0 24 24" {...base}><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3" /></svg>),
  ext: (p = {}) => (<svg width={p.s || 16} height={p.s || 16} viewBox="0 0 24 24" {...base}><path d="M15 3h6v6M10 14 21 3M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" /></svg>),
  x: (p = {}) => (<svg width={p.s || 16} height={p.s || 16} viewBox="0 0 24 24" {...base}><path d="M18 6 6 18M6 6l12 12" /></svg>),
  gauge: (p = {}) => (<svg width={p.s || 22} height={p.s || 22} viewBox="0 0 24 24" {...base}><path d="M12 14 8 10" /><path d="M3.34 19a10 10 0 1 1 17.32 0" /><circle cx="12" cy="14" r="1.5" fill="currentColor" stroke="none" /></svg>),
  assign: (p = {}) => (<svg width={p.s || 22} height={p.s || 22} viewBox="0 0 24 24" {...base}><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" /><rect x="8" y="2" width="8" height="4" rx="1" /><path d="M9 12h6M9 16h4" /></svg>),
  whistle: (p = {}) => (<svg width={p.s || 22} height={p.s || 22} viewBox="0 0 24 24" {...base}><circle cx="9" cy="14" r="6" /><path d="M9 10V8h7l4-3v6a3 3 0 0 1-3 3h-3" /><path d="M9 14h.01" /></svg>),
  archive: (p = {}) => (<svg width={p.s || 22} height={p.s || 22} viewBox="0 0 24 24" {...base}><rect x="3" y="4" width="18" height="4" rx="1" /><path d="M5 8v11a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V8M10 12h4" /></svg>),
  plus: (p = {}) => (<svg width={p.s || 16} height={p.s || 16} viewBox="0 0 24 24" {...base}><path d="M12 5v14M5 12h14" /></svg>),
  grip: (p = {}) => (<svg width={p.s || 16} height={p.s || 16} viewBox="0 0 24 24" fill="currentColor"><circle cx="9" cy="6" r="1.6" /><circle cx="15" cy="6" r="1.6" /><circle cx="9" cy="12" r="1.6" /><circle cx="15" cy="12" r="1.6" /><circle cx="9" cy="18" r="1.6" /><circle cx="15" cy="18" r="1.6" /></svg>),
  clock: (p = {}) => (<svg width={p.s || 16} height={p.s || 16} viewBox="0 0 24 24" {...base}><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></svg>),
  alert: (p = {}) => (<svg width={p.s || 16} height={p.s || 16} viewBox="0 0 24 24" {...base}><path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" /><path d="M12 9v4M12 17h.01" /></svg>),
  search2: (p = {}) => (<svg width={p.s || 18} height={p.s || 18} viewBox="0 0 24 24" {...base}><circle cx="11" cy="11" r="7" /><path d="m21 21-4.3-4.3" /></svg>),
  trend: (p = {}) => (<svg width={p.s || 16} height={p.s || 16} viewBox="0 0 24 24" {...base}><path d="M3 17l6-6 4 4 8-8" /><path d="M21 7v6h-6" /></svg>),
  trophy: (p = {}) => (<svg width={p.s || 16} height={p.s || 16} viewBox="0 0 24 24" {...base}><path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6M18 9h1.5a2.5 2.5 0 0 0 0-5H18M4 22h16M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22M18 2H6v7a6 6 0 0 0 12 0V2z" /></svg>),
};
