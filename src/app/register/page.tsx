'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Mail, Lock, User, Heart, ArrowRight, AlertCircle, ShieldCheck } from 'lucide-react';
import { store } from '@/lib/data/mock-db';

export default function RegisterPage() {
  const router = useRouter();
  const charities = store.getCharities();

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [selectedCharityId, setSelectedCharityId] = useState(charities[0]?.id || '');
  const [plan, setPlan] = useState<'monthly' | 'yearly'>('monthly');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName || !email || !password) {
      setError('Please fill in all fields.');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          password,
          fullName,
          charityId: selectedCharityId,
          plan,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Registration failed.');
      }

      const user = data.user;
      if (user) {
        store.setProfile(user);
        store.setCurrentUser(user.id);
        if (typeof window !== 'undefined') {
          localStorage.setItem('dh_user_email', user.email);
          localStorage.setItem('dh_current_user_id', user.id);
        }
      }

      router.refresh();
      router.push(data.destination || `/subscribe?charityId=${encodeURIComponent(selectedCharityId)}&plan=${plan}`);

    } catch (err: any) {
      setError(err.message || 'Registration failed. Please try again.');
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FAFAF8] text-[#111827] flex flex-col justify-between relative overflow-hidden pt-20 pb-12 px-4 sm:px-6 lg:px-8">
      {/* Background ambient lighting effects */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[500px] bg-gradient-to-tr from-[#11382B]/5 via-emerald-100/40 to-[#E25B37]/5 blur-[120px] pointer-events-none rounded-full" />
      <div className="absolute bottom-10 right-10 w-[400px] h-[400px] bg-[#00D284]/5 blur-[100px] pointer-events-none rounded-full" />

      <div className="max-w-xl mx-auto w-full relative z-10 my-auto">
        {/* Header Branding */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-3 group mb-4">
            <div className="w-12 h-12 rounded-2xl bg-white border border-gray-200/80 p-1.5 shadow-sm group-hover:scale-105 transition-transform duration-300">
              <img
                src="/logo-icon.png"
                alt="Digital Heroes Mascot"
                className="w-full h-full object-contain"
              />
            </div>
            <div className="flex flex-col text-left">
              <span className="font-extrabold text-2xl tracking-tight text-[#11382B] flex items-center gap-1">
                DIGITAL<span className="text-[#00D284]">HEROES</span>
              </span>
              <span className="text-[11px] tracking-widest text-gray-500 font-semibold uppercase -mt-1">
                Create Member Account
              </span>
            </div>
          </Link>
          <h1 className="text-3xl sm:text-4xl font-black text-[#111827] tracking-tight">Join Digital Heroes</h1>
          <p className="text-sm text-gray-600 mt-2 max-w-md mx-auto">
            Track your golf scores, enter the monthly cash draws, and power grassroots charity programs.
          </p>
        </div>

        {/* Member Registration Card */}
        <div className="bg-white border border-gray-200/90 rounded-3xl p-6 sm:p-10 shadow-xl shadow-black/5">
          {error && (
            <div className="mb-5 p-3.5 rounded-2xl bg-red-50 border border-red-200 flex items-center gap-3 text-xs text-red-600">
              <AlertCircle className="w-4 h-4 shrink-0 text-red-500" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
                Full Name
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                  <User className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="e.g. Jordan Spieth"
                  className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl text-sm text-[#111827] placeholder-gray-400 focus:outline-none focus:bg-white focus:border-[#11382B] focus:ring-1 focus:ring-[#11382B] transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
                Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="jordan@example.com"
                  className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl text-sm text-[#111827] placeholder-gray-400 focus:outline-none focus:bg-white focus:border-[#11382B] focus:ring-1 focus:ring-[#11382B] transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Create a strong password (6+ chars)"
                  className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl text-sm text-[#111827] placeholder-gray-400 focus:outline-none focus:bg-white focus:border-[#11382B] focus:ring-1 focus:ring-[#11382B] transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
                Designated Charity (Min 10% Contribution)
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#E25B37]">
                  <Heart className="w-4 h-4" />
                </div>
                <select
                  value={selectedCharityId}
                  onChange={(e) => setSelectedCharityId(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl text-sm text-[#111827] focus:outline-none focus:bg-white focus:border-[#11382B] focus:ring-1 focus:ring-[#11382B] transition-all"
                >
                  {charities.map((c) => (
                    <option key={c.id} value={c.id} className="text-[#111827]">
                      {c.name} {c.tagline ? `(${c.tagline})` : ''}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
                Subscription Plan
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setPlan('monthly')}
                  className={`p-4 rounded-2xl border text-left transition-all ${
                    plan === 'monthly'
                      ? 'border-[#11382B] bg-[#11382B]/5 ring-1 ring-[#11382B]'
                      : 'border-gray-200 bg-gray-50 hover:bg-white'
                  }`}
                >
                  <p className="text-xs font-bold text-gray-800">Monthly</p>
                  <p className="text-base font-black text-[#11382B] mt-0.5">$10 <span className="text-[11px] text-gray-500 font-normal">/mo</span></p>
                </button>
                <button
                  type="button"
                  onClick={() => setPlan('yearly')}
                  className={`p-4 rounded-2xl border text-left transition-all ${
                    plan === 'yearly'
                      ? 'border-[#11382B] bg-[#11382B]/5 ring-1 ring-[#11382B]'
                      : 'border-gray-200 bg-gray-50 hover:bg-white'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-bold text-gray-800">Annual</p>
                    <span className="text-[9px] px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold">17% OFF</span>
                  </div>
                  <p className="text-base font-black text-[#11382B] mt-0.5">$100 <span className="text-[11px] text-gray-500 font-normal">/yr</span></p>
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3.5 px-6 rounded-full bg-[#11382B] hover:bg-[#0c281e] text-white font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-[#11382B]/10 transition-all disabled:opacity-50 mt-4 active:scale-[0.99]"
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <span>Create Account & Subscribe</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          <div className="mt-6 pt-5 border-t border-gray-100 text-center">
            <p className="text-xs text-gray-600">
              Already registered?{' '}
              <Link href="/login" className="text-[#11382B] font-bold hover:underline">
                Sign in to your account
              </Link>
            </p>
          </div>
        </div>
      </div>

      {/* Footer Minimal Info */}
      <div className="max-w-4xl mx-auto w-full text-center text-xs text-gray-400 mt-8">
        Digital Heroes &copy; 2026 • Performance Golf Scoring & Charity Draws
      </div>
    </div>
  );
}
