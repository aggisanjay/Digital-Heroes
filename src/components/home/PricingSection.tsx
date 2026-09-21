'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Check, Heart, Shield, ArrowRight, Sparkles } from 'lucide-react';
import Pill from '@/components/ui/Pill';

export default function PricingSection() {
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('yearly');
  const [charityPct, setCharityPct] = useState<number>(10);

  return (
    <section className="py-24 sm:py-32 bg-[#FAFAF8] relative overflow-hidden border-t border-gray-200/60">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-12">
          <span className="pill-badge bg-emerald-100 text-emerald-900 border border-emerald-200/60 mb-4">
            Transparent Pricing
          </span>
          <h2 className="text-3xl sm:text-5xl font-extrabold text-gray-900 tracking-tight leading-tight">
            One Membership. Monthly Jackpots. Pure Impact.
          </h2>
          <p className="mt-4 text-sm sm:text-base text-gray-600 leading-relaxed">
            Every subscription fuels the prize pool, maintains your rolling handicap tracking, and sends certified funds to your chosen non-profit partner.
          </p>

          {/* Pill-Shaped Billing Cycle Toggle (Matching Hooma reference pill UI) */}
          <div className="flex justify-center mt-8">
            <div className="pill-container p-1.5 inline-flex items-center gap-1 shadow-sm">
              <button
                type="button"
                onClick={() => setBillingCycle('monthly')}
                className={`px-5 py-2 rounded-full text-xs font-bold transition-all ${
                  billingCycle === 'monthly'
                    ? 'bg-[#11382B] text-white shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Monthly Flexible
              </button>
              <button
                type="button"
                onClick={() => setBillingCycle('yearly')}
                className={`px-5 py-2 rounded-full text-xs font-bold transition-all flex items-center gap-1.5 ${
                  billingCycle === 'yearly'
                    ? 'bg-[#11382B] text-white shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <span>Annual Champion</span>
                <span className="bg-emerald-400 text-gray-900 text-[10px] font-extrabold px-2 py-0.5 rounded-full">
                  SAVE 17%
                </span>
              </button>
            </div>
          </div>
        </div>

        {/* 2-Column Pricing Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-5xl mx-auto mb-16">
          {/* Plan 1: Monthly */}
          <motion.div
            whileHover={{ y: -4 }}
            className={`light-card p-8 sm:p-10 flex flex-col justify-between transition-all duration-300 ${
              billingCycle === 'monthly'
                ? 'border-[#11382B] ring-2 ring-[#11382B]/10 shadow-xl'
                : 'opacity-90'
            }`}
          >
            <div>
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h3 className="text-xl font-bold text-gray-900">Monthly Flexible</h3>
                  <p className="text-xs text-gray-500 mt-1">Month-to-month membership, cancel anytime</p>
                </div>
                <span className="pill-badge bg-gray-100 text-gray-700">Standard</span>
              </div>

              <div className="flex items-baseline gap-2 mb-6">
                <span className="text-5xl font-black text-gray-900 font-mono">$19</span>
                <span className="text-sm text-gray-500 font-medium">/ month</span>
              </div>

              {/* Pool & Charity Breakdown Box */}
              <div className="p-4 rounded-2xl bg-gray-50 border border-gray-100 mb-8 space-y-2 text-xs">
                <div className="flex justify-between text-gray-600">
                  <span>To Monthly Prize Pool:</span>
                  <span className="text-gray-900 font-mono font-bold">$10.00</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Direct Charity Passthrough (min 10%):</span>
                  <span className="text-rose-700 font-mono font-bold">$1.90+</span>
                </div>
              </div>

              <ul className="space-y-3 text-xs sm:text-sm text-gray-700">
                <li className="flex items-center gap-3">
                  <div className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center shrink-0">
                    <Check className="w-3.5 h-3.5" />
                  </div>
                  <span>Rolling 5-Score Stableford performance tracking</span>
                </li>
                <li className="flex items-center gap-3">
                  <div className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center shrink-0">
                    <Check className="w-3.5 h-3.5" />
                  </div>
                  <span>Monthly Draw entry with 40% rollover jackpot</span>
                </li>
                <li className="flex items-center gap-3">
                  <div className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center shrink-0">
                    <Check className="w-3.5 h-3.5" />
                  </div>
                  <span>Customizable charity allocation slider (10% to 50%)</span>
                </li>
                <li className="flex items-center gap-3">
                  <div className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center shrink-0">
                    <Check className="w-3.5 h-3.5" />
                  </div>
                  <span>Official winner certificate & audited payouts</span>
                </li>
              </ul>
            </div>

            <div className="mt-8 pt-6 border-t border-gray-100">
              <Pill href="/subscribe?plan=monthly" variant="outline" size="lg" arrow className="w-full">
                Select Monthly ($19/mo)
              </Pill>
            </div>
          </motion.div>

          {/* Plan 2: Annual Champion (Recommended) */}
          <motion.div
            whileHover={{ y: -4 }}
            className={`light-card-elevated p-8 sm:p-10 flex flex-col justify-between relative overflow-hidden transition-all duration-300 border-2 ${
              billingCycle === 'yearly'
                ? 'border-[#11382B] shadow-2xl'
                : 'border-gray-200'
            }`}
          >
            <div className="absolute top-0 right-0 bg-[#11382B] text-white text-[10px] font-extrabold uppercase tracking-widest px-4 py-1.5 rounded-bl-2xl">
              RECOMMENDED • 17% SAVINGS
            </div>

            <div>
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h3 className="text-xl font-bold text-gray-900">Annual Champion</h3>
                  <p className="text-xs text-emerald-800 font-bold mt-1">Includes 12 Full Monthly Draws</p>
                </div>
              </div>

              <div className="flex items-baseline gap-2 mb-2">
                <span className="text-5xl font-black text-gray-900 font-mono">$190</span>
                <span className="text-sm text-gray-500 font-medium">/ year</span>
              </div>
              <p className="text-xs text-emerald-800 font-semibold mb-6">
                Equivalent to just $15.83/mo • Save $38 per year
              </p>

              {/* Pool & Charity Breakdown Box */}
              <div className="p-4 rounded-2xl bg-emerald-50/70 border border-emerald-100 mb-8 space-y-2 text-xs">
                <div className="flex justify-between text-gray-600">
                  <span>Annual Prize Pool Funding:</span>
                  <span className="text-gray-900 font-mono font-bold">$120.00</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Guaranteed Direct Charity Funding:</span>
                  <span className="text-rose-700 font-mono font-bold">$19.00+</span>
                </div>
              </div>

              <ul className="space-y-3 text-xs sm:text-sm text-gray-700">
                <li className="flex items-center gap-3">
                  <div className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center shrink-0">
                    <Check className="w-3.5 h-3.5" />
                  </div>
                  <span>Full year of 12 consecutive monthly jackpot entries</span>
                </li>
                <li className="flex items-center gap-3">
                  <div className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center shrink-0">
                    <Check className="w-3.5 h-3.5" />
                  </div>
                  <span>Continuous 5-score rolling handicap tracking</span>
                </li>
                <li className="flex items-center gap-3">
                  <div className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center shrink-0">
                    <Check className="w-3.5 h-3.5" />
                  </div>
                  <span>Priority registration for partner charity tournaments</span>
                </li>
                <li className="flex items-center gap-3">
                  <div className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center shrink-0">
                    <Check className="w-3.5 h-3.5" />
                  </div>
                  <span>Official champion digital badge & verified ledger</span>
                </li>
              </ul>
            </div>

            <div className="mt-8 pt-6 border-t border-gray-100">
              <Pill href="/subscribe?plan=yearly" variant="primary" size="lg" arrow className="w-full shadow-lg">
                Join Annual Plan ($190/yr)
              </Pill>
            </div>
          </motion.div>
        </div>

        {/* Charity Transparency Slider Card */}
        <div className="light-card p-6 sm:p-8 max-w-3xl mx-auto border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm font-bold text-gray-900 flex items-center gap-2">
              <Heart className="w-4 h-4 text-rose-600 fill-rose-600" /> Your Charity Passthrough Preference
            </span>
            <span className="text-base font-extrabold font-mono text-rose-600">
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
            className="w-full accent-rose-600 cursor-pointer"
          />
          <div className="flex justify-between text-[11px] text-gray-500 mt-2 font-medium">
            <span>10% (Platform Minimum)</span>
            <span>25% (Standard Hero)</span>
            <span>50% (Philanthropist Tier)</span>
          </div>
          <p className="text-xs text-gray-500 text-center mt-4">
            You can adjust or change your designated partner charity anytime from your member account.
          </p>
        </div>
      </div>
    </section>
  );
}
