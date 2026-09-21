import React from 'react';
import Link from 'next/link';
import { Trophy, ArrowRight } from 'lucide-react';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';

export default function HowItWorksPage() {
  return (
    <main className="min-h-screen flex flex-col bg-[#FAFAF8] text-[#111827]">
      <Navbar />

      <div className="pt-32 pb-24 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 w-full flex-1 space-y-16">
        <div className="text-center max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-50 border border-emerald-200 text-[#11382B] text-xs font-bold uppercase tracking-wider mb-4">
            <Trophy className="w-3.5 h-3.5 text-emerald-600" /> Full Mathematical & Rules Transparency
          </div>
          <h1 className="text-4xl sm:text-5xl font-extrabold text-[#111827] tracking-tight">
            How Digital Heroes Works
          </h1>
          <p className="mt-4 text-base text-gray-600">
            An emotionally driven ecosystem connecting real golf rounds with audited monthly jackpots and direct charity funding.
          </p>
        </div>

        {/* 3 Step Visual Process */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-white rounded-3xl p-8 border border-gray-200/80 shadow-sm space-y-4 hover:shadow-md transition-shadow">
            <div className="w-10 h-10 rounded-2xl bg-[#11382B]/10 text-[#11382B] flex items-center justify-center font-mono font-bold text-sm">
              01
            </div>
            <h3 className="text-xl font-bold text-[#111827]">Log Rolling 5 Scores</h3>
            <p className="text-xs text-gray-600 leading-relaxed">
              Every round you play, enter your Stableford score (1–45) and date. The platform maintains a strict rolling window of your 5 most recent scores. Your 6th score automatically evicts the oldest round.
            </p>
          </div>

          <div className="bg-white rounded-3xl p-8 border border-gray-200/80 shadow-sm space-y-4 hover:shadow-md transition-shadow">
            <div className="w-10 h-10 rounded-2xl bg-[#00D284]/20 text-[#11382B] flex items-center justify-center font-mono font-bold text-sm">
              02
            </div>
            <h3 className="text-xl font-bold text-[#111827]">Monthly Jackpot Draw</h3>
            <p className="text-xs text-gray-600 leading-relaxed">
              On the final day of each month, 5 numbers are drawn. Match 5 (40% + rollover jackpot), Match 4 (35%), or Match 3 (25%). Multiple winners in any tier split the prize equally.
            </p>
          </div>

          <div className="bg-white rounded-3xl p-8 border border-gray-200/80 shadow-sm space-y-4 hover:shadow-md transition-shadow">
            <div className="w-10 h-10 rounded-2xl bg-[#E25B37]/10 text-[#E25B37] flex items-center justify-center font-mono font-bold text-sm">
              03
            </div>
            <h3 className="text-xl font-bold text-[#111827]">Direct Charity Impact</h3>
            <p className="text-xs text-gray-600 leading-relaxed">
              A minimum of 10% of your membership fee goes directly to your selected partner charity. You can voluntarily raise this rate up to 50% at any time in your dashboard.
            </p>
          </div>
        </div>

        {/* Draw Math Deep Dive */}
        <div className="bg-white rounded-3xl p-8 sm:p-12 border border-gray-200/80 shadow-sm space-y-8">
          <div>
            <h2 className="text-2xl font-bold text-[#111827]">Prize Pool Allocation Formula</h2>
            <p className="text-xs text-gray-500 mt-1">
              Guaranteed formulas audited for computational accuracy.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-5 rounded-2xl bg-gray-50 border border-gray-100">
              <span className="text-xs text-[#11382B] font-bold uppercase block mb-1">Tier 1: 5-Match</span>
              <span className="text-3xl font-mono font-black text-[#11382B]">40%</span>
              <p className="text-xs text-gray-500 mt-2">
                Rolls over to next month if unclaimed. Accumulates into massive jackpots.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-gray-50 border border-gray-100">
              <span className="text-xs text-emerald-700 font-bold uppercase block mb-1">Tier 2: 4-Match</span>
              <span className="text-3xl font-mono font-black text-[#11382B]">35%</span>
              <p className="text-xs text-gray-500 mt-2">
                Distributed equally among all players who match any 4 numbers.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-gray-50 border border-gray-100">
              <span className="text-xs text-[#E25B37] font-bold uppercase block mb-1">Tier 3: 3-Match</span>
              <span className="text-3xl font-mono font-black text-[#E25B37]">25%</span>
              <p className="text-xs text-gray-500 mt-2">
                High-probability recreational payout tier divided among 3-match holders.
              </p>
            </div>
          </div>

          <div className="pt-6 border-t border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <p className="text-sm font-bold text-[#111827]">Ready to start tracking and competing?</p>
              <p className="text-xs text-gray-500">Join over 1,400 active subscribers today.</p>
            </div>
            <Link
              href="/subscribe"
              className="px-6 py-3.5 rounded-full bg-[#11382B] hover:bg-[#0c281e] text-white text-xs font-bold flex items-center justify-center gap-2 shadow-md transition-all active:scale-[0.99]"
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
