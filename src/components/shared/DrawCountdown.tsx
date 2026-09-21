'use client';

import React, { useState, useEffect } from 'react';

interface DrawCountdownProps {
  /** Optional: override target date. Defaults to end of current month. */
  targetDate?: Date;
  /** Compact mode: single-line layout */
  compact?: boolean;
  /** Show label text */
  showLabel?: boolean;
  /** Custom classes for countdown text */
  className?: string;
}

function getEndOfMonth(): Date {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth() + 1, 0, 20, 0, 0); // Last day of month, 8PM
}

function calculateTimeLeft(target: Date): { days: number; hours: number; minutes: number; seconds: number } {
  const now = new Date();
  const diff = Math.max(0, target.getTime() - now.getTime());

  return {
    days: Math.floor(diff / (1000 * 60 * 60 * 24)),
    hours: Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
    minutes: Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60)),
    seconds: Math.floor((diff % (1000 * 60)) / 1000),
  };
}

function pad(n: number): string {
  return n.toString().padStart(2, '0');
}

export default function DrawCountdown({ targetDate, compact = false, showLabel = true, className }: DrawCountdownProps) {
  const [target] = useState(() => targetDate || getEndOfMonth());
  const [timeLeft, setTimeLeft] = useState(() => calculateTimeLeft(target));

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft(target));
    }, 1000);
    return () => clearInterval(timer);
  }, [target]);

  const isExpired = timeLeft.days === 0 && timeLeft.hours === 0 && timeLeft.minutes === 0 && timeLeft.seconds === 0;

  if (isExpired) {
    return (
      <div className="flex items-center gap-2">
        <span className="w-2 h-2 rounded-full bg-[#FF6E40] animate-pulse" />
        <span className="text-sm font-bold text-[#FF6E40]">Draw Processing...</span>
      </div>
    );
  }

  if (compact) {
    return (
      <span className={`font-mono font-bold tabular-nums ${className || 'text-[#111827]'}`}>
        {timeLeft.days}d : {pad(timeLeft.hours)}h : {pad(timeLeft.minutes)}m : {pad(timeLeft.seconds)}s
      </span>
    );
  }

  return (
    <div>
      {showLabel && (
        <div className="flex items-center gap-2 mb-2">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#00F29D] opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-[#00F29D]" />
          </span>
          <span className="text-[10px] font-semibold uppercase tracking-wider text-[#00F29D]">Draw Locks In</span>
        </div>
      )}
      <div className="flex items-center gap-1.5">
        {/* Days */}
        <div className="flex flex-col items-center">
          <div className="px-2.5 py-1.5 rounded-lg bg-white/5 border border-white/10 min-w-[2.5rem] text-center">
            <span className="text-xl font-black font-mono text-white tabular-nums countdown-digit">{pad(timeLeft.days)}</span>
          </div>
          <span className="text-[9px] text-[#64748B] mt-1 uppercase tracking-wider">Days</span>
        </div>
        <span className="text-lg font-bold text-[#64748B] -mt-4">:</span>
        {/* Hours */}
        <div className="flex flex-col items-center">
          <div className="px-2.5 py-1.5 rounded-lg bg-white/5 border border-white/10 min-w-[2.5rem] text-center">
            <span className="text-xl font-black font-mono text-white tabular-nums countdown-digit">{pad(timeLeft.hours)}</span>
          </div>
          <span className="text-[9px] text-[#64748B] mt-1 uppercase tracking-wider">Hrs</span>
        </div>
        <span className="text-lg font-bold text-[#64748B] -mt-4">:</span>
        {/* Minutes */}
        <div className="flex flex-col items-center">
          <div className="px-2.5 py-1.5 rounded-lg bg-white/5 border border-white/10 min-w-[2.5rem] text-center">
            <span className="text-xl font-black font-mono text-white tabular-nums countdown-digit">{pad(timeLeft.minutes)}</span>
          </div>
          <span className="text-[9px] text-[#64748B] mt-1 uppercase tracking-wider">Min</span>
        </div>
        <span className="text-lg font-bold text-[#64748B] -mt-4">:</span>
        {/* Seconds */}
        <div className="flex flex-col items-center">
          <div className="px-2.5 py-1.5 rounded-lg bg-[#00F29D]/5 border border-[#00F29D]/20 min-w-[2.5rem] text-center">
            <span className="text-xl font-black font-mono text-[#00F29D] tabular-nums countdown-digit">{pad(timeLeft.seconds)}</span>
          </div>
          <span className="text-[9px] text-[#00F29D] mt-1 uppercase tracking-wider">Sec</span>
        </div>
      </div>
    </div>
  );
}
