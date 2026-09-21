'use client';

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { Heart, Calendar, MapPin, ArrowLeft, CheckCircle2 } from 'lucide-react';
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
      <main className="min-h-screen flex flex-col bg-[#FAFAF8] text-[#111827]">
        <Navbar />
        <div className="flex-1 flex items-center justify-center">
          <p className="text-sm text-gray-500">Loading charity profile...</p>
        </div>
        <Footer />
      </main>
    );
  }

  return (
    <main className="min-h-screen flex flex-col bg-[#FAFAF8] text-[#111827]">
      <Navbar />

      {/* Hero Cover Banner */}
      <div className="relative h-96 w-full overflow-hidden mt-16">
        <img
          src={charity.cover_image_url || ''}
          alt={charity.name}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/40 to-black/10" />

        <div className="absolute bottom-8 left-0 right-0 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Link
            href="/charities"
            className="inline-flex items-center gap-1.5 text-xs text-gray-200 hover:text-white mb-4 bg-black/40 backdrop-blur-xs px-3 py-1.5 rounded-full"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Back to All Charities
          </Link>

          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div className="flex items-center gap-4 text-white">
              <img
                src={charity.logo_url || ''}
                alt={charity.name}
                className="w-20 h-20 rounded-2xl object-cover border-4 border-white shadow-2xl bg-white"
              />
              <div>
                <h1 className="text-3xl sm:text-4xl font-extrabold text-white">{charity.name}</h1>
                <p className="text-sm text-orange-200 font-semibold">{charity.tagline}</p>
              </div>
            </div>

            <Link
              href={`/subscribe?charityId=${charity.id}`}
              className="px-6 py-3 rounded-full bg-[#11382B] hover:bg-[#0c281e] text-white text-xs font-bold shadow-lg transition-all"
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
            <div className="bg-white rounded-3xl p-8 border border-gray-200/80 shadow-sm space-y-4">
              <h2 className="text-xl font-bold text-[#111827] flex items-center gap-2">
                <Heart className="w-5 h-5 text-[#E25B37]" /> About The Mission
              </h2>
              <p className="text-sm text-gray-600 leading-relaxed whitespace-pre-line">
                {charity.description}
              </p>
            </div>

            {/* Upcoming Charity Golf Events */}
            <div className="bg-white rounded-3xl p-8 border border-gray-200/80 shadow-sm space-y-6">
              <h2 className="text-xl font-bold text-[#111827] flex items-center gap-2">
                <Calendar className="w-5 h-5 text-[#11382B]" /> Upcoming Charity Golf Days & Tournaments
              </h2>

              {charity.events && charity.events.length > 0 ? (
                <div className="space-y-4">
                  {charity.events.map(ev => (
                    <div
                      key={ev.id}
                      className="p-5 rounded-2xl bg-gray-50 border border-gray-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                    >
                      <div>
                        <h3 className="text-base font-bold text-[#111827]">{ev.title}</h3>
                        <div className="flex items-center gap-4 text-xs text-gray-500 mt-1">
                          <span className="flex items-center gap-1.5">
                            <Calendar className="w-4 h-4 text-[#11382B]" /> {ev.date}
                          </span>
                          <span className="flex items-center gap-1.5">
                            <MapPin className="w-4 h-4 text-[#E25B37]" /> {ev.location}
                          </span>
                        </div>
                      </div>

                      <div className="text-left sm:text-right">
                        <span className="text-xs text-gray-500 block">Fundraising Goal</span>
                        <span className="text-lg font-mono font-bold text-[#11382B]">
                          ${ev.goal.toLocaleString()}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-gray-400">No upcoming events scheduled at this moment.</p>
              )}
            </div>
          </div>

          {/* Sidebar: Direct Impact Donation Terminal */}
          <div className="lg:col-span-1 space-y-6">
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-200/90 shadow-xl shadow-black/5 space-y-6">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-[#E25B37] block mb-1">
                  Direct One-Off Donation
                </span>
                <h3 className="text-lg font-bold text-[#111827]">Support {charity.name.split(' ')[0]}</h3>
                <p className="text-xs text-gray-500 mt-1">
                  100% tax-deductible gift processed securely via Stripe.
                </p>
              </div>

              {donationSuccess ? (
                <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-center space-y-2">
                  <CheckCircle2 className="w-8 h-8 text-emerald-600 mx-auto" />
                  <p className="text-sm font-bold text-[#11382B]">Thank You for Giving!</p>
                  <p className="text-xs text-gray-600">
                    Your one-off gift of ${donationAmount} has been directly added to {charity.name}&apos;s impact tally.
                  </p>
                  <button
                    onClick={() => setDonationSuccess(false)}
                    className="text-xs text-[#11382B] underline font-bold mt-2"
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
                        className={`py-2 text-xs font-bold rounded-xl border transition-all ${
                          donationAmount === amt
                            ? 'bg-[#E25B37] border-[#E25B37] text-white shadow-xs'
                            : 'bg-gray-50 border-gray-200 text-gray-700 hover:bg-gray-100'
                        }`}
                      >
                        ${amt}
                      </button>
                    ))}
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">Donor Name (or Anonymous)</label>
                    <input
                      type="text"
                      placeholder="Your Full Name"
                      value={donorName}
                      onChange={e => setDonorName(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-gray-50 border border-gray-200 text-xs text-[#111827] focus:outline-none focus:bg-white focus:border-[#11382B]"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full py-3.5 rounded-full bg-[#E25B37] hover:bg-[#c94b28] text-white text-xs font-bold shadow-md transition-all active:scale-[0.99]"
                  >
                    {isSubmitting ? 'Processing Donation...' : `Donate $${donationAmount} Direct`}
                  </button>
                </form>
              )}

              <div className="pt-4 border-t border-gray-100 space-y-2 text-xs">
                <div className="flex justify-between text-gray-500">
                  <span>Total Raised to Date:</span>
                  <span className="font-mono font-bold text-[#11382B]">
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
