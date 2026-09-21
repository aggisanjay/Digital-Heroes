'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Check, Sparkles, Heart, Shield, ArrowRight } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function PricingSection() {
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('yearly');
  const [charityPct, setCharityPct] = useState<number>(15);
  const router = useRouter();

  return (
    <section className="py-24 relative overflow-hidden bg-[#070B14]" id="pricing">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#00F29D]/10 border border-[#00F29D]/20 text-[#00F29D] text-xs font-bold uppercase tracking-wider mb-4">
            <Sparkles className="w-3.5 h-3.5" /> Direct Transparent Membership
          </div>
          <h2 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight">
            One Membership. <span className="gradient-text-mint">Infinite Impact</span>.
          </h2>
          <p className="mt-4 text-base text-[#94A3B8]">
            Full golf performance tracking, guaranteed monthly jackpot draw entry, and direct charity support.
          </p>

          {/* Toggle Switch */}
          <div className="mt-8 inline-flex items-center p-1.5 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md">
            <button
              onClick={() => setBillingCycle('monthly')}
              className={`px-6 py-2 rounded-xl text-xs font-bold transition-all ${
                billingCycle === 'monthly'
                  ? 'bg-[#00F29D] text-[#06080F] shadow-lg shadow-[#00F29D]/20'
                  : 'text-[#94A3B8] hover:text-white'
              }`}
            >
              Monthly Billing
            </button>
            <button
              onClick={() => setBillingCycle('yearly')}
              className={`px-6 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all ${
                billingCycle === 'yearly'
                  ? 'bg-[#00F29D] text-[#06080F] shadow-lg shadow-[#00F29D]/20'
                  : 'text-[#94A3B8] hover:text-white'
              }`}
            >
              <span>Annual Plan</span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-[#FF6E40] text-white">
                SAVE 17% (2 MOS FREE)
              </span>
            </button>
          </div>
        </div>

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-5xl mx-auto">
          {/* Plan: Monthly */}
          <div
            className={`glass-panel rounded-3xl p-8 sm:p-10 flex flex-col justify-between transition-all ${
              billingCycle === 'monthly'
                ? 'border-[#00F29D] shadow-2xl ring-1 ring-[#00F29D]'
                : 'border-white/10 opacity-80'
            }`}
          >
            <div>
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h3 className="text-xl font-bold text-white">Monthly Flexibility</h3>
                  <p className="text-xs text-[#94A3B8] mt-1">Pay month-to-month, cancel anytime</p>
                </div>
                <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-white/5 text-[#94A3B8]">
                  Standard
                </span>
              </div>

              <div className="flex items-baseline gap-2 mb-6">
                <span className="text-5xl font-black text-white font-mono">$19</span>
                <span className="text-sm text-[#94A3B8]">/ month</span>
              </div>

              <div className="p-4 rounded-xl bg-white/5 border border-white/5 mb-8 space-y-2 text-xs">
                <div className="flex justify-between text-[#94A3B8]">
                  <span>To Monthly Prize Pool:</span>
                  <span className="text-white font-mono font-bold">$10.00</span>
                </div>
                <div className="flex justify-between text-[#94A3B8]">
                  <span>Direct Charity Passthrough (min 10%):</span>
                  <span className="text-[#FF6E40] font-mono font-bold">$1.90+</span>
                </div>
              </div>

              <ul className="space-y-3.5 text-sm text-[#94A3B8]">
                <li className="flex items-center gap-3 text-white">
                  <Check className="w-4 h-4 text-[#00F29D]" />
                  <span>Rolling 5-Score Stableford performance tracker</span>
                </li>
                <li className="flex items-center gap-3 text-white">
                  <Check className="w-4 h-4 text-[#00F29D]" />
                  <span>Monthly Draw entry with 40% rollover jackpot</span>
                </li>
                <li className="flex items-center gap-3 text-white">
                  <Check className="w-4 h-4 text-[#00F29D]" />
                  <span>Customizable charity allocation slider</span>
                </li>
                <li className="flex items-center gap-3 text-white">
                  <Check className="w-4 h-4 text-[#00F29D]" />
                  <span>Official winner certificate & audited payouts</span>
                </li>
              </ul>
            </div>

            <div className="mt-8 pt-6 border-t border-white/10">
              <Link
                href="/subscribe?plan=monthly"
                className="w-full py-4 rounded-xl glass-panel text-center font-bold text-sm text-white hover:border-white/30 transition-all block"
              >
                Select Monthly ($19/mo)
              </Link>
            </div>
          </div>

          {/* Plan: Yearly - Recommended */}
          <div
            className={`glass-panel-elevated rounded-3xl p-8 sm:p-10 flex flex-col justify-between relative overflow-hidden transition-all ${
              billingCycle === 'yearly'
                ? 'border-[#00F29D] shadow-2xl ring-2 ring-[#00F29D]'
                : 'border-white/10 opacity-85'
            }`}
          >
            <div className="absolute top-0 right-0 bg-gradient-to-l from-[#00F29D] to-[#00D2FF] text-[#06080F] text-[11px] font-extrabold uppercase tracking-widest px-4 py-1.5 rounded-bl-xl">
              RECOMMENDED • 17% SAVINGS
            </div>

            <div>
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h3 className="text-xl font-bold text-white">Annual Champion</h3>
                  <p className="text-xs text-[#00F29D] font-semibold mt-1">Includes 12 Full Monthly Draws</p>
                </div>
              </div>

              <div className="flex items-baseline gap-2 mb-2">
                <span className="text-5xl font-black text-white font-mono">$190</span>
                <span className="text-sm text-[#94A3B8]">/ year</span>
              </div>
              <p className="text-xs text-[#00F29D] font-medium mb-6">
                Equivalent to just $15.83/mo • Save $38 per year
              </p>

              <div className="p-4 rounded-xl bg-white/5 border border-white/5 mb-8 space-y-2 text-xs">
                <div className="flex justify-between text-[#94A3B8]">
                  <span>Annual Prize Pool Funding:</span>
                  <span className="text-white font-mono font-bold">$120.00</span>
                </div>
                <div className="flex justify-between text-[#94A3B8]">
                  <span>Guaranteed Direct Charity Funding:</span>
                  <span className="text-[#FF6E40] font-mono font-bold">$19.00+</span>
                </div>
              </div>

              <ul className="space-y-3.5 text-sm text-[#94A3B8]">
                <li className="flex items-center gap-3 text-white">
                  <Check className="w-4 h-4 text-[#00F29D]" />
                  <span>Full year of 12 consecutive monthly jackpot entries</span>
                </li>
                <li className="flex items-center gap-3 text-white">
                  <Check className="w-4 h-4 text-[#00F29D]" />
                  <span>Continuous 5-score rolling handicap tracking</span>
                </li>
                <li className="flex items-center gap-3 text-white">
                  <Check className="w-4 h-4 text-[#00F29D]" />
                  <span>Algorithmic consistency multiplier priority</span>
                </li>
                <li className="flex items-center gap-3 text-white">
                  <Check className="w-4 h-4 text-[#00F29D]" />
                  <span>VIP Charity golf tournament invitation access</span>
                </li>
              </ul>
            </div>

            <div className="mt-8 pt-6 border-t border-white/10">
              <Link
                href="/subscribe?plan=yearly"
                className="w-full py-4 rounded-xl btn-primary text-center font-bold text-sm block"
              >
                Join Annual Plan ($190/yr)
              </Link>
            </div>
          </div>
        </div>

        {/* Charity Transparency Slider Preview */}
        <div className="mt-16 glass-panel rounded-3xl p-8 max-w-3xl mx-auto border border-white/10">
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm font-bold text-white flex items-center gap-2">
              <Heart className="w-4 h-4 text-[#FF6E40]" /> Your Charity Passthrough Preference
            </span>
            <span className="text-base font-extrabold font-mono text-[#FF6E40]">
              {charityPct}% of your fee
            </span>
          </div>
          <input
            type="range"
            min={10}
            max={50}
            step={5}
            value={charityPct}
            onChange={e => setCharityPct(Number(e.target.value))}
            className="w-full accent-[#FF6E40] cursor-pointer"
          />
          <div className="flex justify-between text-[11px] text-[#64748B] mt-2">
            <span>10% (Platform Minimum)</span>
            <span>25% (Standard Hero)</span>
            <span>50% (Philanthropist Tier)</span>
          </div>
          <p className="text-xs text-[#94A3B8] text-center mt-4">
            You can increase or change your selected partner charity anytime from your subscriber dashboard.
          </p>
        </div>
      </div>
    </section>
  );
}
