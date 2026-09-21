'use client';

import React from 'react';
import { motion } from 'framer-motion';

export function InlineBadge({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <span className={`inline-flex items-center align-middle mx-1.5 px-2.5 py-1 rounded-full bg-emerald-50 border border-emerald-200/70 shadow-sm text-xs text-emerald-900 font-bold ${className}`}>
      {children}
    </span>
  );
}

export function InlineIconPill({ icon, bg = 'bg-emerald-100/80', text = 'text-emerald-900' }: { icon: React.ReactNode; bg?: string; text?: string }) {
  return (
    <span className={`inline-flex items-center justify-center align-middle mx-1.5 w-8 h-8 sm:w-10 sm:h-10 rounded-full ${bg} ${text} shadow-sm border border-black/5`}>
      {icon}
    </span>
  );
}
