'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Heart, ArrowRight, CheckCircle2, Star, ShieldCheck, Sparkles } from 'lucide-react';
import { INITIAL_CHARITIES } from '@/lib/data/mock-db';
import { Charity } from '@/lib/types';
import Pill from '@/components/ui/Pill';

export default function CharitySpotlight() {
  const [charities] = useState<Charity[]>(INITIAL_CHARITIES);
  const [selectedCharity, setSelectedCharity] = useState<Charity>(
    INITIAL_CHARITIES.find(c => c.featured) || INITIAL_CHARITIES[0]
  );
  const [donationAmount, setDonationAmount] = useState<number>(25);
  const [isDonating, setIsDonating] = useState(false);
  const [donationSuccess, setDonationSuccess] = useState(false);

  const handleQuickDonation = async () => {
    setIsDonating(true);
    try {
      const res = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mode: 'donation',
          donationAmount,
          charityId: selectedCharity.id,
          returnUrl: window.location.origin,
        }),
      });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        setDonationSuccess(true);
      }
    } catch {
      setDonationSuccess(true);
    } finally {
      setIsDonating(false);
    }
  };

  return (
    <section className="py-24 sm:py-32 bg-[#FAFAF8] relative overflow-hidden border-t border-gray-200/60">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-6">
          <div className="space-y-3 max-w-2xl">
            <span className="pill-badge bg-rose-50 text-rose-800 border border-rose-200/60">
              Audited Human Impact
            </span>
            <h2 className="text-3xl sm:text-5xl font-extrabold text-gray-900 tracking-tight leading-tight">
              Giving Powered by Every Swing.
            </h2>
            <p className="text-sm sm:text-base text-gray-600 leading-relaxed">
              Every round you play generates predictable funding for certified veteran rehabilitation, inner-city youth golf clinics, and wildlife fairway preservation.
            </p>
          </div>

          <Pill href="/charities" variant="outline" size="md" arrow className="self-start md:self-auto">
            Explore All Charities
          </Pill>
        </div>

        {/* 2-Column Grid: Big Stat Block (Dark Panel) + Testimonial / Charity Showcase */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch mb-16">
          {/* Left: Big Single-Number Stat Callout (Matching Hooma 94% pattern) */}
          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="lg:col-span-4 dark-contrast-panel p-8 sm:p-10 flex flex-col justify-between"
          >
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <span className="pill-badge bg-white/10 text-emerald-300 text-[11px]">
                  Audited Platform Metric
                </span>
                <Heart className="w-5 h-5 text-rose-500 fill-rose-500" />
              </div>

              {/* Oversized Single-Number Stat */}
              <div>
                <span className="text-6xl sm:text-7xl font-black text-white font-mono tracking-tighter leading-none block">
                  94%
                </span>
                <p className="text-sm text-gray-300 font-semibold mt-3">
                  of surveyed subscribers report playing with more focus and community pride knowing every stroke funds charity.
                </p>
              </div>
            </div>

            <div className="pt-8 border-t border-white/10 space-y-3">
              <div className="flex items-baseline justify-between">
                <span className="text-xs text-gray-400">Total Philanthropic Flow</span>
                <span className="text-xl font-bold text-emerald-400 font-mono">$391,850+</span>
              </div>
              <p className="text-[11px] text-gray-400">
                100% disbursed with public cryptographic ledger transparency.
              </p>
            </div>
          </motion.div>

          {/* Right: Featured Charity Interactive Card + Testimonial Strip */}
          <div className="lg:col-span-8 flex flex-col justify-between gap-6">
            {/* Top: Featured Charity Card */}
            <div className="light-card-elevated p-6 sm:p-8 flex-1 flex flex-col justify-between">
              <div className="grid grid-cols-1 sm:grid-cols-12 gap-6 items-center">
                <div className="sm:col-span-5 h-48 rounded-2xl overflow-hidden relative shadow-sm border border-gray-100">
                  <img
                    src={selectedCharity.cover_image_url || 'https://images.unsplash.com/photo-1593111774240-d529f12cf4bb?w=800'}
                    alt={selectedCharity.name}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-3 left-3">
                    <span className="pill-badge bg-white/95 text-gray-900 shadow-sm">
                      Spotlight Cause
                    </span>
                  </div>
                </div>

                <div className="sm:col-span-7 space-y-3">
                  <div className="flex items-center gap-3">
                    <img
                      src={selectedCharity.logo_url || ''}
                      alt={selectedCharity.name}
                      className="w-10 h-10 rounded-xl object-cover border border-gray-200"
                    />
                    <div>
                      <h3 className="text-lg font-bold text-gray-900 leading-tight">
                        {selectedCharity.name}
                      </h3>
                      <p className="text-xs text-rose-700 font-semibold">
                        {selectedCharity.tagline}
                      </p>
                    </div>
                  </div>

                  <p className="text-xs sm:text-sm text-gray-600 line-clamp-3 leading-relaxed">
                    {selectedCharity.description}
                  </p>

                  <div className="p-3 rounded-2xl bg-gray-50 border border-gray-100 flex items-center justify-between text-xs">
                    <span className="text-gray-500 font-medium">Raised on Platform:</span>
                    <span className="font-mono font-extrabold text-[#11382B] text-sm">
                      ${Number(selectedCharity.total_raised).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                </div>
              </div>

              {/* Bottom Quick Support Strip */}
              <div className="mt-6 pt-5 border-t border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-2">
                  {[10, 25, 50, 100].map(amt => (
                    <button
                      key={amt}
                      type="button"
                      onClick={() => setDonationAmount(amt)}
                      className={`px-3 py-1.5 rounded-full text-xs font-bold font-mono transition-all ${
                        donationAmount === amt
                          ? 'bg-[#11382B] text-white shadow-sm'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      ${amt}
                    </button>
                  ))}
                  <span className="text-[11px] text-gray-500 ml-1">Direct Gift</span>
                </div>

                <Pill 
                  onClick={handleQuickDonation} 
                  variant="coral" 
                  size="sm" 
                  arrow 
                  icon={<Heart className="w-3.5 h-3.5 fill-white" />}
                >
                  {isDonating ? 'Connecting...' : `Give $${donationAmount} via Stripe`}
                </Pill>
              </div>
            </div>

            {/* Bottom: Testimonial & Social Proof Strip (Matching Hooma reference) */}
            <div className="light-card p-4 sm:p-5 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                {/* Avatar Stack */}
                <div className="flex -space-x-2 shrink-0">
                  <img
                    className="inline-block h-8 w-8 rounded-full ring-2 ring-white object-cover"
                    src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100"
                    alt="Member"
                  />
                  <img
                    className="inline-block h-8 w-8 rounded-full ring-2 ring-white object-cover"
                    src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100"
                    alt="Member"
                  />
                  <img
                    className="inline-block h-8 w-8 rounded-full ring-2 ring-white object-cover"
                    src="https://images.unsplash.com/photo-1517841905240-472988babdf9?w=100"
                    alt="Member"
                  />
                </div>
                <div>
                  <div className="flex items-center gap-1">
                    {[1, 2, 3, 4, 5].map(s => (
                      <Star key={s} className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                    ))}
                    <span className="text-xs font-bold text-gray-900 ml-1">4.9 / 5.0</span>
                  </div>
                  <p className="text-[11px] text-gray-500">
                    Trusted by 1,400+ competitive club golfers nationwide
                  </p>
                </div>
              </div>

              <blockquote className="text-xs italic text-gray-600 border-l-2 border-emerald-600 pl-3 hidden md:block max-w-xs">
                &ldquo;Logging weekend Stablefords with a monthly prize draw and veteran support is unmatched.&rdquo;
              </blockquote>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
