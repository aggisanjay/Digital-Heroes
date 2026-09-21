'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  Trophy, 
  Heart, 
  Target, 
  ShieldCheck, 
  Clock, 
  AlertTriangle, 
  ArrowRight, 
  ChevronRight, 
  CreditCard, 
  Flame, 
  Award, 
  CheckCircle2, 
  Sparkles,
  RefreshCw
} from 'lucide-react';
import DrawCountdown from '@/components/shared/DrawCountdown';
import RoleBadge from '@/components/shared/RoleBadge';
import { Profile, Score, Draw, Winner, Charity } from '@/lib/types';

export default function DashboardOverviewPage() {
  const [user, setUser] = useState<Profile | null>(null);
  const [scores, setScores] = useState<Score[]>([]);
  const [draws, setDraws] = useState<Draw[]>([]);
  const [winnings, setWinnings] = useState<Winner[]>([]);
  const [charity, setCharity] = useState<Charity | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        // 1. Fetch current authenticated user
        const authRes = await fetch('/api/auth/me');
        if (!authRes.ok) {
          window.location.href = '/login?redirect=/dashboard';
          return;
        }
        const authData = await authRes.json();
        const currentUser: Profile = authData.user;
        setUser(currentUser);

        if (currentUser) {
          // 2. Fetch real user scores
          const scoresRes = await fetch(`/api/scores?userId=${encodeURIComponent(currentUser.id)}`);
          const scoresData = await scoresRes.json();
          if (scoresData.scores) setScores(scoresData.scores);

          // 3. Fetch real user winnings
          const winRes = await fetch(`/api/winners?userId=${encodeURIComponent(currentUser.id)}`);
          const winData = await winRes.json();
          if (winData.winners) setWinnings(winData.winners);

          // 4. Fetch real draws
          const drawRes = await fetch('/api/draws');
          const drawData = await drawRes.json();
          if (drawData.draws) setDraws(drawData.draws);

          // 5. Fetch charity
          if (currentUser.charity_id) {
            const charRes = await fetch('/api/charities');
            const charData = await charRes.json();
            const found = charData.charities?.find((c: Charity) => c.id === currentUser.charity_id);
            if (found) setCharity(found);
          }
        }
      } catch (err) {
        console.warn('Dashboard load error:', err);
      } finally {
        setIsLoading(false);
      }
    }

    loadData();
  }, []);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] text-white">
        <RefreshCw className="w-8 h-8 text-[#00F29D] animate-spin mb-3" />
        <p className="text-xs text-[#94A3B8]">Loading member workspace...</p>
      </div>
    );
  }

  if (!user) return null;

  const rollingAvg = scores.length > 0 
    ? (scores.reduce((acc, s) => acc + s.score, 0) / scores.length).toFixed(1)
    : '0.0';

  const isEligibleForDraw = scores.length >= 5 && user.subscription_status === 'active';
  const isPastDue = user.subscription_status === 'past_due';
  const pendingWinnings = winnings.filter(w => w.payout_status !== 'paid');
  const paidWinnings = winnings.filter(w => w.payout_status === 'paid');
  const totalWonLifetime = winnings.reduce((acc, w) => acc + Number(w.amount), 0);

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-200">
      {/* 1. CRITICAL ALERT: Payment Past Due Notice with Immediate Retry */}
      {isPastDue && (
        <div className="p-5 rounded-3xl bg-rose-50 border border-rose-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-sm">
          <div className="flex items-start sm:items-center gap-4">
            <div className="w-11 h-11 rounded-2xl bg-rose-100 border border-rose-200 flex items-center justify-center text-rose-600 shrink-0">
              <AlertTriangle className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <h3 className="font-bold text-[#111827] text-base flex items-center gap-2">
                <span>Payment Failed — Membership Past Due</span>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] bg-rose-600 text-white font-bold uppercase tracking-wider">
                  Action Required
                </span>
              </h3>
              <p className="text-xs text-rose-800 mt-0.5">
                Your last invoice renewal could not be processed. Update your card to remain in the monthly jackpot pool.
              </p>
            </div>
          </div>
          <Link
            href="/dashboard/billing"
            className="px-5 py-2.5 rounded-full bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs flex items-center gap-2 shadow-sm shrink-0 transition-transform active:scale-95"
          >
            <span>Retry Payment Now</span>
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>
      )}

      {/* 2. Prize Win Detected Banner (Only when pending verification/disbursement) */}
      {pendingWinnings.length > 0 && (
        <div className="p-5 rounded-3xl bg-amber-50 border border-amber-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-sm">
          <div className="flex items-start sm:items-center gap-4">
            <div className="w-11 h-11 rounded-2xl bg-amber-100 border border-amber-200 flex items-center justify-center text-amber-600 shrink-0">
              <Trophy className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <h3 className="font-bold text-[#111827] text-base flex items-center gap-2">
                <span>Prize Win Detected!</span>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] bg-amber-500 text-white font-bold uppercase tracking-wider">
                  ${pendingWinnings.reduce((acc, w) => acc + Number(w.amount), 0).toLocaleString()} Pending Claim
                </span>
              </h3>
              <p className="text-xs text-gray-600 mt-0.5">
                {pendingWinnings.some(w => w.proof_status === 'submitted') 
                  ? 'Your scorecard proof is submitted and under compliance audit.'
                  : pendingWinnings.some(w => w.proof_status === 'approved')
                  ? 'Proof approved! Payout electronic disbursement is in progress.'
                  : 'Action required: Upload your tournament scorecard proof to sanction your payout.'}
              </p>
            </div>
          </div>
          <Link
            href="/dashboard/draws"
            className="px-5 py-2.5 rounded-full bg-[#11382B] hover:bg-[#0c281f] text-white font-bold text-xs flex items-center gap-2 shadow-sm shrink-0 transition-transform active:scale-95"
          >
            <span>Complete Prize Claim</span>
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>
      )}

      {/* 3. Member Hero Header */}
      <div className="relative rounded-3xl bg-white border border-gray-200/80 p-6 sm:p-8 shadow-sm overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-gradient-to-bl from-[#00D284]/10 via-[#00D284]/5 to-transparent blur-2xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-3 mb-2 flex-wrap">
              <span className="text-xs font-bold uppercase tracking-wider text-[#00D284]">
                Member Workspace
              </span>
              <RoleBadge variant={user.role === 'admin' ? 'admin' : user.subscription_status === 'active' ? 'active' : 'lapsed'} />
              {paidWinnings.length > 0 && (
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-[#00D284]/15 text-[#11382B] border border-[#00D284]/30">
                  ${totalWonLifetime.toLocaleString()} Disbursed
                </span>
              )}
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-[#111827] tracking-tight">
              Welcome back, {user.full_name || user.email.split('@')[0]}
            </h1>
            <p className="text-xs text-gray-500 mt-1">
              {user.email}
            </p>
          </div>

          {/* Live Countdown & Quick CTA */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 w-full lg:w-auto">
            <div className="p-3 px-4 rounded-2xl bg-gray-50 border border-gray-200/80 flex items-center gap-3 w-full sm:w-auto">
              <Clock className="w-5 h-5 text-[#00D284] shrink-0" />
              <div>
                <p className="text-[10px] uppercase font-bold tracking-wider text-gray-500">
                  Next Draw Closes In
                </p>
                <DrawCountdown compact={true} className="text-sm font-bold text-[#111827]" />
              </div>
            </div>

            <Link
              href="/dashboard/billing"
              className="px-5 py-3 rounded-full bg-gray-50 hover:bg-gray-100 border border-gray-200 text-xs font-semibold text-[#111827] flex items-center gap-2 transition-colors w-full sm:w-auto justify-center"
            >
              <CreditCard className="w-4 h-4 text-gray-600" />
              <span>Manage Plan</span>
            </Link>
          </div>
        </div>
      </div>

      {/* 4. Core KPI Metrics Matrix */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Card 1: Stableford Rolling Average */}
        <div className="bg-white rounded-2xl p-5 border border-gray-200/80 shadow-sm space-y-3 relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">
              Rolling 5 Handicap Avg
            </span>
            <div className="w-7 h-7 rounded-full bg-[#00D284]/15 flex items-center justify-center text-[#11382B]">
              <Target className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-black font-mono text-[#111827] tracking-tight">
              {rollingAvg}
            </span>
            <span className="text-xs font-semibold text-gray-500">pts / round</span>
          </div>
          <div className="space-y-1.5">
            <div className="flex justify-between text-[11px] text-gray-600">
              <span>Capacity:</span>
              <span className="font-mono font-bold text-[#111827]">{scores.length} / 5 rounds</span>
            </div>
            <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-[#11382B] to-[#00D284] transition-all duration-500 rounded-full"
                style={{ width: `${Math.min(100, (scores.length / 5) * 100)}%` }}
              />
            </div>
          </div>
        </div>

        {/* Card 2: Draw Eligibility Status */}
        <div className="bg-white rounded-2xl p-5 border border-gray-200/80 shadow-sm space-y-3 relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">
              Monthly Draw Eligibility
            </span>
            <div className="w-7 h-7 rounded-full bg-blue-50 flex items-center justify-center text-blue-600">
              <Trophy className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="flex items-center gap-2">
            {isEligibleForDraw ? (
              <>
                <CheckCircle2 className="w-5 h-5 text-[#00D284]" />
                <span className="text-base font-extrabold text-[#11382B]">100% Draw Ready</span>
              </>
            ) : (
              <>
                <AlertTriangle className="w-5 h-5 text-amber-500" />
                <span className="text-base font-extrabold text-amber-600">
                  {5 - scores.length > 0 ? `Need ${5 - scores.length} more rounds` : 'Subscription Required'}
                </span>
              </>
            )}
          </div>
          <p className="text-[11px] text-gray-600 leading-relaxed">
            {isEligibleForDraw 
              ? 'Your 5 unique scores are locked for the monthly jackpot draw.'
              : 'Log 5 tournament Stableford rounds to auto-enter monthly draw.'}
          </p>
        </div>

        {/* Card 3: Est. Prize Pool Share */}
        <div className="bg-white rounded-2xl p-5 border border-gray-200/80 shadow-sm space-y-3 relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">
              Est. Monthly Pool
            </span>
            <div className="w-7 h-7 rounded-full bg-orange-50 flex items-center justify-center text-orange-600">
              <Flame className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-black font-mono text-[#111827] tracking-tight">
              ${(draws[0]?.pool_total || 12450).toLocaleString()}
            </span>
            <span className="text-xs font-bold text-[#E25B37]">+Rollover</span>
          </div>
          <div className="flex items-center justify-between text-[11px] text-gray-600">
            <span>Tier 5 (40% + Roll):</span>
            <span className="font-mono font-bold text-[#111827]">
              ${(((draws[0]?.pool_total || 12450) * 0.4) + (draws[0]?.jackpot_rollover_out || 3200)).toLocaleString()}
            </span>
          </div>
        </div>

        {/* Card 4: Partner Charity Allocation */}
        <div className="bg-white rounded-2xl p-5 border border-gray-200/80 shadow-sm space-y-3 relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">
              Designated Charity
            </span>
            <div className="w-7 h-7 rounded-full bg-rose-50 flex items-center justify-center text-[#E25B37]">
              <Heart className="w-3.5 h-3.5 fill-[#E25B37]" />
            </div>
          </div>
          <div className="truncate">
            <p className="font-bold text-[#111827] text-sm truncate">
              {charity?.name || 'Fairway Foundation'}
            </p>
            <p className="text-xs text-[#00D284] font-semibold mt-0.5">
              {user.charity_contribution_pct || 10}% Pledge Passthrough
            </p>
          </div>
          <div className="flex justify-between items-center pt-1 border-t border-gray-100 text-[11px] text-gray-600">
            <span>Total Raised:</span>
            <span className="font-mono font-bold text-[#E25B37]">
              ${Number(charity?.total_raised || 148500).toLocaleString()}
            </span>
          </div>
        </div>
      </div>

      {/* 5. Deep-Link Feature Sections Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
        {/* Section 1: Tactile Scores */}
        <div className="p-6 rounded-3xl bg-white border border-gray-200/80 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-[#00D284]/15 text-[#11382B] flex items-center justify-center">
                <Target className="w-5 h-5 text-[#00D284]" />
              </div>
              <div>
                <h3 className="text-base font-bold text-[#111827]">Golf Scorecard & Rounds</h3>
                <p className="text-xs text-gray-500">{scores.length} rounds logged</p>
              </div>
            </div>
            <Link
              href="/dashboard/scores"
              className="text-xs text-[#11382B] font-bold hover:underline flex items-center gap-1"
            >
              <span>Manage Scores</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="flex items-center gap-2">
            {scores.slice(0, 5).map((s, idx) => (
              <div
                key={s.id || idx}
                className="flex-1 p-3 rounded-2xl bg-gray-50 border border-gray-200 text-center space-y-0.5"
              >
                <span className="font-mono font-black text-lg text-[#113827] block">{s.score}</span>
                <span className="text-[9px] text-gray-500 block">{s.date.substring(5)}</span>
              </div>
            ))}
            {Array.from({ length: Math.max(0, 5 - scores.length) }).map((_, i) => (
              <div
                key={`empty-${i}`}
                className="flex-1 p-3 rounded-2xl bg-gray-50/50 border border-dashed border-gray-300 text-center"
              >
                <span className="text-xs text-gray-400 block">-</span>
                <span className="text-[9px] text-gray-400 block">Empty</span>
              </div>
            ))}
          </div>
        </div>

        {/* Section 2: Draws & Winnings */}
        <div className="p-6 rounded-3xl bg-white border border-gray-200/80 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center">
                <Trophy className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-[#111827]">Jackpot Draws & Wins</h3>
                <p className="text-xs text-gray-500">{winnings.length} prizes won</p>
              </div>
            </div>
            <Link
              href="/dashboard/draws"
              className="text-xs text-blue-600 font-bold hover:underline flex items-center gap-1"
            >
              <span>View Prize Ledger</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="p-4 rounded-2xl bg-gray-50 border border-gray-200 flex items-center justify-between">
            <div>
              <span className="text-xs font-bold text-[#111827] block">Current Period: {draws[0]?.period || '2026-09'}</span>
              <span className="text-[11px] text-gray-500">
                {scores.length >= 5 ? '5 rolling scores locked for draw' : 'Need 5 scores to enter pool'}
              </span>
            </div>
            <span className="px-3 py-1 rounded-full bg-[#00D284]/15 text-[#11382B] border border-[#00D284]/30 font-mono font-bold text-xs">
              ${(draws[0]?.pool_total || 12450).toLocaleString()} Pool
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
