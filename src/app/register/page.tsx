'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Sparkles, Mail, Lock, User, Heart, ArrowRight, ShieldCheck, CheckCircle2, AlertCircle } from 'lucide-react';
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

      // If user already exists and has an active subscription, log them straight into dashboard!
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
    <div className="min-h-screen bg-[#06080F] text-white flex flex-col justify-between relative overflow-hidden pt-24 pb-12 px-4 sm:px-6 lg:px-8">
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] bg-gradient-to-tr from-[#00F29D]/10 via-[#00D2FF]/10 to-[#FF6E40]/10 blur-[130px] pointer-events-none rounded-full" />

      <div className="max-w-xl mx-auto w-full relative z-10 my-auto">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-3 group mb-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-[#00F29D] via-[#00D2FF] to-[#FF6E40] p-[2px] shadow-lg shadow-[#00F29D]/20 group-hover:scale-105 transition-transform duration-300">
              <div className="w-full h-full bg-[#06080F] rounded-[10px] flex items-center justify-center">
                <Sparkles className="w-6 h-6 text-[#00F29D]" />
              </div>
            </div>
            <div className="flex flex-col text-left">
              <span className="font-black text-2xl tracking-tight text-white flex items-center gap-1.5">
                DIGITAL<span className="text-[#00F29D]">HEROES</span>
              </span>
              <span className="text-[11px] tracking-widest text-[#94A3B8] font-semibold uppercase -mt-1">
                Create Member Account
              </span>
            </div>
          </Link>
          <h1 className="text-3xl font-black text-white">Join Digital Heroes</h1>
          <p className="text-sm text-[#94A3B8] mt-2">
            Track your golf scores, enter the monthly cash draws, and power grassroots charity programs.
          </p>
        </div>

        <div className="bg-[#0D1322]/90 backdrop-blur-xl border border-white/10 rounded-2xl p-6 sm:p-8 shadow-2xl">
          {error && (
            <div className="mb-5 p-3 rounded-xl bg-red-500/10 border border-red-500/30 flex items-center gap-3 text-xs text-red-400">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-[#94A3B8] uppercase tracking-wider mb-2">
                Full Name
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#64748B]">
                  <User className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="e.g. Jordan Spieth"
                  className="w-full pl-10 pr-4 py-3 bg-[#06080F] border border-white/15 rounded-xl text-sm text-white placeholder-[#64748B] focus:outline-none focus:border-[#00F29D] focus:ring-1 focus:ring-[#00F29D]"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#94A3B8] uppercase tracking-wider mb-2">
                Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#64748B]">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="jordan@example.com"
                  className="w-full pl-10 pr-4 py-3 bg-[#06080F] border border-white/15 rounded-xl text-sm text-white placeholder-[#64748B] focus:outline-none focus:border-[#00F29D] focus:ring-1 focus:ring-[#00F29D]"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#94A3B8] uppercase tracking-wider mb-2">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#64748B]">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Create a strong password"
                  className="w-full pl-10 pr-4 py-3 bg-[#06080F] border border-white/15 rounded-xl text-sm text-white placeholder-[#64748B] focus:outline-none focus:border-[#00F29D] focus:ring-1 focus:ring-[#00F29D]"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#94A3B8] uppercase tracking-wider mb-2">
                Designated Charity (Min 10% Contribution)
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#64748B]">
                  <Heart className="w-4 h-4 text-[#FF6E40]" />
                </div>
                <select
                  value={selectedCharityId}
                  onChange={(e) => setSelectedCharityId(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-[#06080F] border border-white/15 rounded-xl text-sm text-white focus:outline-none focus:border-[#00F29D]"
                >
                  {charities.map((c) => (
                    <option key={c.id} value={c.id} className="bg-[#0D1322]">
                      {c.name} {c.tagline ? `(${c.tagline})` : ''}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#94A3B8] uppercase tracking-wider mb-2">
                Subscription Plan
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setPlan('monthly')}
                  className={`p-3 rounded-xl border text-left transition-all ${
                    plan === 'monthly'
                      ? 'border-[#00F29D] bg-[#00F29D]/10 text-white'
                      : 'border-white/10 bg-white/5 text-[#94A3B8]'
                  }`}
                >
                  <p className="text-xs font-bold text-white">Monthly</p>
                  <p className="text-sm font-black text-[#00F29D] mt-0.5">$10 <span className="text-[10px] text-[#94A3B8] font-normal">/mo</span></p>
                </button>
                <button
                  type="button"
                  onClick={() => setPlan('yearly')}
                  className={`p-3 rounded-xl border text-left transition-all ${
                    plan === 'yearly'
                      ? 'border-[#00F29D] bg-[#00F29D]/10 text-white'
                      : 'border-white/10 bg-white/5 text-[#94A3B8]'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-bold text-white">Annual</p>
                    <span className="text-[9px] px-1.5 py-0.5 rounded bg-[#00F29D]/20 text-[#00F29D] font-bold">17% OFF</span>
                  </div>
                  <p className="text-sm font-black text-[#00F29D] mt-0.5">$100 <span className="text-[10px] text-[#94A3B8] font-normal">/yr</span></p>
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-[#00F29D] to-[#00D2FF] hover:opacity-95 text-[#06080F] font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-[#00F29D]/20 transition-all disabled:opacity-50 mt-4 active:scale-[0.99]"
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-[#06080F] border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <span>Create Account & Subscribe</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          <div className="mt-6 pt-5 border-t border-white/10 text-center">
            <p className="text-xs text-[#94A3B8]">
              Already registered?{' '}
              <Link href="/login" className="text-[#00F29D] font-bold hover:underline">
                Sign in to your account
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
