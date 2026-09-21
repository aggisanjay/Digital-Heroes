'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Heart, Search, Calendar, MapPin, ArrowRight } from 'lucide-react';
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
    <main className="min-h-screen flex flex-col bg-[#FAFAF8] text-[#111827]">
      <Navbar />

      <div className="pt-32 pb-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full flex-1">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-14">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-orange-50 border border-orange-200 text-[#E25B37] text-xs font-bold uppercase tracking-wider mb-4">
            <Heart className="w-3.5 h-3.5 fill-[#E25B37]" /> Verified Impact Directory
          </div>
          <h1 className="text-4xl sm:text-5xl font-extrabold text-[#111827] tracking-tight">
            Our Partner <span className="text-[#E25B37]">Charities</span>
          </h1>
          <p className="mt-4 text-base text-gray-600">
            Explore the verified national foundations supported by Digital Heroes subscribers. 100% of your chosen charity contribution goes directly to their mission.
          </p>

          {/* Search & Filter Controls */}
          <div className="mt-8 flex flex-col sm:flex-row items-center gap-3 max-w-xl mx-auto">
            <div className="relative w-full">
              <Search className="w-4 h-4 text-gray-400 absolute left-4 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search causes, youth sports, veterans..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full pl-11 pr-4 py-3 rounded-full bg-white border border-gray-200 text-[#111827] text-xs placeholder-gray-400 focus:outline-none focus:border-[#11382B] focus:ring-1 focus:ring-[#11382B] shadow-xs transition-all"
              />
            </div>

            <div className="flex gap-2 w-full sm:w-auto shrink-0">
              <button
                onClick={() => setSelectedTag('all')}
                className={`px-5 py-3 rounded-full text-xs font-bold transition-all whitespace-nowrap ${
                  selectedTag === 'all'
                    ? 'bg-[#11382B] text-white shadow-sm'
                    : 'bg-white border border-gray-200 text-gray-700 hover:bg-gray-50'
                }`}
              >
                All Causes
              </button>
              <button
                onClick={() => setSelectedTag('featured')}
                className={`px-5 py-3 rounded-full text-xs font-bold transition-all whitespace-nowrap ${
                  selectedTag === 'featured'
                    ? 'bg-[#E25B37] text-white shadow-sm'
                    : 'bg-white border border-gray-200 text-gray-700 hover:bg-gray-50'
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
              className="bg-white rounded-3xl overflow-hidden border border-gray-200/90 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between group"
            >
              {/* Cover Image Banner */}
              <div className="relative h-52 sm:h-60 overflow-hidden">
                <img
                  src={c.cover_image_url || ''}
                  alt={c.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />

                <div className="absolute top-4 right-4 flex gap-2">
                  {c.featured && (
                    <span className="px-3.5 py-1 rounded-full bg-[#E25B37] text-white text-xs font-black shadow-md">
                      Spotlight
                    </span>
                  )}
                </div>

                <div className="absolute bottom-4 left-6 flex items-center gap-3 text-white">
                  <img
                    src={c.logo_url || ''}
                    alt={c.name}
                    className="w-12 h-12 rounded-2xl object-cover border-2 border-white shadow-lg bg-white"
                  />
                  <div>
                    <h2 className="text-xl font-bold text-white group-hover:text-[#00D284] transition-colors">
                      {c.name}
                    </h2>
                    <span className="text-xs text-orange-200 font-semibold">{c.tagline}</span>
                  </div>
                </div>
              </div>

              {/* Body */}
              <div className="p-6 sm:p-8 space-y-6 flex-1 flex flex-col justify-between">
                <p className="text-sm text-gray-600 leading-relaxed line-clamp-3">
                  {c.description}
                </p>

                {/* Raised progress */}
                <div className="p-4 rounded-2xl bg-gray-50 border border-gray-100 space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-gray-500 font-medium">Total Direct Impact Raised:</span>
                    <span className="font-mono font-black text-[#11382B] text-base">
                      ${Number(c.total_raised).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                </div>

                {/* Upcoming Events preview */}
                {c.events && c.events.length > 0 && (
                  <div className="space-y-2">
                    <span className="text-[11px] uppercase tracking-wider font-bold text-gray-400 block">
                      Next Golf Fundraiser:
                    </span>
                    <div className="flex items-center justify-between text-xs text-gray-700">
                      <span className="font-semibold flex items-center gap-1.5 truncate max-w-[200px]">
                        <Calendar className="w-3.5 h-3.5 text-[#11382B] shrink-0" /> {c.events[0].title}
                      </span>
                      <span className="text-gray-500 flex items-center gap-1 shrink-0">
                        <MapPin className="w-3.5 h-3.5 text-[#E25B37] shrink-0" /> {c.events[0].location}
                      </span>
                    </div>
                  </div>
                )}

                {/* Action CTA */}
                <div className="pt-4 border-t border-gray-100 flex items-center justify-between">
                  <Link
                    href={`/charities/${c.slug}`}
                    className="text-xs font-bold text-[#11382B] hover:underline flex items-center gap-1"
                  >
                    <span>View Profile & Events</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>

                  <Link
                    href={`/subscribe?charityId=${c.id}`}
                    className="px-5 py-2.5 rounded-full bg-[#11382B] hover:bg-[#0c281e] text-white text-xs font-bold transition-all shadow-sm"
                  >
                    Support Cause
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
