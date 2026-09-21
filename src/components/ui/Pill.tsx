'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

interface PillProps {
  children: React.ReactNode;
  variant?: 'primary' | 'mint' | 'coral' | 'outline' | 'subtle' | 'dark';
  size?: 'sm' | 'md' | 'lg';
  href?: string;
  onClick?: () => void;
  className?: string;
  icon?: React.ReactNode;
  arrow?: boolean;
  type?: 'button' | 'submit' | 'reset';
  disabled?: boolean;
}

export default function Pill({
  children,
  variant = 'primary',
  size = 'md',
  href,
  onClick,
  className = '',
  icon,
  arrow = false,
  type = 'button',
  disabled = false,
}: PillProps) {
  // Proportioned sizing with generous horizontal & vertical padding
  const sizeClasses = {
    sm: 'px-4 py-1.5 text-xs font-semibold gap-2 min-h-[34px]',
    md: 'px-5 py-2.5 text-xs sm:text-sm font-bold gap-2.5 min-h-[42px]',
    lg: 'px-6 py-3.5 text-sm sm:text-base font-bold gap-3 min-h-[50px]',
  }[size];

  // Variant styling matching the Hooma reference design system
  const variantClasses = {
    primary: 'bg-[#11382B] hover:bg-[#0A241B] text-white shadow-md shadow-[#11382B]/20 active:scale-[0.98]',
    mint: 'bg-[#00D284] hover:bg-[#00B974] text-[#111827] shadow-md shadow-[#00D284]/25 active:scale-[0.98]',
    coral: 'bg-[#E25B37] hover:bg-[#C84B2B] text-white shadow-md shadow-[#E25B37]/25 active:scale-[0.98]',
    outline: 'bg-white hover:bg-gray-50 text-gray-900 border border-gray-200/90 shadow-2xs hover:border-gray-300 active:scale-[0.98]',
    subtle: 'bg-gray-100 hover:bg-gray-200 text-gray-800 border border-gray-200/60 active:scale-[0.98]',
    dark: 'bg-[#111827] hover:bg-black text-white shadow-lg shadow-black/10 active:scale-[0.98]',
  }[variant];

  // Hooma Signature Enclosed Arrow Circle on right end
  const arrowCircleSizes = {
    sm: 'w-5 h-5 -mr-1',
    md: 'w-6 h-6 -mr-1',
    lg: 'w-7 h-7 -mr-1.5',
  }[size];

  const arrowIconSizes = {
    sm: 'w-3 h-3',
    md: 'w-3.5 h-3.5',
    lg: 'w-4 h-4',
  }[size];

  const arrowCircleColors = {
    primary: 'bg-white/20 text-white',
    mint: 'bg-[#11382B] text-white',
    coral: 'bg-white/20 text-white',
    outline: 'bg-gray-100 text-gray-800',
    subtle: 'bg-white text-gray-800',
    dark: 'bg-white/20 text-white',
  }[variant];

  const combinedClasses = `group inline-flex items-center justify-center rounded-full transition-all duration-200 select-none cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed ${sizeClasses} ${variantClasses} ${className}`;

  const content = (
    <>
      {icon && <span className="shrink-0 transition-transform group-hover:scale-105">{icon}</span>}
      <span className="tracking-tight">{children}</span>
      {arrow && (
        <span
          className={`shrink-0 rounded-full flex items-center justify-center transition-transform duration-200 group-hover:translate-x-0.5 ${arrowCircleSizes} ${arrowCircleColors}`}
        >
          <ArrowRight className={arrowIconSizes} />
        </span>
      )}
    </>
  );

  if (href) {
    return (
      <Link href={href} className={combinedClasses}>
        {content}
      </Link>
    );
  }

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={combinedClasses}
    >
      {content}
    </button>
  );
}
