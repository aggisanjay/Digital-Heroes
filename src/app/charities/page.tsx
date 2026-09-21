'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Heart, Search, Filter, Calendar, MapPin, ArrowRight, Sparkles } from 'lucide-react';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { store } from '@/lib/data/mock-db';
import { Charity } from '@/lib/types';

export default function CharitiesDirectoryPage() {
  const [charities, setCharities] = useState<Charity[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTag, setSelectedTag] = useState<string>('all');

  useEffect(() => {
    fetch('/api/charities')
      .then(res => res.json())
      .then(data => {
        if (data.charities && data.charities.length > 0) {
          setCharities(data.charities);
        } else {
          setCharities(store.getCharities());
        }
      })
      .catch(() => {
        setCharities(store.getCharities());
      });
  }, []);

  const filteredCharities = charities.filter(c => {
    const matchesSearch = c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (c.tagline && c.tagline.toLowerCase().includes(searchQuery.toLowerCase()));

    if (selectedTag === 'featured') return matchesSearch && c.featured;
    return matchesSearch;
  });

  return (
    <main className="min-h-screen flex flex-col bg-[#06080F] text-[#F8FAFC]">
      <Navbar />

      <div className="pt-32 pb-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full flex-1">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#FF6E40]/10 border border-[#FF6E40]/30 text-[#FF6E40] text-xs font-bold uppercase tracking-wider mb-4">
            <Heart className="w-3.5 h-3.5 fill-[#FF6E40]" /> Verified Impact Directory
          </div>
          <h1 className="text-4xl sm:text-5xl font-extrabold text-white tracking-tight">
            Our Partner <span className="gradient-text-coral">Charities</span>
          </h1>
          <p className="mt-4 text-base text-[#94A3B8]">
            Explore the 4 national foundations supported by Digital Heroes subscribers. 100% of your chosen charity contribution goes directly to their mission.
          </p>

          {/* Search & Filter Controls */}
          <div className="mt-8 flex flex-col sm:flex-row items-center gap-3 max-w-xl mx-auto">
            <div className="relative w-full">
              <Search className="w-4 h-4 text-[#64748B] absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search causes, youth sports, veterans..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white text-xs placeholder-slate-500 focus:outline-none focus:border-[#FF6E40] transition-colors"
              />
            </div>

            <div className="flex gap-2 w-full sm:w-auto">
              <button
                onClick={() => setSelectedTag('all')}
                className={`px-4 py-3 rounded-xl text-xs font-bold border transition-all whitespace-nowrap ${
                  selectedTag === 'all'
                    ? 'bg-white/15 border-white/20 text-white'
                    : 'bg-white/5 border-white/10 text-[#94A3B8]'
                }`}
              >
                All Causes
              </button>
              <button
                onClick={() => setSelectedTag('featured')}
                className={`px-4 py-3 rounded-xl text-xs font-bold border transition-all whitespace-nowrap ${
                  selectedTag === 'featured'
                    ? 'bg-[#FF6E40] border-[#FF6E40] text-white'
                    : 'bg-white/5 border-white/10 text-[#94A3B8]'
                }`}
              >
                Spotlight Only
              </button>
            </div>
          </div>
        </div>

        {/* Charities Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {filteredCharities.map(c => (
            <div
              key={c.id}
              className="glass-panel-elevated rounded-3xl overflow-hidden border border-white/10 hover:border-[#FF6E40]/40 transition-all flex flex-col justify-between group"
            >
              {/* Cover Image Banner */}
              <div className="relative h-48 sm:h-56 overflow-hidden">
                <img
                  src={c.cover_image_url || ''}
                  alt={c.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0D1322] via-[#0D1322]/50 to-transparent" />

                <div className="absolute top-4 right-4 flex gap-2">
                  {c.featured && (
                    <span className="px-3 py-1 rounded-full bg-[#FF6E40] text-black text-xs font-extrabold shadow-lg">
                      Spotlight
                    </span>
                  )}
                </div>

                <div className="absolute bottom-4 left-6 flex items-center gap-3">
                  <img
                    src={c.logo_url || ''}
                    alt={c.name}
                    className="w-12 h-12 rounded-xl object-cover border-2 border-white/20 shadow-xl"
                  />
                  <div>
                    <h2 className="text-xl font-bold text-white group-hover:text-[#FF6E40] transition-colors">
                      {c.name}
                    </h2>
                    <span className="text-xs text-[#FF6E40] font-semibold">{c.tagline}</span>
                  </div>
                </div>
              </div>

              {/* Body */}
              <div className="p-6 sm:p-8 space-y-6 flex-1 flex flex-col justify-between">
                <p className="text-sm text-[#94A3B8] leading-relaxed line-clamp-3">
                  {c.description}
                </p>

                {/* Raised progress */}
                <div className="p-4 rounded-2xl bg-white/5 border border-white/5 space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-[#94A3B8]">Total Direct Impact Raised:</span>
                    <span className="font-mono font-bold text-[#FF6E40] text-sm">
                      ${Number(c.total_raised).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                </div>

                {/* Upcoming Events preview */}
                {c.events && c.events.length > 0 && (
                  <div className="space-y-2">
                    <span className="text-[11px] uppercase tracking-wider font-bold text-[#64748B] block">
                      Next Golf Fundraiser:
                    </span>
                    <div className="flex items-center justify-between text-xs text-slate-300">
                      <span className="font-semibold flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-[#00F29D]" /> {c.events[0].title}
                      </span>
                      <span className="text-[#94A3B8] flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5 text-[#FF6E40]" /> {c.events[0].location}
                      </span>
                    </div>
                  </div>
                )}

                {/* Action CTA */}
                <div className="pt-4 border-t border-white/10 flex items-center justify-between">
                  <Link
                    href={`/charities/${c.slug}`}
                    className="text-xs font-bold text-[#00F29D] hover:underline flex items-center gap-1"
                  >
                    <span>View Profile & Upcoming Events</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>

                  <Link
                    href={`/subscribe?charityId=${c.id}`}
                    className="px-4 py-2 rounded-xl btn-charity text-xs font-bold"
                  >
                    Support This Cause
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <Footer />
    </main>
  );
}
