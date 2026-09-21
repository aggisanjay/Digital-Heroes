'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Target, Trophy, Heart, ShieldCheck, ArrowRight, CheckCircle2 } from 'lucide-react';
import FeatureCard3 from '@/components/ui/FeatureCard3';
import Pill from '@/components/ui/Pill';

export default function DrawMechanicsSection() {
  const pillars = [
    {
      icon: <Target className="w-5 h-5 text-emerald-800" />,
      tag: 'Pillar 1',
      title: 'Log Rolling Stableford Rounds',
      description: 'Your last 5 authenticated golf scores automatically generate your monthly ticket. No manual picks, no stale handicaps — strictly verified play.',
      footnote: 'Rolling 5-score limit prevents handicap inflation',
    },
    {
      icon: <Trophy className="w-5 h-5 text-amber-700" />,
      tag: 'Pillar 2',
      title: 'Monthly Algorithmic Prize Draw',
      description: '40% Tier 1 Jackpot + 35% Tier 2 (4-Match) + 25% Tier 3 (3-Match). Unclaimed jackpot funds roll over immediately into the next cycle.',
      footnote: 'Guaranteed cash splits every month',
    },
    {
      icon: <Heart className="w-5 h-5 text-rose-600" />,
      tag: 'Pillar 3',
      title: 'Automated Charity Disbursement',
      description: 'A minimum of 10% (up to 50%) of every membership fee is sent directly to certified youth, veteran, and environmental causes.',
      footnote: '100% transparent public accounting',
    },
  ];

  return (
    <section className="py-24 sm:py-32 bg-[#FAFAF8] relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-6">
          <div className="space-y-3 max-w-2xl">
            <span className="pill-badge bg-emerald-100 text-emerald-900 border border-emerald-200/60">
              The Three-Pillar Platform
            </span>
            <h2 className="text-3xl sm:text-5xl font-extrabold text-gray-900 tracking-tight leading-tight">
              Performance Meets Purpose in Three Steps.
            </h2>
            <p className="text-sm sm:text-base text-gray-600 leading-relaxed">
              Designed to reward honest play, fuel monthly competition, and generate predictable, life-saving funding for national non-profits.
            </p>
          </div>

          <Pill href="/how-it-works" variant="outline" size="md" arrow className="self-start md:self-auto">
            Official Rulebook
          </Pill>
        </div>

        {/* 3-Up Feature Cards Grid matching Hooma layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
          {/* Left: 3 Feature Cards */}
          <div className="lg:col-span-8 grid grid-cols-1 sm:grid-cols-3 gap-5">
            {pillars.map((pillar, idx) => (
              <FeatureCard3
                key={idx}
                icon={pillar.icon}
                tag={pillar.tag}
                title={pillar.title}
                description={pillar.description}
                footnote={pillar.footnote}
                delay={idx * 0.15}
              />
            ))}
          </div>

          {/* Right: Featured Card with Image & Prize Callout (Matching "Sunny Meadows Estate" pattern) */}
          <div className="lg:col-span-4">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7, delay: 0.3 }}
              className="light-card-elevated p-6 sm:p-7 flex flex-col justify-between h-full relative overflow-hidden group"
            >
              <div className="space-y-4">
                <div className="h-44 rounded-2xl overflow-hidden relative shadow-inner">
                  <img
                    src="https://images.unsplash.com/photo-1535131749006-b7f58c99034b?w=800&auto=format&fit=crop&q=80"
                    alt="Golf Green"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute top-3 left-3">
                    <span className="pill-badge bg-white/95 text-gray-900 shadow-md">
                      Featured Jackpot
                    </span>
                  </div>
                </div>

                <div>
                  <h3 className="text-xl font-black text-gray-900 tracking-tight">
                    September Cycle Pool
                  </h3>
                  <p className="text-xs text-gray-500 mt-1">
                    Rolling 40% Tier 1 prize pool with live participant matching
                  </p>
                </div>

                <div className="p-3.5 rounded-2xl bg-gray-50 border border-gray-100 flex items-center justify-between">
                  <span className="text-xs font-semibold text-gray-500">Tier 1 Target</span>
                  <span className="text-lg font-mono font-extrabold text-[#11382B]">
                    $14,250.00
                  </span>
                </div>
              </div>

              <div className="pt-5 mt-5 border-t border-gray-100 flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-xs text-emerald-800 font-semibold">
                  <ShieldCheck className="w-4 h-4 text-emerald-700" />
                  <span>Audited by Club Officers</span>
                </div>
                <Pill href="/subscribe" variant="primary" size="sm" arrow>
                  Join September Draw
                </Pill>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}
