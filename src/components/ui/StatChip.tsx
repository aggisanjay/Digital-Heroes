'use client';

import React from 'react';
import { motion } from 'framer-motion';

interface StatChipProps {
  icon?: React.ReactNode;
  label?: string;
  value: string | number;
  highlight?: string;
  className?: string;
  floatDelay?: number;
}

export default function StatChip({
  icon,
  label,
  value,
  highlight,
  className = '',
  floatDelay = 0,
}: StatChipProps) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ 
        opacity: 1, 
        scale: 1,
        y: [0, -6, 0],
      }}
      transition={{
        opacity: { duration: 0.5, delay: floatDelay },
        scale: { duration: 0.5, delay: floatDelay },
        y: {
          duration: 4,
          repeat: Infinity,
          repeatType: 'reverse',
          ease: 'easeInOut',
          delay: floatDelay,
        }
      }}
      className={`pill-container px-4 py-2 flex items-center gap-2.5 shadow-xl shadow-black/5 ${className}`}
    >
      {icon && (
        <div className="w-7 h-7 rounded-full bg-emerald-50 text-emerald-800 flex items-center justify-center shrink-0">
          {icon}
        </div>
      )}
      <div className="flex flex-col text-left leading-tight">
        <div className="flex items-center gap-1.5">
          <span className="font-extrabold text-sm text-gray-900 font-mono tracking-tight">
            {value}
          </span>
          {highlight && (
            <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100/70 px-1.5 py-0.5 rounded-full">
              {highlight}
            </span>
          )}
        </div>
        {label && (
          <span className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider">
            {label}
          </span>
        )}
      </div>
    </motion.div>
  );
}
