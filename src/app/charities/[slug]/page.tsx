'use client';

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { Heart, Calendar, MapPin, DollarSign, ArrowLeft, CheckCircle2, Trophy, Share2 } from 'lucide-react';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { store } from '@/lib/data/mock-db';
import { Charity } from '@/lib/types';

export default function CharityProfilePage() {
  const params = useParams();
  const slug = params.slug as string;
  const [charity, setCharity] = useState<Charity | null>(null);
  const [donationAmount, setDonationAmount] = useState(50);
  const [donorName, setDonorName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [donationSuccess, setDonationSuccess] = useState(false);

  useEffect(() => {
    if (slug) {
      const found = store.getCharityBySlug(slug);
      setCharity(found);
    }
  }, [slug]);

  const handleDonate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!charity || donationAmount <= 0) return;

    setIsSubmitting(true);
    try {
      const res = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mode: 'donation',
          donationAmount,
          donorName: donorName || 'Generous Hero',
          charityId: charity.id,
          returnUrl: window.location.origin,
        }),
      });
      const data = await res.json();
      if (data.url && !data.simulated) {
        window.location.href = data.url;
        return;
      }
      store.addDonation(charity.id, donationAmount, donorName || 'Generous Hero');
      setDonationSuccess(true);
      setCharity(store.getCharityBySlug(slug));
    } catch (err) {
      console.error(err);
      store.addDonation(charity.id, donationAmount, donorName || 'Generous Hero');
      setDonationSuccess(true);
      setCharity(store.getCharityBySlug(slug));
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!charity) {
    return (
      <main className="min-h-screen flex flex-col bg-[#06080F] text-white">
        <Navbar />
        <div className="flex-1 flex items-center justify-center">
          <p className="text-sm text-[#94A3B8]">Loading charity profile...</p>
        </div>
        <Footer />
      </main>
    );
  }

  return (
    <main className="min-h-screen flex flex-col bg-[#06080F] text-[#F8FAFC]">
      <Navbar />

      {/* Hero Cover Banner */}
      <div className="relative h-96 w-full overflow-hidden mt-16">
        <img
          src={charity.cover_image_url || ''}
          alt={charity.name}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#06080F] via-[#06080F]/60 to-transparent" />

        <div className="absolute bottom-8 left-0 right-0 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Link
            href="/charities"
            className="inline-flex items-center gap-1.5 text-xs text-[#94A3B8] hover:text-white mb-4"
          >
            <ArrowLeft className="w-4 h-4" /> Back to All Charities
          </Link>

          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div className="flex items-center gap-4">
              <img
                src={charity.logo_url || ''}
                alt={charity.name}
                className="w-20 h-20 rounded-2xl object-cover border-4 border-[#06080F] shadow-2xl"
              />
              <div>
                <h1 className="text-3xl sm:text-4xl font-extrabold text-white">{charity.name}</h1>
                <p className="text-sm text-[#FF6E40] font-semibold">{charity.tagline}</p>
              </div>
            </div>

            <Link
              href={`/subscribe?charityId=${charity.id}`}
              className="px-6 py-3 rounded-xl btn-primary text-xs font-bold"
            >
              Select As My Ongoing Charity
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 flex-1 w-full">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          {/* Main Content & Events */}
          <div className="lg:col-span-2 space-y-10">
            <div className="glass-panel-elevated rounded-3xl p-8 border border-white/10 space-y-4">
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <Heart className="w-5 h-5 text-[#FF6E40]" /> About The Mission
              </h2>
              <p className="text-sm text-[#94A3B8] leading-relaxed whitespace-pre-line">
                {charity.description}
              </p>
            </div>

            {/* Upcoming Charity Golf Events */}
            <div className="glass-panel-elevated rounded-3xl p-8 border border-white/10 space-y-6">
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <Calendar className="w-5 h-5 text-[#00F29D]" /> Upcoming Charity Golf Days & Tournaments
              </h2>

              {charity.events && charity.events.length > 0 ? (
                <div className="space-y-4">
                  {charity.events.map(ev => (
                    <div
                      key={ev.id}
                      className="p-5 rounded-2xl bg-white/5 border border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                    >
                      <div>
                        <h3 className="text-base font-bold text-white">{ev.title}</h3>
                        <div className="flex items-center gap-4 text-xs text-[#94A3B8] mt-1">
                          <span className="flex items-center gap-1.5">
                            <Calendar className="w-4 h-4 text-[#00F29D]" /> {ev.date}
                          </span>
                          <span className="flex items-center gap-1.5">
                            <MapPin className="w-4 h-4 text-[#FF6E40]" /> {ev.location}
                          </span>
                        </div>
                      </div>

                      <div className="text-right">
                        <span className="text-xs text-[#64748B] block">Fundraising Goal</span>
                        <span className="text-lg font-mono font-bold text-[#00F29D]">
                          ${ev.goal.toLocaleString()}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-[#64748B]">No upcoming events scheduled at this moment.</p>
              )}
            </div>
          </div>

          {/* Sidebar: Direct Impact Donation Terminal */}
          <div className="lg:col-span-1 space-y-6">
            <div className="glass-panel-elevated rounded-3xl p-6 sm:p-8 border border-white/10 space-y-6">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-[#FF6E40] block mb-1">
                  Direct One-Off Donation
                </span>
                <h3 className="text-lg font-bold text-white">Support {charity.name.split(' ')[0]}</h3>
                <p className="text-xs text-[#94A3B8] mt-1">
                  100% tax-deductible gift processed securely via Stripe.
                </p>
              </div>

              {donationSuccess ? (
                <div className="p-4 rounded-xl bg-[#00F29D]/10 border border-[#00F29D]/30 text-center space-y-2">
                  <CheckCircle2 className="w-8 h-8 text-[#00F29D] mx-auto" />
                  <p className="text-sm font-bold text-white">Thank You for Giving!</p>
                  <p className="text-xs text-[#94A3B8]">
                    Your one-off gift of ${donationAmount} has been directly added to {charity.name}&apos;s impact tally.
                  </p>
                  <button
                    onClick={() => setDonationSuccess(false)}
                    className="text-xs text-[#00F29D] underline font-bold mt-2"
                  >
                    Donate again
                  </button>
                </div>
              ) : (
                <form onSubmit={handleDonate} className="space-y-4">
                  <div className="grid grid-cols-3 gap-2">
                    {[25, 50, 100].map(amt => (
                      <button
                        key={amt}
                        type="button"
                        onClick={() => setDonationAmount(amt)}
                        className={`py-2 text-xs font-bold rounded-lg border transition-all ${
                          donationAmount === amt
                            ? 'bg-[#FF6E40] border-[#FF6E40] text-white'
                            : 'bg-white/5 border-white/10 text-[#94A3B8]'
                        }`}
                      >
                        ${amt}
                      </button>
                    ))}
                  </div>

                  <div>
                    <label className="block text-xs text-[#94A3B8] mb-1">Donor Name (or Anonymous)</label>
                    <input
                      type="text"
                      placeholder="Your Full Name"
                      value={donorName}
                      onChange={e => setDonorName(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-xs text-white"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full py-3 rounded-xl btn-charity text-xs font-bold"
                  >
                    {isSubmitting ? 'Processing Donation...' : `Donate $${donationAmount} Direct`}
                  </button>
                </form>
              )}

              <div className="pt-4 border-t border-white/10 space-y-2 text-xs">
                <div className="flex justify-between text-[#94A3B8]">
                  <span>Total Raised to Date:</span>
                  <span className="font-mono font-bold text-white">
                    ${Number(charity.total_raised).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </main>
  );
}
