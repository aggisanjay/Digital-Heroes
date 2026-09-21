'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  Trophy, 
  Heart, 
  Calendar, 
  ShieldCheck, 
  Clock, 
  CheckCircle2, 
  Upload, 
  AlertTriangle, 
  ArrowUpRight, 
  ArrowRight,
  ChevronRight, 
  Zap, 
  RefreshCw,
  Sliders,
  CreditCard,
  Target,
  Flame,
  Award,
  ExternalLink,
  Sparkles,
  HelpCircle,
  TrendingUp,
  X
} from 'lucide-react';
import confetti from 'canvas-confetti';
import TactileScorecard from '@/components/scoring/TactileScorecard';
import DrawCountdown from '@/components/shared/DrawCountdown';
import RoleBadge from '@/components/shared/RoleBadge';
import WinnerPrizeShowcase from '@/components/dashboard/WinnerPrizeShowcase';
import { store } from '@/lib/data/mock-db';
import { Profile, Winner, Charity, Subscription, Score, Draw } from '@/lib/types';
import { useRealtimeSync } from '@/lib/useRealtimeSync';

export default function UserDashboard() {
  const [currentUser, setCurrentUser] = useState<Profile | null>(null);
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [scores, setScores] = useState<Score[]>([]);
  const [draws, setDraws] = useState<Draw[]>([]);
  const [showManageSubModal, setShowManageSubModal] = useState(false);
  const [winnings, setWinnings] = useState<Winner[]>([]);
  const [charity, setCharity] = useState<Charity | null>(null);
  const [charityPct, setCharityPct] = useState<number>(15);
  const [charitySavedMessage, setCharitySavedMessage] = useState(false);
  const [paymentSuccessToast, setPaymentSuccessToast] = useState(false);
  const [activeTab, setActiveTab] = useState<'scores' | 'draws' | 'charity'>('scores');

  // Real-time synchronization hook: automatically updates dashboard when events fire
  const realtimeTick = useRealtimeSync([
    'score:updated', 
    'draw:published', 
    'draw:simulated',
    'subscription:changed', 
    'user:switched', 
    'winner:updated',
    'data:reset'
  ]);

  const loadUserData = async () => {
    let user = store.getCurrentUser();
    if (!user && typeof window !== 'undefined') {
      const storedEmail = localStorage.getItem('dh_user_email');
      if (storedEmail) {
        user = store.login(storedEmail);
      }
    }
    setCurrentUser(user);
    if (user) {
      setCharityPct(user.charity_contribution_pct || 15);

      // 1. Fetch REAL user winnings from Supabase
      try {
        const res = await fetch(`/api/winners?userId=${encodeURIComponent(user.id)}`);
        const data = await res.json();
        if (data.winners) {
          setWinnings(data.winners);
        } else {
          setWinnings(store.getUserWinnings(user.id));
        }
      } catch {
        setWinnings(store.getUserWinnings(user.id));
      }

      // 2. Fetch REAL user scores from Supabase
      try {
        const res = await fetch(`/api/scores?userId=${encodeURIComponent(user.id)}`);
        const data = await res.json();
        if (data.scores) {
          setScores(data.scores);
        } else {
          setScores(store.getUserScores(user.id));
        }
      } catch {
        setScores(store.getUserScores(user.id));
      }

      // 3. Fetch REAL draws ledger from Supabase
      try {
        const res = await fetch('/api/draws');
        const data = await res.json();
        if (data.draws) {
          setDraws(data.draws);
        } else {
          setDraws(store.getDraws());
        }
      } catch {
        setDraws(store.getDraws());
      }

      const sub = store.getUserSubscription(user.id);
      setSubscription(sub);

      if (user.charity_id) {
        const c = store.getCharities().find(item => item.id === user.charity_id);
        setCharity(c || null);
      }
    }
  };

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      if (params.get('payment') === 'success') {
        setPaymentSuccessToast(true);
        const u = store.getCurrentUser();
        if (u) {
          store.createOrUpdateSubscription(u.id, 'monthly', 'active');
          store.updateProfile(u.id, { subscription_status: 'active' });
        }
        confetti({
          particleCount: 80,
          spread: 80,
          origin: { y: 0.4 },
          colors: ['#00F29D', '#00D2FF', '#FF6E40'],
        });
        window.history.replaceState({}, '', window.location.pathname);
      }
    }
    loadUserData();
  }, [realtimeTick]);


  const handleUpdateCharityPct = () => {
    if (!currentUser) return;
    store.updateProfile(currentUser.id, { charity_contribution_pct: charityPct });
    setCharitySavedMessage(true);
    setTimeout(() => setCharitySavedMessage(false), 2500);
  };

  const rollingAvg = scores.length > 0 
    ? (scores.reduce((acc, s) => acc + s.score, 0) / scores.length).toFixed(1)
    : '0.0';

  const isEligibleForDraw = scores.length >= 5 && currentUser?.subscription_status === 'active';
  const isLapsed = currentUser?.subscription_status === 'past_due' || currentUser?.subscription_status === 'canceled' || currentUser?.subscription_status === 'lapsed';
  const isPendingSub = currentUser?.subscription_status === 'inactive';
  const totalWonLifetime = winnings.reduce((acc, w) => acc + Number(w.amount), 0);
  const pendingWinnings = winnings.filter(w => w.payout_status !== 'paid');
  const totalPendingWon = pendingWinnings.reduce((acc, w) => acc + Number(w.amount), 0);

  if (!currentUser) {
    return (
      <div className="min-h-screen bg-[#FAFAF8] flex flex-col items-center justify-center text-[#111827] px-4">
        <div className="bg-white rounded-3xl p-8 sm:p-12 border border-gray-200 shadow-xl text-center space-y-6 max-w-md w-full animate-in fade-in duration-300">
          <div className="w-16 h-16 rounded-full bg-[#11382B]/10 flex items-center justify-center text-[#11382B] mx-auto">
            <ShieldCheck className="w-8 h-8" />
          </div>
          <div>
            <h2 className="text-2xl font-black text-[#111827] tracking-tight">Member Sign In Required</h2>
            <p className="text-xs text-gray-600 mt-2 leading-relaxed">
              Please sign in to your Digital Heroes account or register to access your personal golf scorecard, draw tickets, and charity impact.
            </p>
          </div>
          <div className="flex flex-col gap-3 pt-2">
            <Link
              href="/login?redirect=/dashboard"
              className="w-full py-3.5 rounded-full bg-[#11382B] hover:bg-[#0c281e] text-white font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all shadow-sm"
            >
              <span>Sign In to Your Account</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href="/register"
              className="w-full py-3.5 rounded-full bg-white hover:bg-gray-50 text-gray-700 font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-colors border border-gray-300"
            >
              <span>Create New Account</span>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const roleVariant = currentUser.role === 'admin' 
    ? 'admin' 
    : currentUser.subscription_status === 'active' 
    ? 'active' 
    : 'lapsed';

  return (
    <div className="min-h-screen bg-[#FAFAF8] text-[#111827] pt-28 pb-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-8">

        {/* 1. Payment Confirmation Toast */}
        {paymentSuccessToast && (
          <div className="p-4 sm:p-5 rounded-2xl bg-[#00F29D]/15 border border-[#00F29D]/40 flex items-center justify-between gap-4 text-white shadow-xl shadow-[#00F29D]/10 animate-in fade-in duration-300">
            <div className="flex items-center gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-[#00F29D]/20 border border-[#00F29D]/50 flex items-center justify-center text-[#00F29D] shrink-0">
                <CheckCircle2 className="w-5 h-5" />
              </div>
              <div>
                <p className="text-sm font-extrabold text-white">Stripe Payment Confirmed & Membership Active!</p>
                <p className="text-xs text-[#94A3B8]">
                  Your subscription is linked to Stripe. Rolling 5-score golf handicap tracking and monthly jackpot draw entries are unlocked.
                </p>
              </div>
            </div>
            <button
              onClick={() => setPaymentSuccessToast(false)}
              className="text-xs text-[#94A3B8] hover:text-white px-2.5 py-1.5 rounded-lg bg-white/5 border border-white/10 shrink-0"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* 2a. Inactive Subscription Banner */}
        {isPendingSub && (
          <div className="p-6 rounded-3xl bg-gradient-to-r from-[#00D2FF]/15 via-[#00F29D]/10 to-[#00D2FF]/10 border border-[#00D2FF]/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-xl">
            <div className="flex items-start sm:items-center gap-4">
              <div className="w-11 h-11 rounded-2xl bg-[#00D2FF]/20 border border-[#00D2FF]/40 flex items-center justify-center text-[#00D2FF] shrink-0">
                <CreditCard className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-bold text-white text-base flex items-center gap-2">
                  <span>Complete Your Subscription</span>
                  <span className="px-2 py-0.5 rounded text-[10px] bg-[#00D2FF]/20 text-[#00D2FF] font-extrabold uppercase">
                    Inactive
                  </span>
                </h3>
                <p className="text-xs text-[#94A3B8] mt-1">
                  You are registered! Activate your subscription to unlock rolling 5-score golf tracking and monthly cash jackpot draws.
                </p>
              </div>
            </div>
            <Link
              href="/subscribe"
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#00F29D] to-[#00D2FF] text-[#06080F] font-black text-xs uppercase tracking-wider flex items-center gap-2 shadow-lg shadow-[#00F29D]/20 hover:opacity-90 shrink-0 transition-transform active:scale-95"
            >
              <span>Subscribe Now ($19/mo)</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        )}

        {/* 2b. Lapsed / Past Due Alert Banner */}
        {isLapsed && (
          <div className="p-6 rounded-3xl bg-gradient-to-r from-amber-500/15 via-rose-500/10 to-amber-500/10 border border-amber-500/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-xl">
            <div className="flex items-start sm:items-center gap-4">
              <div className="w-11 h-11 rounded-2xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 shrink-0">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-bold text-white text-base flex items-center gap-2">
                  <span>Subscription Renewal Required</span>
                  <span className="px-2 py-0.5 rounded text-[10px] bg-amber-500/20 text-amber-400 font-extrabold uppercase">
                    Past Due / Lapsed
                  </span>
                </h3>
                <p className="text-xs text-[#94A3B8] mt-1">
                  Your payment method requires update. Golf score logging and prize draw eligibility are currently paused.
                </p>
              </div>
            </div>
            <Link
              href="/subscribe"
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-[#FF6E40] text-black font-extrabold text-xs flex items-center gap-2 shadow-lg shadow-amber-500/20 hover:opacity-90 shrink-0 transition-transform active:scale-95"
            >
              <span>Reactivate Subscription ($19/mo)</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        )}


        {/* 2c. Winner Notification Banner - only when action or disbursement is pending */}
        {pendingWinnings.length > 0 && (
          <div className="p-5 rounded-3xl bg-gradient-to-r from-amber-500/20 via-[#00F29D]/15 to-amber-500/10 border border-amber-400/40 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-xl shadow-amber-500/10 animate-in fade-in duration-300">
            <div className="flex items-start sm:items-center gap-4">
              <div className="w-11 h-11 rounded-2xl bg-amber-400/20 border border-amber-400/40 flex items-center justify-center text-amber-400 shrink-0">
                <Trophy className="w-6 h-6 animate-pulse" />
              </div>
              <div>
                <h3 className="font-bold text-white text-base flex items-center gap-2">
                  <span>Action Required: Prize Win Detected!</span>
                  <span className="px-2 py-0.5 rounded text-[10px] bg-amber-400 text-black font-black uppercase">
                    ${totalPendingWon.toLocaleString()} Pending Claim
                  </span>
                </h3>
                <p className="text-xs text-[#94A3B8] mt-0.5">
                  {pendingWinnings.some(w => w.proof_status === 'submitted') 
                    ? 'Your scorecard proof is submitted and under admin audit.'
                    : pendingWinnings.some(w => w.proof_status === 'approved')
                    ? 'Proof approved! Payout direct electronic disbursement is in progress.'
                    : 'Action required: Upload your physical scorecard proof to claim your winnings.'}
                </p>
              </div>
            </div>
            <button
              onClick={() => setActiveTab('draws')}
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-400 to-[#00F29D] text-black font-extrabold text-xs flex items-center gap-2 shadow-lg shadow-amber-400/20 hover:opacity-90 shrink-0 transition-transform active:scale-95"
            >
              <span>View Prize & Scorecard Proof</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* 3. Member Hero Header */}
        <div className="relative rounded-3xl bg-[#0D1322]/90 border border-white/10 p-6 sm:p-8 backdrop-blur-xl shadow-2xl overflow-hidden">
          <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-bl from-[#00F29D]/10 via-[#00D2FF]/5 to-transparent blur-3xl pointer-events-none" />

          <div className="relative z-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                  {currentUser.full_name || 'Subscriber'}
                </h1>
                <RoleBadge variant={roleVariant} size="md" />
                {currentUser.role === 'admin' && (
                  <Link
                    href="/admin"
                    className="px-2.5 py-1 rounded-lg bg-[#FF6E40]/15 border border-[#FF6E40]/30 text-[#FF6E40] text-xs font-bold hover:bg-[#FF6E40]/25 transition-colors"
                  >
                    Open Admin Control
                  </Link>
                )}
              </div>
              <p className="text-xs text-[#94A3B8] flex items-center gap-2">
                <span>{currentUser.email}</span>
                <span>•</span>
                <span className="font-mono">UUID: {currentUser.id.substring(0, 8)}...</span>
                <span>•</span>
                <span className="text-[#00F29D] font-medium">Real-Time Sync Active</span>
              </p>
            </div>

            {/* Live Countdown & Quick CTA */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 w-full lg:w-auto">
              <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 flex items-center gap-3 w-full sm:w-auto">
                <Clock className="w-5 h-5 text-[#00F29D] shrink-0" />
                <div>
                  <p className="text-[10px] uppercase font-bold tracking-wider text-[#64748B]">
                    Next Draw Closes In
                  </p>
                  <DrawCountdown compact={true} />
                </div>
              </div>

              <button
                onClick={() => setShowManageSubModal(true)}
                className="px-4 py-3 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-bold text-white flex items-center gap-2 transition-colors w-full sm:w-auto justify-center"
              >
                <CreditCard className="w-4 h-4 text-[#00D2FF]" />
                <span>Manage Plan</span>
              </button>
            </div>
          </div>
        </div>

        {/* 4. Core KPI Metrics Matrix */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {/* Card 1: Stableford Rolling Average */}
          <div className="glass-panel-elevated rounded-2xl p-5 border border-white/10 space-y-3 relative overflow-hidden group">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-[#94A3B8] uppercase tracking-wider">
                Rolling 5 Handicap Avg
              </span>
              <Target className="w-4 h-4 text-[#00F29D]" />
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-black font-mono text-white tracking-tight">
                {rollingAvg}
              </span>
              <span className="text-xs font-semibold text-[#94A3B8]">pts / round</span>
            </div>
            <div className="space-y-1.5">
              <div className="flex justify-between text-[11px] text-[#94A3B8]">
                <span>Ledger Capacity:</span>
                <span className="font-mono font-bold text-white">{scores.length} / 5 rounds</span>
              </div>
              <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-[#00F29D] to-[#00D2FF] transition-all duration-500 rounded-full"
                  style={{ width: `${Math.min(100, (scores.length / 5) * 100)}%` }}
                />
              </div>
            </div>
          </div>

          {/* Card 2: Draw Eligibility Status */}
          <div className="glass-panel-elevated rounded-2xl p-5 border border-white/10 space-y-3 relative overflow-hidden group">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-[#94A3B8] uppercase tracking-wider">
                Monthly Draw Eligibility
              </span>
              <Trophy className="w-4 h-4 text-[#00D2FF]" />
            </div>
            <div className="flex items-center gap-2">
              {isEligibleForDraw ? (
                <>
                  <CheckCircle2 className="w-5 h-5 text-[#00F29D]" />
                  <span className="text-base font-extrabold text-[#00F29D]">100% Draw Ready</span>
                </>
              ) : (
                <>
                  <AlertTriangle className="w-5 h-5 text-amber-400" />
                  <span className="text-base font-extrabold text-amber-400">
                    {5 - scores.length > 0 ? `Need ${5 - scores.length} more rounds` : 'Payment Required'}
                  </span>
                </>
              )}
            </div>
            <p className="text-[11px] text-[#94A3B8] leading-relaxed">
              {isEligibleForDraw 
                ? 'Your 5 unique scores are locked for the end-of-month jackpot simulation.'
                : 'PRD Rule: 5 verified rolling Stableford rounds required to match target numbers.'}
            </p>
          </div>

          {/* Card 3: Est. Prize Pool Share */}
          <div className="glass-panel-elevated rounded-2xl p-5 border border-white/10 space-y-3 relative overflow-hidden group">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-[#94A3B8] uppercase tracking-wider">
                Est. Monthly Pool
              </span>
              <Flame className="w-4 h-4 text-[#FF6E40]" />
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-black font-mono text-white tracking-tight">
                $12,450
              </span>
              <span className="text-xs font-bold text-[#FF6E40]">+Rollover</span>
            </div>
            <div className="flex items-center justify-between text-[11px] text-[#94A3B8]">
              <span>Tier 5 (40% + Roll):</span>
              <span className="font-mono font-bold text-white">$8,180.00</span>
            </div>
          </div>

          {/* Card 4: Partner Charity Allocation */}
          <div className="glass-panel-elevated rounded-2xl p-5 border border-white/10 space-y-3 relative overflow-hidden group">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-[#94A3B8] uppercase tracking-wider">
                Designated Charity
              </span>
              <Heart className="w-4 h-4 text-[#FF6E40] fill-[#FF6E40]" />
            </div>
            <div className="truncate">
              <p className="font-bold text-white text-sm truncate">
                {charity?.name || 'Partner Foundation'}
              </p>
              <p className="text-xs text-[#00F29D] font-mono mt-0.5">
                {charityPct}% Pledge Passthrough
              </p>
            </div>
            <div className="flex justify-between items-center pt-1 border-t border-white/5 text-[11px] text-[#94A3B8]">
              <span>Total Raised to Date:</span>
              <span className="font-mono font-bold text-[#FF6E40]">
                ${Number(charity?.total_raised || 0).toLocaleString()}
              </span>
            </div>
          </div>
        </div>

        {/* 5. Interactive Tab Navigation */}
        <div className="flex border-b border-white/10 gap-2 sm:gap-6">
          <button
            onClick={() => setActiveTab('scores')}
            className={`pb-3.5 px-2 text-sm font-bold flex items-center gap-2 border-b-2 transition-all ${
              activeTab === 'scores'
                ? 'border-[#00F29D] text-[#00F29D]'
                : 'border-transparent text-[#94A3B8] hover:text-white'
            }`}
          >
            <Target className="w-4 h-4" />
            <span>Tactile Scoring Ledger</span>
            <span className="px-1.5 py-0.5 rounded-full text-[10px] bg-white/10 text-white font-mono">
              {scores.length}/5
            </span>
          </button>

          <button
            onClick={() => setActiveTab('draws')}
            className={`pb-3.5 px-2 text-sm font-bold flex items-center gap-2 border-b-2 transition-all ${
              activeTab === 'draws'
                ? 'border-[#00F29D] text-[#00F29D]'
                : 'border-transparent text-[#94A3B8] hover:text-white'
            }`}
          >
            <Trophy className="w-4 h-4" />
            <span>Jackpot Draw History & Wins</span>
            {winnings.length > 0 && (
              <span className="px-1.5 py-0.5 rounded-full text-[10px] bg-[#00F29D]/20 text-[#00F29D] font-mono">
                {winnings.length} won
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('charity')}
            className={`pb-3.5 px-2 text-sm font-bold flex items-center gap-2 border-b-2 transition-all ${
              activeTab === 'charity'
                ? 'border-[#00F29D] text-[#00F29D]'
                : 'border-transparent text-[#94A3B8] hover:text-white'
            }`}
          >
            <Heart className="w-4 h-4" />
            <span>Charity Pledge Manager</span>
          </button>
        </div>

        {/* 6. Tab Content Panels */}
        {activeTab === 'scores' && (
          <div className="space-y-6">
            <TactileScorecard 
              userId={currentUser.id} 
              onScoresChange={loadUserData} 
            />
          </div>
        )}

        {activeTab === 'draws' && (
          <div className="space-y-6">
            {/* Winner Prize Showcase & Proof Verification Station */}
            <WinnerPrizeShowcase 
              user={currentUser} 
              winnings={winnings} 
              draws={draws} 
              scores={scores}
              onRefresh={loadUserData} 
            />

            {/* Past Draws List */}
            <div className="glass-panel-elevated rounded-3xl p-6 border border-white/10 space-y-4">
              <h3 className="text-base font-bold text-white">Platform Monthly Draws Ledger</h3>
              <div className="divide-y divide-white/5">
                {draws.map(d => (
                  <div key={d.id} className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-white">Period: {d.period}</span>
                        <span className={`px-2 py-0.5 rounded text-[10px] font-extrabold uppercase ${
                          d.status === 'published' ? 'bg-[#00F29D]/15 text-[#00F29D]' : 'bg-white/10 text-[#94A3B8]'
                        }`}>
                          {d.status}
                        </span>
                        <span className="text-xs text-[#94A3B8]">({d.mode} engine)</span>
                      </div>
                      <div className="flex items-center gap-2 mt-2">
                        <span className="text-xs text-[#94A3B8]">Target Numbers:</span>
                        <div className="flex gap-1.5">
                          {d.target_numbers.map((num, i) => (
                            <span key={i} className="w-7 h-7 rounded-lg bg-white/10 border border-white/20 flex items-center justify-center font-mono font-bold text-xs text-[#00F29D]">
                              {num}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>

                    <div className="text-right sm:text-right">
                      <p className="text-xs text-[#94A3B8]">Total Pool</p>
                      <p className="text-lg font-black font-mono text-white">${Number(d.pool_total).toLocaleString()}</p>
                      <p className="text-[10px] text-[#FF6E40] mt-0.5">Tier 5 Rollover Out: ${Number(d.jackpot_rollover_out).toLocaleString()}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'charity' && (
          <div className="glass-panel-elevated rounded-3xl p-6 sm:p-8 border border-white/10 space-y-6 max-w-2xl">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-[#FF6E40]/20 flex items-center justify-center text-[#FF6E40]">
                <Heart className="w-6 h-6 fill-[#FF6E40]" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">Charity Passthrough Allocation</h3>
                <p className="text-xs text-[#94A3B8]">
                  Digital Heroes guarantees that 100% of your pledge goes straight to your designated cause.
                </p>
              </div>
            </div>

            {charity && (
              <div className="p-4 rounded-2xl bg-white/5 border border-white/10 flex items-center gap-4">
                <img src={charity.logo_url || ''} alt={charity.name} className="w-12 h-12 rounded-xl object-cover" />
                <div>
                  <h4 className="font-bold text-white text-sm">{charity.name}</h4>
                  <p className="text-xs text-[#FF6E40]">{charity.tagline}</p>
                </div>
              </div>
            )}

            <div className="space-y-3 pt-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-white uppercase tracking-wider">
                  Contribution Percentage
                </label>
                <span className="font-mono font-black text-2xl text-[#FF6E40]">{charityPct}%</span>
              </div>

              <input
                type="range"
                min="10"
                max="50"
                step="5"
                value={charityPct}
                onChange={e => setCharityPct(Number(e.target.value))}
                className="w-full h-2 bg-white/10 rounded-lg appearance-none cursor-pointer accent-[#FF6E40]"
              />

              <div className="flex justify-between text-[11px] font-mono text-[#64748B]">
                <span>10% (Platform Min)</span>
                <span>25%</span>
                <span>50% (Max Purpose)</span>
              </div>
            </div>

            <div className="flex items-center gap-4 pt-4 border-t border-white/10">
              <button
                onClick={handleUpdateCharityPct}
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#FF6E40] to-amber-500 text-black font-extrabold text-xs shadow-lg shadow-[#FF6E40]/20 hover:opacity-95 transition-opacity"
              >
                Save Charity Preference
              </button>
              {charitySavedMessage && (
                <span className="text-xs text-[#00F29D] flex items-center gap-1">
                  <CheckCircle2 className="w-4 h-4" /> Preference Saved!
                </span>
              )}
            </div>
          </div>
        )}

        {/* 7. Manage Subscription Modal */}
        {showManageSubModal && (
          <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="w-full max-w-md bg-[#0D1322] border border-white/15 rounded-3xl p-6 shadow-2xl space-y-5 animate-in fade-in zoom-in-95 duration-150">
              <div className="flex items-center justify-between pb-3 border-b border-white/10">
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <CreditCard className="w-4 h-4 text-[#00D2FF]" />
                  <span>Manage Digital Heroes Membership</span>
                </h3>
                <button
                  onClick={() => setShowManageSubModal(false)}
                  className="text-[#94A3B8] hover:text-white p-1"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-3 text-xs">
                <div className="flex justify-between py-1.5 border-b border-white/5">
                  <span className="text-[#94A3B8]">Current Status:</span>
                  <span className={`font-bold capitalize ${
                    currentUser.subscription_status === 'active' ? 'text-[#00F29D]' : 'text-amber-400'
                  }`}>
                    {currentUser.subscription_status}
                  </span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-white/5">
                  <span className="text-[#94A3B8]">Subscription Plan:</span>
                  <span className="font-bold text-white">
                    {subscription?.plan_type === 'yearly' ? 'Annual Champion ($190/yr)' : 'Monthly Flex ($19/mo)'}
                  </span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-white/5">
                  <span className="text-[#94A3B8]">Stripe Customer ID:</span>
                  <span className="font-mono text-[#94A3B8]">{subscription?.stripe_customer_id || (currentUser ? `cus_dh_${currentUser.id.slice(0, 8)}` : 'cus_live_vault')}</span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-white/5">
                  <span className="text-[#94A3B8]">Next Renewal Date:</span>
                  <span className="text-white font-mono">{subscription?.current_period_end?.substring(0, 10) || '2026-10-21'}</span>
                </div>
              </div>

              <div className="pt-3 space-y-2">
                <button
                  type="button"
                  onClick={() => {
                    window.open('https://billing.stripe.com', '_blank');
                  }}
                  className="w-full py-3 rounded-xl bg-white/10 hover:bg-white/15 text-xs font-bold text-white flex items-center justify-center gap-2 transition-colors"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>Open Stripe Customer Billing Portal</span>
                </button>

                <button
                  type="button"
                  onClick={() => setShowManageSubModal(false)}
                  className="w-full py-2.5 rounded-xl text-xs text-[#94A3B8] hover:text-white"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}



      </div>
    </div>
  );
}
