'use client';

import React from 'react';
import { Shield, CheckCircle2, AlertTriangle, User } from 'lucide-react';

export type RoleVariant = 'admin' | 'active' | 'lapsed' | 'visitor';

interface RoleBadgeProps {
  variant: RoleVariant;
  /** Show full label text or just the icon+dot */
  showLabel?: boolean;
  /** Size variant */
  size?: 'sm' | 'md';
}

const VARIANTS: Record<RoleVariant, {
  label: string;
  bgClass: string;
  borderClass: string;
  textClass: string;
  dotClass: string;
  icon: typeof Shield;
}> = {
  admin: {
    label: 'Admin',
    bgClass: 'bg-[#FF6E40]/10',
    borderClass: 'border-[#FF6E40]/30',
    textClass: 'text-[#FF6E40]',
    dotClass: 'bg-[#FF6E40]',
    icon: Shield,
  },
  active: {
    label: 'Subscriber',
    bgClass: 'bg-[#00F29D]/10',
    borderClass: 'border-[#00F29D]/30',
    textClass: 'text-[#00F29D]',
    dotClass: 'bg-[#00F29D]',
    icon: CheckCircle2,
  },
  lapsed: {
    label: 'Lapsed',
    bgClass: 'bg-amber-500/10',
    borderClass: 'border-amber-500/30',
    textClass: 'text-amber-400',
    dotClass: 'bg-amber-400',
    icon: AlertTriangle,
  },
  visitor: {
    label: 'Visitor',
    bgClass: 'bg-white/5',
    borderClass: 'border-white/10',
    textClass: 'text-[#94A3B8]',
    dotClass: 'bg-[#64748B]',
    icon: User,
  },
};

export function getRoleVariant(role: string, subscriptionStatus: string): RoleVariant {
  if (role === 'admin') return 'admin';
  if (subscriptionStatus === 'active' || subscriptionStatus === 'trialing') return 'active';
  if (subscriptionStatus === 'past_due' || subscriptionStatus === 'canceled' || subscriptionStatus === 'lapsed') return 'lapsed';
  return 'visitor';
}

export default function RoleBadge({ variant, showLabel = true, size = 'sm' }: RoleBadgeProps) {
  const config = VARIANTS[variant];
  const Icon = config.icon;

  const sizeClasses = size === 'md'
    ? 'px-3 py-1.5 text-xs gap-2'
    : 'px-2 py-1 text-[11px] gap-1.5';

  return (
    <span
      className={`inline-flex items-center rounded-lg border font-bold uppercase tracking-wider ${config.bgClass} ${config.borderClass} ${config.textClass} ${sizeClasses}`}
    >
      <Icon className={size === 'md' ? 'w-3.5 h-3.5' : 'w-3 h-3'} />
      {showLabel && <span>{config.label}</span>}
    </span>
  );
}
