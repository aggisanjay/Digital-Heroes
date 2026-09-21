'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Check, Heart, Trophy, ShieldCheck, Sparkles, ArrowRight, Lock, CreditCard, ExternalLink, RefreshCw } from 'lucide-react';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import StripeCardPaymentForm from '@/components/payment/StripeCardPaymentForm';
import { store } from '@/lib/data/mock-db';
import { Charity, Profile } from '@/lib/types';

function SubscribeContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialPlan = searchParams.get('plan') === 'monthly' ? 'monthly' : 'yearly';
  const preselectedCharityId = searchParams.get('charityId');

  const [planType, setPlanType] = useState<'monthly' | 'yearly'>(initialPlan);
  const [currentUser, setCurrentUser] = useState<Profile | null>(null);
  const [charities, setCharities] = useState<Charity[]>([]);
  const [selectedCharityId, setSelectedCharityId] = useState<string>('');
  const [charityPct, setCharityPct] = useState<number>(15);
  const [fullName, setFullName] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [paymentMode, setPaymentMode] = useState<'card' | 'hosted'>('card');
  const [isRedirecting, setIsRedirecting] = useState<boolean>(false);

  useEffect(() => {
    const list = store.getCharities();
    setCharities(list);
    const current = store.getCurrentUser();
    setCurrentUser(current);
    if (current) {
      if (current.full_name) setFullName(current.full_name);
      if (current.email) setEmail(current.email);
      if (current.charity_contribution_pct) setCharityPct(current.charity_contribution_pct);
    } else {
      setFullName('');
      setEmail('');
    }
    if (preselectedCharityId) {
      setSelectedCharityId(preselectedCharityId);
    } else if (current?.charity_id) {
      setSelectedCharityId(current.charity_id);
    } else if (list.length > 0) {
      setSelectedCharityId(list[0].id);
    }
  }, [preselectedCharityId]);

  const handleHostedCheckout = async () => {
    setIsRedirecting(true);
    try {
      const targetUserId = currentUser?.id;

      const res = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          planType,
          charityId: selectedCharityId,
          charityContributionPct: charityPct,
          userId: targetUserId,
          email,
          returnUrl: window.location.origin,
        }),
      });

      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        alert(data.error || 'Unable to connect to Stripe payment gateway.');
      }
    } catch (err: any) {
      console.error(err);
      alert(err.message || 'Unable to connect to Stripe.');
    } finally {
      setIsRedirecting(false);
    }
  };

  const selectedCharity = charities.find(c => c.id === selectedCharityId);

  return (
    <div className="space-y-6">
      {/* Auth Barrier: Visitor is not signed in */}
      {!currentUser && (
        <div className="glass-panel-elevated rounded-3xl p-8 sm:p-12 border border-[#FF6E40]/30 bg-[#FF6E40]/5 text-center space-y-6 max-w-2xl mx-auto my-6 animate-in fade-in zoom-in-95 duration-200">
          <div className="w-16 h-16 rounded-2xl bg-[#FF6E40]/20 text-[#FF6E40] mx-auto flex items-center justify-center shadow-lg shadow-[#FF6E40]/10">
            <Lock className="w-8 h-8" />
          </div>
          <div>
            <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              Sign In or Create Account to Subscribe
            </h2>
            <p className="text-sm text-[#94A3B8] mt-3 max-w-md mx-auto leading-relaxed">
              Every subscription, golf round, and charity allocation in Digital Heroes is tied to an authenticated account. Please register or sign in before making payment.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <Link
              href="/register?redirect=/subscribe"
              className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-gradient-to-r from-[#00F29D] to-[#00D2FF] text-[#06080F] font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 hover:opacity-95 shadow-lg shadow-[#00F29D]/20 transition-all"
            >
              <span>Create New Member Account</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href="/login?redirect=/subscribe"
              className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-white/10 hover:bg-white/15 text-white font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all border border-white/10"
            >
              <Lock className="w-4 h-4 text-[#00D2FF]" />
              <span>Sign In with Existing Account</span>
            </Link>
          </div>
        </div>
      )}

      {/* Active Membership Guard Banner: Already Subscribed */}
      {currentUser?.subscription_status === 'active' && (
        <div className="p-6 rounded-3xl bg-[#00F29D]/10 border border-[#00F29D]/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5 animate-in fade-in duration-200 max-w-3xl mx-auto my-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-[#00F29D]/20 text-[#00F29D] flex items-center justify-center shrink-0">
              <Check className="w-6 h-6" />
            </div>
            <div>
              <p className="font-extrabold text-white text-base">Active Membership Confirmed</p>
              <p className="text-xs text-[#94A3B8] mt-1">
                You are signed in as <span className="text-[#00F29D] font-bold">{currentUser.full_name || currentUser.email}</span> with an active subscription. Duplicate payment is blocked.
              </p>
            </div>
          </div>
          <Link
            href="/dashboard"
            className="px-5 py-3 rounded-xl bg-[#00F29D] hover:opacity-90 text-[#06080F] font-black text-xs uppercase tracking-wider flex items-center gap-1.5 shrink-0 transition-opacity"
          >
            <span>Go to Dashboard</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      )}

      {/* Authenticated Inactive User: Proceed with Plan Selection & Payment */}
      {currentUser && currentUser.subscription_status !== 'active' && (
        <div className="space-y-6">
          {/* Member Banner */}
          <div className="p-4 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-[#00F29D]/20 text-[#00F29D] flex items-center justify-center font-bold text-xs">
                {currentUser.full_name ? currentUser.full_name.charAt(0).toUpperCase() : 'U'}
              </div>
              <div>
                <p className="text-xs font-bold text-white">Subscribing as: {currentUser.full_name}</p>
                <p className="text-[11px] text-[#94A3B8]">{currentUser.email}</p>
              </div>
            </div>
            <span className="px-2.5 py-1 rounded-full bg-yellow-400/10 border border-yellow-400/30 text-yellow-400 text-[10px] font-bold uppercase tracking-wider">
              Pending Payment
            </span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Left Column: Onboarding Configuration */}
            <div className="lg:col-span-7 space-y-6">
              {/* Step 1: Pick Plan */}
              <div className="glass-panel-elevated rounded-3xl p-6 border border-white/10 space-y-4">
                <h2 className="text-sm font-bold uppercase tracking-wider text-white flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-[#00F29D] text-black text-xs font-extrabold flex items-center justify-center">
                    1
                  </span>
                  Select Membership Tier
                </h2>


            <div className="grid grid-cols-2 gap-4">
              {/* Yearly Card */}
              <div
                onClick={() => setPlanType('yearly')}
                className={`p-4 rounded-2xl border cursor-pointer transition-all relative ${
                  planType === 'yearly'
                    ? 'bg-[#00F29D]/10 border-[#00F29D] shadow-lg shadow-[#00F29D]/10'
                    : 'bg-white/5 border-white/10 hover:border-white/20'
                }`}
              >
                <span className="absolute -top-2.5 right-3 px-2 py-0.5 rounded-full bg-[#FF6E40] text-white text-[9px] font-black uppercase tracking-wider">
                  Save 17%
                </span>
                <p className="font-bold text-sm text-white">Annual Champion</p>
                <p className="text-2xl font-black font-mono text-white mt-1">$190</p>
                <p className="text-[11px] text-[#00F29D] font-medium mt-0.5">($15.83/mo • 2 mos free)</p>
              </div>

              {/* Monthly Card */}
              <div
                onClick={() => setPlanType('monthly')}
                className={`p-4 rounded-2xl border cursor-pointer transition-all ${
                  planType === 'monthly'
                    ? 'bg-[#00F29D]/10 border-[#00F29D] shadow-lg shadow-[#00F29D]/10'
                    : 'bg-white/5 border-white/10 hover:border-white/20'
                }`}
              >
                <p className="font-bold text-sm text-white">Monthly Flex</p>
                <p className="text-2xl font-black font-mono text-white mt-1">$19</p>
                <p className="text-[11px] text-[#94A3B8] font-medium mt-0.5">Billed monthly</p>
              </div>
            </div>
          </div>

          {/* Step 2: Pick Partner Charity */}
          <div className="glass-panel-elevated rounded-3xl p-6 border border-white/10 space-y-4">
            <h2 className="text-sm font-bold uppercase tracking-wider text-white flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-[#FF6E40] text-white text-xs font-extrabold flex items-center justify-center">
                2
              </span>
              Designate Your Partner Charity
            </h2>

            <div className="space-y-2.5">
              {charities.map(c => (
                <div
                  key={c.id}
                  onClick={() => setSelectedCharityId(c.id)}
                  className={`p-3.5 rounded-2xl border cursor-pointer flex items-center justify-between transition-all ${
                    selectedCharityId === c.id
                      ? 'bg-[#FF6E40]/10 border-[#FF6E40] shadow-md shadow-[#FF6E40]/10'
                      : 'bg-white/5 border-white/10 hover:border-white/20'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <img src={c.logo_url || ''} alt={c.name} className="w-9 h-9 rounded-xl object-cover" />
                    <div>
                      <p className="text-xs font-bold text-white">{c.name}</p>
                      <p className="text-[10px] text-[#FF6E40]">{c.tagline}</p>
                    </div>
                  </div>
                  {selectedCharityId === c.id && (
                    <span className="w-5 h-5 rounded-full bg-[#FF6E40] text-white flex items-center justify-center text-xs">
                      ✓
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Step 3: Choose Charity Contribution % */}
          <div className="glass-panel-elevated rounded-3xl p-6 border border-white/10 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-bold uppercase tracking-wider text-white flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-[#00D2FF] text-black text-xs font-extrabold flex items-center justify-center">
                  3
                </span>
                Charity Pledge Split
              </h2>
              <span className="font-mono font-black text-xl text-[#00D2FF]">{charityPct}%</span>
            </div>

            <p className="text-xs text-[#94A3B8]">
              Digital Heroes requires a minimum 10% pledge toward your chosen charity. You can choose up to 50%.
            </p>

            <input
              type="range"
              min="10"
              max="50"
              step="5"
              value={charityPct}
              onChange={e => setCharityPct(Number(e.target.value))}
              className="w-full h-2 bg-white/10 rounded-lg appearance-none cursor-pointer accent-[#00D2FF]"
            />

            <div className="flex justify-between text-[11px] font-mono text-[#64748B]">
              <span>10% (Platform Min)</span>
              <span>25%</span>
              <span>50% (Max Purpose)</span>
            </div>
          </div>

          {/* Step 4: Account Information */}
          <div className="glass-panel-elevated rounded-3xl p-6 border border-white/10 space-y-4">
            <h2 className="text-sm font-bold uppercase tracking-wider text-white flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-white/20 text-white text-xs font-extrabold flex items-center justify-center">
                4
              </span>
              Account Information
            </h2>

            <div className="space-y-3">
              <div>
                <label className="block text-xs text-[#94A3B8] mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Alex Morgan"
                  value={fullName}
                  onChange={e => setFullName(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-xs focus:outline-none focus:border-[#00F29D]"
                />
              </div>
              <div>
                <label className="block text-xs text-[#94A3B8] mb-1">Email Address</label>
                <input
                  type="email"
                  required
                  placeholder="alex@example.com"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-xs focus:outline-none focus:border-[#00F29D]"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Payment Flow */}
        <div className="lg:col-span-5 space-y-6">
          {/* Payment Method Toggle */}
          <div className="flex gap-2 p-1 rounded-2xl bg-white/5 border border-white/10">
            <button
              type="button"
              onClick={() => setPaymentMode('card')}
              className={`flex-1 py-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
                paymentMode === 'card'
                  ? 'bg-[#00F29D] text-[#06080F] shadow-lg shadow-[#00F29D]/20'
                  : 'text-[#94A3B8] hover:text-white'
              }`}
            >
              <CreditCard className="w-3.5 h-3.5" />
              <span>Pay with Card (Elements)</span>
            </button>
            <button
              type="button"
              onClick={() => setPaymentMode('hosted')}
              className={`flex-1 py-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
                paymentMode === 'hosted'
                  ? 'bg-[#00F29D] text-[#06080F] shadow-lg shadow-[#00F29D]/20'
                  : 'text-[#94A3B8] hover:text-white'
              }`}
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span>Stripe Hosted Checkout</span>
            </button>
          </div>

          {paymentMode === 'card' ? (
            /* Embedded Stripe Elements Form */
            <StripeCardPaymentForm
              planType={planType}
              charityId={selectedCharityId}
              charityName={selectedCharity?.name}
              charityContributionPct={charityPct}
              fullName={fullName}
              email={email}
              userId={currentUser?.id}
            />
          ) : (
            /* Hosted Checkout Summary */
            <div className="glass-panel-elevated rounded-3xl p-6 sm:p-8 border border-white/10 space-y-6">
              <h2 className="text-lg font-bold text-white">Hosted Checkout Summary</h2>

              <div className="space-y-3 text-xs divide-y divide-white/5">
                <div className="flex justify-between pt-2">
                  <span className="text-[#94A3B8]">Selected Plan:</span>
                  <span className="font-bold text-white">
                    {planType === 'yearly' ? 'Annual Champion ($190/yr)' : 'Monthly Flex ($19/mo)'}
                  </span>
                </div>
                <div className="flex justify-between pt-2">
                  <span className="text-[#94A3B8]">Charity Partner:</span>
                  <span className="font-bold text-[#FF6E40] truncate max-w-[180px]">
                    {selectedCharity?.name}
                  </span>
                </div>
                <div className="flex justify-between pt-2">
                  <span className="text-[#94A3B8]">Charity Allocation:</span>
                  <span className="font-mono font-bold text-white">{charityPct}%</span>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-white/5 border border-white/5 flex items-center justify-between">
                <span className="text-xs font-bold text-[#94A3B8]">Total Due Today:</span>
                <span className="text-3xl font-black font-mono text-white">
                  {planType === 'yearly' ? '$190.00' : '$19.00'}
                </span>
              </div>

              <button
                type="button"
                onClick={handleHostedCheckout}
                disabled={isRedirecting}
                className="w-full py-4 rounded-xl btn-primary text-xs font-extrabold uppercase tracking-wider flex items-center justify-center gap-2"
              >
                {isRedirecting ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Connecting to Stripe Secure Checkout...</span>
                  </>
                ) : (
                  <>
                    <span>Proceed to Stripe Checkout</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>

              <div className="flex items-center justify-center gap-2 text-[11px] text-[#64748B]">
                <ShieldCheck className="w-3.5 h-3.5 text-[#00F29D]" />
                <span>Secure SSL Checkout via Stripe</span>
              </div>
            </div>
          )}
          </div>
        </div>
      </div>
    )}
  </div>
);

}

export default function SubscribePage() {
  return (
    <main className="min-h-screen flex flex-col bg-[#06080F] text-[#F8FAFC]">
      <Navbar />

      <div className="pt-32 pb-24 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 w-full flex-1">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#00F29D]/10 border border-[#00F29D]/30 text-[#00F29D] text-xs font-bold uppercase tracking-wider mb-4">
            <Trophy className="w-3.5 h-3.5 text-[#00F29D]" /> Official Draw Registration
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            Join the Arena. <span className="gradient-text-emerald">Win Cash.</span> Fuel Causes.
          </h1>
          <p className="mt-3 text-sm text-[#94A3B8]">
            Lock in your subscription to unlock rolling 5-score golf tracking, monthly jackpot draw entries, and direct charity support.
          </p>
        </div>

        <Suspense fallback={
          <div className="flex items-center justify-center p-12 text-white">
            <RefreshCw className="w-6 h-6 animate-spin text-[#00F29D]" />
          </div>
        }>
          <SubscribeContent />
        </Suspense>
      </div>

      <Footer />
    </main>
  );
}
