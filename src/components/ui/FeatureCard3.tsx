'use client';

import React from 'react';
import { motion } from 'framer-motion';

interface FeatureCard3Props {
  icon: React.ReactNode;
  tag?: string;
  title: string;
  description: string;
  footnote?: string;
  className?: string;
  delay?: number;
}

export default function FeatureCard3({
  icon,
  tag,
  title,
  description,
  footnote,
  className = '',
  delay = 0,
}: FeatureCard3Props) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30, rotateX: 6 }}
      whileInView={{ opacity: 1, y: 0, rotateX: 0 }}
      viewport={{ once: true, margin: '-40px' }}
      transition={{ duration: 0.6, delay, ease: [0.16, 1, 0.3, 1] }}
      whileHover={{ y: -4, transition: { duration: 0.2 } }}
      className={`light-card p-6 sm:p-7 flex flex-col justify-between transition-all duration-300 hover:shadow-xl hover:shadow-black/5 hover:border-gray-300/80 ${className}`}
    >
      <div className="space-y-4">
        {/* Top Icon Pill */}
        <div className="flex items-center justify-between">
          <div className="w-10 h-10 rounded-2xl bg-[#11382B]/5 text-[#11382B] flex items-center justify-center border border-[#11382B]/10">
            {icon}
          </div>
          {tag && (
            <span className="pill-badge bg-gray-100 text-gray-700 text-[11px] font-bold">
              {tag}
            </span>
          )}
        </div>

        {/* Title */}
        <h3 className="text-lg sm:text-xl font-extrabold text-gray-900 tracking-tight leading-snug">
          {title}
        </h3>

        {/* Description */}
        <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
          {description}
        </p>
      </div>

      {footnote && (
        <div className="pt-4 mt-6 border-t border-gray-100 text-[11px] font-semibold text-emerald-800 flex items-center gap-1">
          <span>{footnote}</span>
        </div>
      )}
    </motion.div>
  );
}
