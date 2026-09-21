'use client';

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowRight, Trophy, ShieldCheck, Heart } from 'lucide-react';
import Pill from '@/components/ui/Pill';

export default function ClosingCtaBand() {
  return (
    <section className="relative py-28 sm:py-36 overflow-hidden bg-[#0A1410] text-white">
      {/* Dusk Golf Course Background Image with Moody Gradient Overlay */}
      <div className="absolute inset-0 z-0">
        <img
          src="https://images.unsplash.com/photo-1587174486073-ae5e5cff23aa?w=1800&auto=format&fit=crop&q=80"
          alt="Golf Green at Dusk"
          className="w-full h-full object-cover opacity-25 filter grayscale-[20%]"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0A1410] via-[#0A1410]/80 to-[#0A1410]/95" />
      </div>

      <div className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center z-10 space-y-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 border border-white/20 text-emerald-300 text-xs font-bold uppercase tracking-wider"
        >
          <Trophy className="w-3.5 h-3.5" /> Next Monthly Draw Countdown Active
        </motion.div>

        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="text-4xl sm:text-6xl font-extrabold tracking-tight text-white max-w-3xl mx-auto leading-[1.1]"
        >
          Compete for Monthly Jackpots. <br className="hidden sm:inline" />
          Fund Life-Changing Causes.
        </motion.h2>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="text-base sm:text-lg text-gray-300 max-w-2xl mx-auto leading-relaxed"
        >
          Join 1,400+ competitive club players turning weekend Stableford scores into life-changing prize jackpots and verified non-profit disbursements.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-4"
        >
          <Pill href="/subscribe" variant="mint" size="lg" arrow className="w-full sm:w-auto shadow-xl">
            Join the Monthly Draw ($19/mo)
          </Pill>
          <Pill 
            href="/charities" 
            variant="outline" 
            size="lg" 
            arrow 
            icon={<Heart className="w-4 h-4 text-rose-400" />}
            className="w-full sm:w-auto bg-white/10 text-white hover:bg-white/20 border-white/20"
          >
            View Supported Charities
          </Pill>
        </motion.div>

        <div className="pt-8 flex flex-wrap items-center justify-center gap-6 text-xs text-gray-400">
          <div className="flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Cancel anytime with 1-click</span>
          </div>
          <div className="flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>100% audited prize pool math</span>
          </div>
          <div className="flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Certified 10%+ charity pledge</span>
          </div>
        </div>
      </div>
    </section>
  );
}
