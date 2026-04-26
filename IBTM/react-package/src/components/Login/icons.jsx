// src/components/Login/icons.jsx
// Ícones inline — sem dependência externa.
import React from 'react';

const base = {
  width: 18, height: 18, viewBox: '0 0 24 24',
  fill: 'none', stroke: 'currentColor', strokeWidth: 1.6,
  strokeLinecap: 'round', strokeLinejoin: 'round',
};

export const UserIcon = (p) => (
  <svg {...base} {...p}>
    <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/>
    <circle cx="12" cy="7" r="4"/>
  </svg>
);

export const LockIcon = (p) => (
  <svg {...base} {...p}>
    <rect x="3" y="11" width="18" height="11" rx="2"/>
    <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
  </svg>
);

export const EyeIcon = (p) => (
  <svg {...base} {...p}>
    <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7z"/>
    <circle cx="12" cy="12" r="3"/>
  </svg>
);

export const EyeOffIcon = (p) => (
  <svg {...base} {...p}>
    <path d="M17.94 17.94A10.94 10.94 0 0 1 12 19c-7 0-10-7-10-7a18.45 18.45 0 0 1 5.06-5.94"/>
    <path d="M9.9 4.24A10.94 10.94 0 0 1 12 4c7 0 10 7 10 7a18.5 18.5 0 0 1-2.16 3.19"/>
    <path d="M14.12 14.12a3 3 0 1 1-4.24-4.24"/>
    <path d="M1 1l22 22"/>
  </svg>
);

export const ArrowRightIcon = (p) => (
  <svg {...base} width={16} height={16} strokeWidth={2} {...p}>
    <path d="M5 12h14M12 5l7 7-7 7"/>
  </svg>
);

export const ChevronLeftIcon = (p) => (
  <svg {...base} strokeWidth={1.8} {...p}><path d="M15 18l-6-6 6-6"/></svg>
);

export const ChevronRightIcon = (p) => (
  <svg {...base} strokeWidth={1.8} {...p}><path d="M9 18l6-6-6-6"/></svg>
);

export const CheckIcon = (p) => (
  <svg {...base} width={16} height={16} strokeWidth={2.4} {...p}>
    <path d="M20 6L9 17l-5-5"/>
  </svg>
);

export const SpinnerIcon = (p) => (
  <svg {...base} width={16} height={16} strokeWidth={2.5} style={{animation: 'ibtm-spin 0.8s linear infinite'}} {...p}>
    <path d="M21 12a9 9 0 1 1-6.2-8.55"/>
  </svg>
);
