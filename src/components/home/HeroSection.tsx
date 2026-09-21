'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion, useScroll, useTransform } from 'framer-motion';
import { 
  Trophy, 
  Heart, 
  ArrowRight, 
  Sparkles, 
  Target, 
  Sliders, 
  CheckCircle2, 
  Clock, 
  ShieldCheck,
  TrendingUp
} from 'lucide-react';
import GenerativeHeroBackground from '@/components/ui/GenerativeHeroBackground';
import Pill from '@/components/ui/Pill';
import StatChip from '@/components/ui/StatChip';
import TiltCard from '@/components/ui/TiltCard';

export default function HeroSection() {
  const [handicap, setHandicap] = useState<number>(14);
  const [selectedCharity, setSelectedCharity] = useState<string>('Veterans On The Green');
  const [drawMode, setDrawMode] = useState<'algorithmic' | 'random'>('algorithmic');
  const [prizePool, setPrizePool] = useState<number>(14250);

  // Parallax on scroll
  const { scrollY } = useScroll();
  const yCollageBack = useTransform(scrollY, [0, 600], [0, -40]);
  const yCollageFront = useTransform(scrollY, [0, 600], [0, -85]);
  const yStatChip = useTransform(scrollY, [0, 600], [0, -120]);

  useEffect(() => {
    const timer = setInterval(() => {
      setPrizePool(prev => prev + Math.floor(Math.random() * 3) + 1);
    }, 4000);
    return () => clearInterval(timer);
  }, []);

  return (
    <section className="relative min-h-screen pt-32 pb-20 sm:pt-40 sm:pb-28 overflow-hidden flex flex-col justify-between">
      {/* 1. Full-Bleed Generative Mesh Background (§2) */}
      <GenerativeHeroBackground />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 z-10 w-full">
        {/* Top Floating Badge */}
        <motion.div
          initial={{ opacity: 0, y: -16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="flex justify-center mb-6"
        >
          <div className="pill-container px-4 py-1.5 inline-flex items-center gap-2 shadow-sm">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
            <span className="text-[11px] font-bold text-gray-800 tracking-wide uppercase">
              Cycle Draw Countdown:
            </span>
            <span className="text-xs font-mono font-extrabold text-[#11382B]">
              9d 14h 22m
            </span>
            <span className="pill-badge bg-emerald-100 text-emerald-800 text-[10px] ml-1">
              $8,180 Rollover
            </span>
          </div>
        </motion.div>

        {/* Main Grid: Headline + Visual Collage */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center mb-16">
          {/* Left Column: Icon-Interrupted Headline & Subtitle */}
          <div className="lg:col-span-7 text-center lg:text-left space-y-6">
            <motion.h1
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.1 }}
              className="text-4xl sm:text-6xl lg:text-7xl font-extrabold text-gray-900 tracking-tight leading-[1.08]"
            >
              Turn Verified
              <span className="inline-flex items-center justify-center align-middle mx-2 w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-emerald-100 text-emerald-900 shadow-sm border border-emerald-200/60">
                <Target className="w-5 h-5 text-emerald-800" />
              </span>
              Golf Scores Into Monthly
              <span className="inline-flex items-center justify-center align-middle mx-2 w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-amber-100 text-amber-900 shadow-sm border border-amber-200/60">
                <Trophy className="w-5 h-5 text-amber-700" />
              </span>
              Jackpots & Lifesaving Charity.
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.2 }}
              className="text-base sm:text-lg text-gray-600 max-w-2xl mx-auto lg:mx-0 leading-relaxed font-normal"
            >
              Every Stableford round you log automatically creates your verified 5-score draw entry. A minimum of 10% from every membership directly heals veterans, guides youth, and restores green sanctuaries.
            </motion.p>

            {/* Hero Main Action Buttons (Hooma Enclosed Arrow Pill Style) */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.28 }}
              className="pt-2 space-y-4"
            >
              <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-3.5">
                <Pill href="/subscribe" variant="primary" size="lg" arrow className="w-full sm:w-auto shadow-lg">
                  Join September Draw ($19/mo)
                </Pill>
                <Pill href="/how-it-works" variant="outline" size="lg" arrow className="w-full sm:w-auto">
                  How Scoring & Draws Work
                </Pill>
              </div>

              <div className="flex flex-wrap items-center justify-center lg:justify-start gap-x-5 gap-y-2 text-xs text-gray-500 font-medium">
                <span className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700" />
                  100% Verified Rolling Play
                </span>
                <span className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700" />
                  Min. 10% Direct Charity Donation
                </span>
                <span className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700" />
                  Cancel Anytime
                </span>
              </div>
            </motion.div>
          </div>

          {/* Right Column: Overlapping Rounded-Corner Image Collage (§1) */}
          <div className="lg:col-span-5 relative flex justify-center lg:justify-end">
            <div className="relative w-full max-w-md sm:max-w-lg h-[340px] sm:h-[400px]">
              {/* Image Layer 1: Back Staggered Card (Golf Course Landscape) */}
              <motion.div
                style={{ y: yCollageBack }}
                className="absolute right-4 top-2 w-[85%] h-[260px] rounded-[32px] overflow-hidden shadow-2xl border border-black/5"
              >
                <img
                  src="https://images.unsplash.com/photo-1592919505780-303950717480?w=1000&auto=format&fit=crop&q=80"
                  alt="Championship Golf Course"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
                <div className="absolute bottom-4 left-5 text-white">
                  <p className="text-[11px] font-semibold text-emerald-300 uppercase tracking-wider">Tournament Certified</p>
                  <p className="text-sm font-bold">Rolling 5-Score Stableford</p>
                </div>
              </motion.div>

              {/* Image Layer 2: Front Staggered Card (Live Performance Scorecard Card) */}
              <motion.div
                style={{ y: yCollageFront }}
                className="absolute left-0 bottom-2 w-[78%] bg-white rounded-[28px] p-5 shadow-2xl shadow-black/10 border border-gray-100"
              >
                <TiltCard maxTilt={6}>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between border-b border-gray-100 pb-2">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-full bg-emerald-50 text-emerald-800 flex items-center justify-center font-bold text-xs">
                          5
                        </div>
                        <span className="text-xs font-extrabold text-gray-900">Recent Stableford Rounds</span>
                      </div>
                      <span className="pill-badge bg-emerald-50 text-emerald-800 text-[10px]">Verified</span>
                    </div>

                    {/* 5 Rolling Numbers Row */}
                    <div className="grid grid-cols-5 gap-1.5">
                      {[38, 36, 40, 35, 39].map((score, i) => (
                        <div key={i} className="bg-gray-50 rounded-xl p-2 text-center border border-gray-100">
                          <span className="text-[10px] text-gray-400 block uppercase">R{i+1}</span>
                          <span className="text-sm font-mono font-extrabold text-emerald-900">{score}</span>
                        </div>
                      ))}
                    </div>

                    <div className="flex items-center justify-between text-[11px] pt-1">
                      <span className="text-gray-500">Avg Points: <strong className="text-gray-900 font-mono">37.6</strong></span>
                      <span className="text-emerald-700 font-semibold">Ready for Next Draw</span>
                    </div>
                  </div>
                </TiltCard>
              </motion.div>

              {/* Top Floating Pinned Stat Chip Pinned Over Collage */}
              <motion.div
                style={{ y: yStatChip }}
                className="absolute -top-3 left-2 sm:-left-4 z-20"
              >
                <StatChip
                  icon={<Trophy className="w-4 h-4 text-emerald-700" />}
                  value={`$${prizePool.toLocaleString()}`}
                  highlight="40% Rollover"
                  label="Current Monthly Pool"
                  floatDelay={0.2}
                />
              </motion.div>

              {/* Bottom Floating Charity Impact Chip */}
              <div className="absolute -bottom-4 right-2 z-20 hidden sm:block">
                <StatChip
                  icon={<Heart className="w-4 h-4 text-rose-600 fill-rose-600" />}
                  value="$391,850+"
                  highlight="Audited"
                  label="Direct Charity Impact"
                  floatDelay={0.5}
                />
              </div>
            </div>
          </div>
        </div>

        {/* 2. Interactive Search/Filter Bar Widget Sitting in the Hero (§1) */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.35 }}
          className="w-full max-w-5xl mx-auto"
        >
          <div className="light-card-elevated p-4 sm:p-5">
            {/* Top Row: 4 Horizontal Segment Inputs */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mb-4">
              {/* Segment 1: Handicap Input */}
              <div className="p-3.5 rounded-2xl bg-gray-50/80 border border-gray-100 hover:border-gray-300/80 transition-colors">
                <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-1">
                  1. Your Handicap
                </label>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-bold text-gray-900 font-mono">
                    {handicap} {handicap <= 9 ? 'Scratch / Low' : handicap <= 18 ? 'Mid-Cap' : 'Recreational'}
                  </span>
                  <input
                    type="range"
                    min={0}
                    max={36}
                    value={handicap}
                    onChange={e => setHandicap(Number(e.target.value))}
                    className="w-20 accent-[#11382B] cursor-pointer"
                  />
                </div>
              </div>

              {/* Segment 2: Monthly Prize Pool Ticker */}
              <div className="p-3.5 rounded-2xl bg-gray-50/80 border border-gray-100 hover:border-gray-300/80 transition-colors">
                <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-1">
                  2. Est. Draw Pool
                </label>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-mono font-extrabold text-emerald-800">
                    ${prizePool.toLocaleString()}
                  </span>
                  <span className="pill-badge bg-emerald-100 text-emerald-800 text-[10px]">
                    Growing Live
                  </span>
                </div>
              </div>

              {/* Segment 3: Designated Charity Selector */}
              <div className="p-3.5 rounded-2xl bg-gray-50/80 border border-gray-100 hover:border-gray-300/80 transition-colors">
                <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-1">
                  3. Your Cause
                </label>
                <select
                  value={selectedCharity}
                  onChange={e => setSelectedCharity(e.target.value)}
                  className="w-full bg-transparent text-xs font-bold text-gray-900 focus:outline-none cursor-pointer"
                >
                  <option value="Veterans On The Green">Veterans On The Green</option>
                  <option value="Youth Golf Leadership">Youth Golf Leadership</option>
                  <option value="Eco-Course Sanctuary">Eco-Course Sanctuary</option>
                  <option value="Fairway Foundation">Fairway Foundation</option>
                </select>
              </div>

              {/* Segment 4: Draw Calculation Mode */}
              <div className="p-3.5 rounded-2xl bg-gray-50/80 border border-gray-100 hover:border-gray-300/80 transition-colors">
                <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-1">
                  4. Calculation Engine
                </label>
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => setDrawMode('algorithmic')}
                    className={`px-2.5 py-1 rounded-full text-[11px] font-bold transition-all ${
                      drawMode === 'algorithmic'
                        ? 'bg-[#11382B] text-white shadow-sm'
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    Algorithmic
                  </button>
                  <button
                    type="button"
                    onClick={() => setDrawMode('random')}
                    className={`px-2.5 py-1 rounded-full text-[11px] font-bold transition-all ${
                      drawMode === 'random'
                        ? 'bg-[#11382B] text-white shadow-sm'
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    Lottery
                  </button>
                </div>
              </div>
            </div>

            {/* Bottom Filter Strip & Action Button (Matching Hooma reference-design.png) */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-3 border-t border-gray-100">
              <div className="flex flex-wrap items-center gap-1.5 w-full sm:w-auto">
                <button
                  type="button"
                  className="px-3.5 py-1.5 rounded-full text-xs font-bold bg-[#11382B] text-white shadow-xs"
                >
                  All Draws
                </button>
                <button
                  type="button"
                  className="px-3.5 py-1.5 rounded-full text-xs font-semibold bg-gray-100 hover:bg-gray-200 text-gray-700 transition-colors"
                >
                  Stableford 36+
                </button>
                <button
                  type="button"
                  className="px-3.5 py-1.5 rounded-full text-xs font-semibold bg-gray-100 hover:bg-gray-200 text-gray-700 transition-colors"
                >
                  Rolling 5
                </button>
                <button
                  type="button"
                  className="px-3.5 py-1.5 rounded-full text-xs font-semibold bg-gray-100 hover:bg-gray-200 text-gray-700 transition-colors hidden md:inline-block"
                >
                  Verified Handicap
                </button>
              </div>

              <div className="flex items-center gap-2.5 w-full sm:w-auto justify-end">
                <Pill href="/how-it-works" variant="outline" size="md">
                  View Rules
                </Pill>
                <Pill href="/subscribe" variant="primary" size="md" arrow className="shadow-md">
                  Find Active Draws ($19/mo)
                </Pill>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
