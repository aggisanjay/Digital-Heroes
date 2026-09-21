import React from 'react';
import Link from 'next/link';
import { Trophy, Heart, Shield, Cpu, RefreshCw, CheckCircle2, ArrowRight } from 'lucide-react';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';

export default function HowItWorksPage() {
  return (
    <main className="min-h-screen flex flex-col bg-[#06080F] text-[#F8FAFC]">
      <Navbar />

      <div className="pt-32 pb-24 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 w-full flex-1 space-y-16">
        <div className="text-center max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#00F29D]/10 border border-[#00F29D]/30 text-[#00F29D] text-xs font-bold uppercase tracking-wider mb-4">
            <Trophy className="w-3.5 h-3.5" /> Full Mathematical & Rules Transparency
          </div>
          <h1 className="text-4xl sm:text-5xl font-extrabold text-white tracking-tight">
            How Digital Heroes Works
          </h1>
          <p className="mt-4 text-base text-[#94A3B8]">
            An emotionally driven ecosystem connecting real golf rounds with audited monthly jackpots and direct charity funding.
          </p>
        </div>

        {/* 3 Step Visual Process */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="glass-panel-elevated rounded-3xl p-8 border border-white/10 space-y-4">
            <div className="w-10 h-10 rounded-xl bg-[#00F29D]/10 border border-[#00F29D]/30 flex items-center justify-center text-[#00F29D] font-mono font-bold">
              01
            </div>
            <h3 className="text-xl font-bold text-white">Log Rolling 5 Scores</h3>
            <p className="text-xs text-[#94A3B8] leading-relaxed">
              Every round you play, enter your Stableford score (1–45) and date. The platform maintains a strict rolling window of your 5 most recent scores. Your 6th score automatically evicts the oldest round.
            </p>
          </div>

          <div className="glass-panel-elevated rounded-3xl p-8 border border-white/10 space-y-4">
            <div className="w-10 h-10 rounded-xl bg-[#00D2FF]/10 border border-[#00D2FF]/30 flex items-center justify-center text-[#00D2FF] font-mono font-bold">
              02
            </div>
            <h3 className="text-xl font-bold text-white">Monthly Jackpot Draw</h3>
            <p className="text-xs text-[#94A3B8] leading-relaxed">
              On the final day of each month, 5 numbers are drawn. Match 5 (40% + rollover jackpot), Match 4 (35%), or Match 3 (25%). Multiple winners in any tier split the prize equally.
            </p>
          </div>

          <div className="glass-panel-elevated rounded-3xl p-8 border border-white/10 space-y-4">
            <div className="w-10 h-10 rounded-xl bg-[#FF6E40]/10 border border-[#FF6E40]/30 flex items-center justify-center text-[#FF6E40] font-mono font-bold">
              03
            </div>
            <h3 className="text-xl font-bold text-white">Direct Charity Impact</h3>
            <p className="text-xs text-[#94A3B8] leading-relaxed">
              A minimum of 10% of your membership fee goes directly to your selected partner charity. You can voluntarily raise this rate up to 50% at any time in your dashboard.
            </p>
          </div>
        </div>

        {/* Draw Math Deep Dive */}
        <div className="glass-panel-elevated rounded-3xl p-8 sm:p-12 border border-white/10 space-y-8">
          <div>
            <h2 className="text-2xl font-bold text-white">Prize Pool Allocation Formula</h2>
            <p className="text-xs text-[#94A3B8] mt-1">
              Guaranteed formulas audited for computational accuracy.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-4 rounded-2xl bg-white/5 border border-white/5">
              <span className="text-xs text-[#00F29D] font-bold uppercase block mb-1">Tier 1: 5-Match</span>
              <span className="text-2xl font-mono font-black text-white">40%</span>
              <p className="text-[11px] text-[#64748B] mt-1">
                Rolls over to next month if unclaimed. Accumulates into massive jackpots.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-white/5 border border-white/5">
              <span className="text-xs text-[#00D2FF] font-bold uppercase block mb-1">Tier 2: 4-Match</span>
              <span className="text-2xl font-mono font-black text-white">35%</span>
              <p className="text-[11px] text-[#64748B] mt-1">
                Distributed equally among all players who match any 4 numbers.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-white/5 border border-white/5">
              <span className="text-xs text-[#FF6E40] font-bold uppercase block mb-1">Tier 3: 3-Match</span>
              <span className="text-2xl font-mono font-black text-white">25%</span>
              <p className="text-[11px] text-[#64748B] mt-1">
                High-probability recreational payout tier divided among 3-match holders.
              </p>
            </div>
          </div>

          <div className="pt-6 border-t border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <p className="text-sm font-bold text-white">Ready to start tracking and competing?</p>
              <p className="text-xs text-[#94A3B8]">Join over 1,400 active subscribers today.</p>
            </div>
            <Link
              href="/subscribe"
              className="px-6 py-3 rounded-xl btn-primary text-xs font-bold flex items-center justify-center gap-2"
            >
              <span>Join Digital Heroes ($19/mo)</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </div>

      <Footer />
    </main>
  );
}
