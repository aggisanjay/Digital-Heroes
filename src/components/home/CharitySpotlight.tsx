'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Heart, Calendar, MapPin, DollarSign, ArrowRight, CheckCircle2, Sparkles } from 'lucide-react';
import { INITIAL_CHARITIES, store } from '@/lib/data/mock-db';
import { Charity } from '@/lib/types';

export default function CharitySpotlight() {
  const [featuredCharity, setFeaturedCharity] = useState<Charity>(
    INITIAL_CHARITIES.find(c => c.featured) || INITIAL_CHARITIES[0]
  );
  const [donationAmount, setDonationAmount] = useState<number>(50);
  const [customAmount, setCustomAmount] = useState<string>('');
  const [donorName, setDonorName] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [donationSuccess, setDonationSuccess] = useState(false);

  const handleDonate = async (e: React.FormEvent) => {
    e.preventDefault();
    const amount = customAmount ? parseFloat(customAmount) : donationAmount;
    if (!amount || amount <= 0) return;

    setIsSubmitting(true);
    try {
      const res = await fetch('/api/donations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          charityId: featuredCharity.id,
          amount,
          donorName: donorName || 'Generous Hero',
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setDonationSuccess(true);
        // update local raised amount
        setFeaturedCharity(prev => ({
          ...prev,
          total_raised: Number(prev.total_raised) + amount,
        }));
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className="py-24 relative overflow-hidden bg-[#070A12]/80 border-t border-b border-white/5">
      {/* Background ambient lighting */}
      <div className="absolute top-1/2 left-0 w-96 h-96 bg-[#FF6E40]/8 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#FF6E40]/10 border border-[#FF6E40]/20 text-[#FF6E40] text-xs font-bold uppercase tracking-wider mb-4">
              <Heart className="w-3.5 h-3.5 fill-[#FF6E40]" /> Featured Charity Spotlight
            </div>
            <h2 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight">
              Giving Back With <span className="gradient-text-coral">Every Drive</span>.
            </h2>
          </div>
          <p className="mt-4 md:mt-0 text-sm text-[#94A3B8] max-w-md">
            10% to 50% of every member subscription directly funds grass-roots rehabilitation, youth sports, and eco-conservation.
          </p>
        </div>

        {/* Featured Charity Showcase Card */}
        <div className="glass-panel-elevated rounded-3xl overflow-hidden border border-white/10 grid grid-cols-1 lg:grid-cols-12 shadow-2xl">
          {/* Left Column: Visuals & Live Counter */}
          <div className="lg:col-span-7 relative min-h-[360px] lg:min-h-[500px] flex flex-col justify-between p-8 sm:p-12 overflow-hidden">
            {/* Background Image with Dark Vignette */}
            <div
              className="absolute inset-0 bg-cover bg-center transition-transform duration-700 hover:scale-105"
              style={{
                backgroundImage: `url(${featuredCharity.cover_image_url})`,
              }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#06080F] via-[#06080F]/70 to-[#06080F]/40" />

            {/* Top Badge */}
            <div className="relative z-10 flex items-center justify-between">
              <span className="px-3 py-1 rounded-lg bg-black/60 backdrop-blur-md border border-white/15 text-xs font-semibold text-white">
                Official Partner Organization
              </span>
              <span className="px-3 py-1 rounded-lg bg-[#FF6E40] text-black text-xs font-extrabold">
                100% Direct Passthrough
              </span>
            </div>

            {/* Bottom Content */}
            <div className="relative z-10 space-y-4">
              <div className="flex items-center gap-3">
                <img
                  src={featuredCharity.logo_url || ''}
                  alt={featuredCharity.name}
                  className="w-12 h-12 rounded-xl object-cover border-2 border-white/20 shadow-lg"
                />
                <div>
                  <h3 className="text-2xl sm:text-3xl font-extrabold text-white">
                    {featuredCharity.name}
                  </h3>
                  <p className="text-xs sm:text-sm text-[#FF6E40] font-semibold">
                    {featuredCharity.tagline}
                  </p>
                </div>
              </div>

              <p className="text-sm text-slate-300 line-clamp-3 leading-relaxed">
                {featuredCharity.description}
              </p>

              {/* Progress Toward Goal */}
              <div className="pt-2">
                <div className="flex items-center justify-between text-xs font-semibold mb-2">
                  <span className="text-[#94A3B8]">Total Funds Raised on Digital Heroes</span>
                  <span className="text-[#FF6E40] font-mono text-base font-bold">
                    ${Number(featuredCharity.total_raised).toLocaleString()}
                  </span>
                </div>
                <div className="w-full h-3 bg-white/10 rounded-full overflow-hidden p-[2px]">
                  <div
                    className="h-full bg-gradient-to-r from-[#FF6E40] to-[#FFA000] rounded-full transition-all duration-1000"
                    style={{ width: '74%' }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Events & Direct Giving Terminal */}
          <div className="lg:col-span-5 bg-[#0A0E1A]/90 p-8 sm:p-10 flex flex-col justify-between border-t lg:border-t-0 lg:border-l border-white/10">
            <div>
              <h4 className="text-white text-base font-bold uppercase tracking-wider mb-4 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-[#00F29D]" /> Upcoming Charity Tournaments
              </h4>

              <div className="space-y-3 mb-8">
                {featuredCharity.events.map(ev => (
                  <div
                    key={ev.id}
                    className="p-3.5 rounded-xl bg-white/5 border border-white/10 hover:border-[#00F29D]/30 transition-all flex items-start justify-between gap-3"
                  >
                    <div>
                      <p className="text-sm font-semibold text-white">{ev.title}</p>
                      <div className="flex items-center gap-3 text-xs text-[#94A3B8] mt-1">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3 text-[#00F29D]" /> {ev.date}
                        </span>
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3 h-3 text-[#FF6E40]" /> {ev.location}
                        </span>
                      </div>
                    </div>
                    <span className="text-xs font-mono font-bold text-[#00F29D]">
                      ${ev.goal.toLocaleString()}
                    </span>
                  </div>
                ))}
              </div>

              {/* Direct One-Off Donation Module */}
              <div className="border-t border-white/10 pt-6">
                <h4 className="text-white text-sm font-bold uppercase tracking-wider mb-3 flex items-center gap-2">
                  <Heart className="w-4 h-4 text-[#FF6E40]" /> Make a One-Off Impact Gift
                </h4>

                {donationSuccess ? (
                  <div className="p-4 rounded-xl bg-[#00F29D]/10 border border-[#00F29D]/30 text-center space-y-2">
                    <CheckCircle2 className="w-8 h-8 text-[#00F29D] mx-auto" />
                    <p className="text-sm font-bold text-white">Donation Processed!</p>
                    <p className="text-xs text-[#94A3B8]">
                      Thank you for directly backing this initiative. A receipt has been issued.
                    </p>
                    <button
                      onClick={() => setDonationSuccess(false)}
                      className="text-xs text-[#00F29D] font-semibold underline mt-1"
                    >
                      Make another contribution
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleDonate} className="space-y-4">
                    {/* Quick Amount Buttons */}
                    <div className="grid grid-cols-4 gap-2">
                      {[25, 50, 100, 250].map(amt => (
                        <button
                          key={amt}
                          type="button"
                          onClick={() => {
                            setDonationAmount(amt);
                            setCustomAmount('');
                          }}
                          className={`py-2 text-xs font-bold rounded-lg border transition-all ${
                            donationAmount === amt && !customAmount
                              ? 'bg-[#FF6E40] border-[#FF6E40] text-white shadow-lg shadow-[#FF6E40]/25'
                              : 'bg-white/5 border-white/10 text-[#94A3B8] hover:text-white'
                          }`}
                        >
                          ${amt}
                        </button>
                      ))}
                    </div>

                    <div className="flex gap-2">
                      <input
                        type="text"
                        placeholder="Your Name (or Anonymous)"
                        value={donorName}
                        onChange={e => setDonorName(e.target.value)}
                        className="w-1/2 px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#FF6E40]"
                      />
                      <input
                        type="number"
                        placeholder="Custom $"
                        value={customAmount}
                        onChange={e => {
                          setCustomAmount(e.target.value);
                          setDonationAmount(0);
                        }}
                        className="w-1/2 px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#FF6E40]"
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full py-3 rounded-xl btn-charity text-xs font-bold flex items-center justify-center gap-2"
                    >
                      {isSubmitting ? (
                        <span>Processing Gift...</span>
                      ) : (
                        <>
                          <span>Direct Donate to {featuredCharity.name.split(' ')[0]}</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </>
                      )}
                    </button>
                  </form>
                )}
              </div>
            </div>

            <div className="pt-6 border-t border-white/10 flex items-center justify-between text-xs">
              <Link
                href="/charities"
                className="text-[#94A3B8] hover:text-white flex items-center gap-1.5 transition-colors font-medium"
              >
                <span>View all 4 verified charities</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
              <span className="text-[#64748B]">Tax-Deductible</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
