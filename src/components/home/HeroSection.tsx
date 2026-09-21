'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Trophy, Heart, ArrowRight, Sparkles, TrendingUp, ShieldCheck, Zap } from 'lucide-react';

export default function HeroSection() {
  const [prizePool, setPrizePool] = useState(14250);
  const [charityTotal, setCharityTotal] = useState(391850);

  // Subtle animated counter ticker
  useEffect(() => {
    const timer = setInterval(() => {
      setPrizePool(prev => prev + Math.floor(Math.random() * 3) + 1);
      setCharityTotal(prev => prev + Math.floor(Math.random() * 4) + 1);
    }, 4000);
    return () => clearInterval(timer);
  }, []);

  return (
    <section className="relative min-h-screen pt-32 pb-24 flex items-center justify-center overflow-hidden">
      {/* Dynamic Ambient Background Glows */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[650px] h-[650px] bg-radial from-[#00F29D]/12 via-[#00D2FF]/6 to-transparent rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-1/3 right-10 w-[450px] h-[450px] bg-radial from-[#FF6E40]/10 via-transparent to-transparent rounded-full blur-3xl pointer-events-none" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center z-10">
        {/* Value Badge */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-white/5 border border-white/10 backdrop-blur-md mb-8 shadow-inner"
        >
          <span className="w-2 h-2 rounded-full bg-[#00F29D] animate-ping" />
          <span className="text-xs font-semibold tracking-wide text-white">
            NEXT MONTHLY DRAW LOCKS IN: <span className="text-[#00F29D]">9 DAYS, 14 HOURS</span>
          </span>
          <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-[#FF6E40]/20 text-[#FF6E40]">
            $8,180 JACKPOT ROLLOVER
          </span>
        </motion.div>

        {/* Hero Main Headline: Priority 1 - Impact & Prize Energy */}
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.1 }}
          className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-white max-w-5xl mx-auto leading-[1.1]"
        >
          Turn Your Golf Scores Into <br className="hidden sm:inline" />
          <span className="gradient-text-mint">Monthly Jackpots</span> &{' '}
          <span className="gradient-text-coral">Lifesaving Charity</span>.
        </motion.h1>

        {/* Emotion-driven Subheading: Priority 2 - How it connects */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.2 }}
          className="mt-6 text-lg sm:text-xl text-[#94A3B8] max-w-3xl mx-auto leading-relaxed"
        >
          Every round you log builds your verified 5-score Stableford entry into our monthly algorithmic prize draw. A minimum 10% of every membership is directly dedicated to youth education, veteran healing, and environmental recovery.
        </motion.p>

        {/* Live Emotional Metrics Card Grid */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.7, delay: 0.3 }}
          className="mt-12 grid grid-cols-1 sm:grid-cols-3 gap-5 max-w-4xl mx-auto"
        >
          {/* Metric 1: Charity Raised */}
          <div className="glass-panel rounded-2xl p-6 relative overflow-hidden group hover:border-[#FF6E40]/40 transition-all">
            <div className="absolute top-0 right-0 w-24 h-24 bg-[#FF6E40]/10 rounded-full blur-2xl -mr-6 -mt-6 group-hover:scale-125 transition-transform" />
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold uppercase tracking-wider text-[#FF6E40] flex items-center gap-1.5">
                <Heart className="w-4 h-4 fill-[#FF6E40]" /> Direct Charity Impact
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/5 text-[#94A3B8]">Audited</span>
            </div>
            <div className="text-3xl sm:text-4xl font-extrabold text-white font-mono tracking-tight">
              ${charityTotal.toLocaleString()}
            </div>
            <p className="text-xs text-[#64748B] mt-2">
              Distributed across 4 verified national partner initiatives
            </p>
          </div>

          {/* Metric 2: Monthly Prize Pool */}
          <div className="glass-panel rounded-2xl p-6 relative overflow-hidden group hover:border-[#00F29D]/40 transition-all">
            <div className="absolute top-0 right-0 w-24 h-24 bg-[#00F29D]/10 rounded-full blur-2xl -mr-6 -mt-6 group-hover:scale-125 transition-transform" />
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold uppercase tracking-wider text-[#00F29D] flex items-center gap-1.5">
                <Trophy className="w-4 h-4 text-[#00F29D]" /> Current Draw Pool
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#00F29D]/10 text-[#00F29D] font-bold">
                +Rollover Active
              </span>
            </div>
            <div className="text-3xl sm:text-4xl font-extrabold text-white font-mono tracking-tight">
              ${prizePool.toLocaleString()}
            </div>
            <p className="text-xs text-[#64748B] mt-2">
              40% jackpot + 35% 4-match + 25% 3-match tier splits
            </p>
          </div>

          {/* Metric 3: Verified Subscribers & Fairness */}
          <div className="glass-panel rounded-2xl p-6 relative overflow-hidden group hover:border-[#00D2FF]/40 transition-all">
            <div className="absolute top-0 right-0 w-24 h-24 bg-[#00D2FF]/10 rounded-full blur-2xl -mr-6 -mt-6 group-hover:scale-125 transition-transform" />
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold uppercase tracking-wider text-[#00D2FF] flex items-center gap-1.5">
                <Zap className="w-4 h-4 text-[#00D2FF]" /> Active Competitors
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/5 text-[#94A3B8]">Live Window</span>
            </div>
            <div className="text-3xl sm:text-4xl font-extrabold text-white font-mono tracking-tight">
              1,425
            </div>
            <p className="text-xs text-[#64748B] mt-2">
              Rolling 5-score limit ensures zero stale or inflated handicaps
            </p>
          </div>
        </motion.div>

        {/* Action CTAs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.4 }}
          className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4"
        >
          <Link
            href="/subscribe"
            className="w-full sm:w-auto px-8 py-4 rounded-xl btn-primary text-base flex items-center justify-center gap-2 group"
          >
            <span>Start Tracking & Competing ($19/mo)</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
          <Link
            href="/charities"
            className="w-full sm:w-auto px-8 py-4 rounded-xl glass-panel text-base font-semibold text-white hover:border-white/30 transition-all flex items-center justify-center gap-2"
          >
            <Heart className="w-4 h-4 text-[#FF6E40]" />
            <span>Explore Partner Charities</span>
          </Link>
        </motion.div>

        {/* Trust Badges */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.5 }}
          className="mt-12 flex flex-wrap items-center justify-center gap-6 sm:gap-10 text-xs text-[#64748B]"
        >
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-[#00F29D]" />
            <span>Audited Algorithmic Splitting</span>
          </div>
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-[#00D2FF]" />
            <span>Rolling 5-Score Stableford Logic</span>
          </div>
          <div className="flex items-center gap-2">
            <Heart className="w-4 h-4 text-[#FF6E40]" />
            <span>Transparent 10%+ Charity Transfer</span>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
