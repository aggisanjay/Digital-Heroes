'use client';

import React from 'react';
import { Trophy, Shield, Cpu, RefreshCw, Users, Sparkles, CheckCircle2 } from 'lucide-react';

export default function DrawMechanicsSection() {
  return (
    <section className="py-24 relative overflow-hidden bg-[#06080F]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#00F29D]/10 border border-[#00F29D]/20 text-[#00F29D] text-xs font-bold uppercase tracking-wider mb-4">
            <Trophy className="w-3.5 h-3.5" /> Algorithmic Engine & Prize Math
          </div>
          <h2 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight">
            How The <span className="gradient-text-mint">Monthly Draw Works</span>
          </h2>
          <p className="mt-4 text-base text-[#94A3B8]">
            Transparent, audited, and strictly rules-governed. Powered by rolling Stableford scores and scalable monthly pools.
          </p>
        </div>

        {/* 3 Prize Tiers Breakdown */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          {/* Tier 1: 5-Match Jackpot */}
          <div className="glass-panel-elevated rounded-3xl p-8 relative overflow-hidden border border-[#00F29D]/30 group hover:border-[#00F29D] transition-all">
            <div className="absolute top-0 right-0 w-32 h-32 bg-[#00F29D]/10 rounded-full blur-2xl -mr-8 -mt-8" />
            <div className="flex items-center justify-between mb-6">
              <span className="px-3 py-1 rounded-full bg-[#00F29D]/20 text-[#00F29D] text-xs font-extrabold tracking-wider uppercase">
                Tier 1 Jackpot
              </span>
              <span className="text-2xl font-black text-[#00F29D] font-mono">40%</span>
            </div>
            <h3 className="text-2xl font-bold text-white mb-2">5-Number Match</h3>
            <p className="text-sm text-[#94A3B8] mb-6">
              Matches all 5 target numbers. If no subscriber hits all 5, the entire pool rolls over into next month&apos;s jackpot!
            </p>
            <div className="p-4 rounded-xl bg-white/5 border border-white/10 space-y-2 text-xs">
              <div className="flex justify-between text-[#94A3B8]">
                <span>Rollover Mechanism:</span>
                <span className="text-[#00F29D] font-bold">Unclaimed Accumulates</span>
              </div>
              <div className="flex justify-between text-[#94A3B8]">
                <span>Split Rule:</span>
                <span className="text-white font-medium">Equal Split Among Winners</span>
              </div>
            </div>
          </div>

          {/* Tier 2: 4-Match */}
          <div className="glass-panel-elevated rounded-3xl p-8 relative overflow-hidden border border-white/10 hover:border-[#00D2FF]/40 transition-all">
            <div className="flex items-center justify-between mb-6">
              <span className="px-3 py-1 rounded-full bg-[#00D2FF]/20 text-[#00D2FF] text-xs font-extrabold tracking-wider uppercase">
                Tier 2 Payout
              </span>
              <span className="text-2xl font-black text-[#00D2FF] font-mono">35%</span>
            </div>
            <h3 className="text-2xl font-bold text-white mb-2">4-Number Match</h3>
            <p className="text-sm text-[#94A3B8] mb-6">
              Matches any 4 of the 5 target numbers. Always awarded every cycle without rollover delay.
            </p>
            <div className="p-4 rounded-xl bg-white/5 border border-white/10 space-y-2 text-xs">
              <div className="flex justify-between text-[#94A3B8]">
                <span>Cycle Allocation:</span>
                <span className="text-[#00D2FF] font-bold">35% of Total Pool</span>
              </div>
              <div className="flex justify-between text-[#94A3B8]">
                <span>Split Rule:</span>
                <span className="text-white font-medium">Equal Split Among Winners</span>
              </div>
            </div>
          </div>

          {/* Tier 3: 3-Match */}
          <div className="glass-panel-elevated rounded-3xl p-8 relative overflow-hidden border border-white/10 hover:border-[#FF6E40]/40 transition-all">
            <div className="flex items-center justify-between mb-6">
              <span className="px-3 py-1 rounded-full bg-[#FF6E40]/20 text-[#FF6E40] text-xs font-extrabold tracking-wider uppercase">
                Tier 3 Payout
              </span>
              <span className="text-2xl font-black text-[#FF6E40] font-mono">25%</span>
            </div>
            <h3 className="text-2xl font-bold text-white mb-2">3-Number Match</h3>
            <p className="text-sm text-[#94A3B8] mb-6">
              Matches any 3 of the 5 target numbers. High win probability designed to reward consistent recreational players.
            </p>
            <div className="p-4 rounded-xl bg-white/5 border border-white/10 space-y-2 text-xs">
              <div className="flex justify-between text-[#94A3B8]">
                <span>Cycle Allocation:</span>
                <span className="text-[#FF6E40] font-bold">25% of Total Pool</span>
              </div>
              <div className="flex justify-between text-[#94A3B8]">
                <span>Split Rule:</span>
                <span className="text-white font-medium">Equal Split Among Winners</span>
              </div>
            </div>
          </div>
        </div>

        {/* 2 Modes Comparison: Random vs Algorithmic */}
        <div className="glass-panel rounded-3xl p-8 sm:p-12 border border-white/10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-[#00F29D]/10 border border-[#00F29D]/30 flex items-center justify-center text-[#00F29D]">
                  <Cpu className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-xl font-bold text-white">Algorithmic Weighted Mode</h4>
                  <span className="text-xs text-[#00F29D] font-semibold">Rewards Dedication & Consistency</span>
                </div>
              </div>
              <p className="text-sm text-[#94A3B8] leading-relaxed mb-6">
                In algorithmic cycles, subscriber entry weighting is dynamically calculated from your golf activity. Logging all 5 rolling scores maximizes your weight to up to 2.5×, rewarding active participation without eliminating recreational chances.
              </p>
              <ul className="space-y-2.5 text-xs text-slate-300">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#00F29D]" />
                  <span>Full 5-score set unlocks +1.0 entry multiplier</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#00F29D]" />
                  <span>Stableford standard deviation consistency bonus (+0.1 to +0.5)</span>
                </li>
              </ul>
            </div>

            <div className="border-t lg:border-t-0 lg:border-l border-white/10 pt-8 lg:pt-0 lg:pl-10">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-[#00D2FF]/10 border border-[#00D2FF]/30 flex items-center justify-center text-[#00D2FF]">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-xl font-bold text-white">Random Lottery Mode</h4>
                  <span className="text-xs text-[#00D2FF] font-semibold">Equal Probability For All</span>
                </div>
              </div>
              <p className="text-sm text-[#94A3B8] leading-relaxed mb-6">
                In random lottery cycles, every active subscriber enters with an identical 1.0 weight. The draw draws 5 numbers between 1 and 45 matching against each member&apos;s 5 rolling scores.
              </p>
              <ul className="space-y-2.5 text-xs text-slate-300">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#00D2FF]" />
                  <span>100% equal odds across all active subscription tiers</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#00D2FF]" />
                  <span>Deterministic winner verification & proof upload protection</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
