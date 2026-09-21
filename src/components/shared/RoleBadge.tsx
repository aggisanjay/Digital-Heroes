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
    bgClass: 'bg-[#E25B37]/10',
    borderClass: 'border-[#E25B37]/30',
    textClass: 'text-[#E25B37]',
    dotClass: 'bg-[#E25B37]',
    icon: Shield,
  },
  active: {
    label: 'Subscriber',
    bgClass: 'bg-[#00D284]/15',
    borderClass: 'border-[#00D284]/40',
    textClass: 'text-[#11382B]',
    dotClass: 'bg-[#00D284]',
    icon: CheckCircle2,
  },
  lapsed: {
    label: 'Lapsed',
    bgClass: 'bg-amber-100',
    borderClass: 'border-amber-300',
    textClass: 'text-amber-800',
    dotClass: 'bg-amber-500',
    icon: AlertTriangle,
  },
  visitor: {
    label: 'Visitor',
    bgClass: 'bg-gray-100',
    borderClass: 'border-gray-200',
    textClass: 'text-gray-600',
    dotClass: 'bg-gray-400',
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
    ? 'px-3 py-1 text-xs gap-1.5'
    : 'px-2.5 py-0.5 text-[11px] gap-1';

  return (
    <span
      className={`inline-flex items-center rounded-full border font-bold uppercase tracking-wider ${config.bgClass} ${config.borderClass} ${config.textClass} ${sizeClasses}`}
    >
      <Icon className={size === 'md' ? 'w-3.5 h-3.5' : 'w-3 h-3'} />
      {showLabel && <span>{config.label}</span>}
    </span>
  );
}
