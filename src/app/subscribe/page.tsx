'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Check, Heart, Trophy, ShieldCheck, ArrowRight, Lock, CreditCard, ExternalLink, RefreshCw } from 'lucide-react';
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
  const [paymentMode, setPaymentMode] = useState<'card' | 'hosted'>('hosted');
  const [isRedirecting, setIsRedirecting] = useState<boolean>(false);

  useEffect(() => {
    async function initPage() {
      // 1. Load charities
      try {
        const charRes = await fetch('/api/charities');
        if (charRes.ok) {
          const charData = await charRes.json();
          if (charData.charities?.length > 0) {
            setCharities(charData.charities);
          } else {
            setCharities(store.getCharities());
          }
        } else {
          setCharities(store.getCharities());
        }
      } catch {
        setCharities(store.getCharities());
      }

      // 2. Load authenticated user session
      let user: Profile | null = null;
      try {
        const authRes = await fetch('/api/auth/me');
        if (authRes.ok) {
          const authData = await authRes.json();
          if (authData.user) {
            user = authData.user;
          }
        }
      } catch {}

      if (!user) {
        user = store.getCurrentUser();
      }

      setCurrentUser(user);
      if (user) {
        if (user.full_name) setFullName(user.full_name);
        if (user.email) setEmail(user.email);
        if (user.charity_contribution_pct) setCharityPct(user.charity_contribution_pct);
      }

      if (preselectedCharityId) {
        setSelectedCharityId(preselectedCharityId);
      } else if (user?.charity_id) {
        setSelectedCharityId(user.charity_id);
      } else {
        const list = store.getCharities();
        if (list.length > 0) setSelectedCharityId(list[0].id);
      }
    }

    initPage();
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
        <div className="bg-white rounded-3xl p-8 sm:p-12 border border-orange-200/60 shadow-xl shadow-black/5 text-center space-y-6 max-w-2xl mx-auto my-6 animate-in fade-in zoom-in-95 duration-200">
          <div className="w-16 h-16 rounded-full bg-[#E25B37]/10 text-[#E25B37] mx-auto flex items-center justify-center shadow-sm">
            <Lock className="w-8 h-8" />
          </div>
          <div>
            <h2 className="text-2xl sm:text-3xl font-black text-[#111827] tracking-tight">
              Sign In or Create Account to Subscribe
            </h2>
            <p className="text-sm text-gray-600 mt-3 max-w-md mx-auto leading-relaxed">
              Every subscription, golf round, and charity allocation in Digital Heroes is tied to an authenticated account. Please register or sign in before making payment.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <Link
              href="/register?redirect=/subscribe"
              className="w-full sm:w-auto px-6 py-3.5 rounded-full bg-[#11382B] hover:bg-[#0c281e] text-white font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-md transition-all active:scale-[0.99]"
            >
              <span>Create New Member Account</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href="/login?redirect=/subscribe"
              className="w-full sm:w-auto px-6 py-3.5 rounded-full bg-white hover:bg-gray-50 text-gray-700 font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all border border-gray-300"
            >
              <Lock className="w-4 h-4 text-gray-500" />
              <span>Sign In with Existing Account</span>
            </Link>
          </div>
        </div>
      )}

      {/* Active Membership Guard Banner: Already Subscribed */}
      {currentUser?.subscription_status === 'active' && (
        <div className="p-6 rounded-3xl bg-emerald-50 border border-emerald-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5 animate-in fade-in duration-200 max-w-3xl mx-auto my-6 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-emerald-100 text-[#11382B] flex items-center justify-center shrink-0">
              <Check className="w-6 h-6" />
            </div>
            <div>
              <p className="font-extrabold text-[#111827] text-base">Active Membership Confirmed</p>
              <p className="text-xs text-gray-600 mt-1">
                You are signed in as <span className="text-[#11382B] font-bold">{currentUser.full_name || currentUser.email}</span> with an active subscription. Duplicate payment is blocked.
              </p>
            </div>
          </div>
          <Link
            href="/dashboard"
            className="px-5 py-3 rounded-full bg-[#11382B] hover:bg-[#0c281e] text-white font-bold text-xs uppercase tracking-wider flex items-center gap-1.5 shrink-0 transition-all shadow-sm"
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
          <div className="p-4 rounded-2xl bg-white border border-gray-200/80 shadow-xs flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-[#11382B]/10 text-[#11382B] flex items-center justify-center font-bold text-xs">
                {currentUser.full_name ? currentUser.full_name.charAt(0).toUpperCase() : 'U'}
              </div>
              <div>
                <p className="text-xs font-bold text-[#111827]">Subscribing as: {currentUser.full_name}</p>
                <p className="text-[11px] text-gray-500">{currentUser.email}</p>
              </div>
            </div>
            <span className="px-3 py-1 rounded-full bg-amber-50 border border-amber-200 text-amber-800 text-[10px] font-bold uppercase tracking-wider">
              Pending Payment
            </span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Left Column: Onboarding Configuration */}
            <div className="lg:col-span-7 space-y-6">
              {/* Step 1: Pick Plan */}
              <div className="bg-white rounded-3xl p-6 border border-gray-200/80 shadow-sm space-y-4">
                <h2 className="text-xs font-bold uppercase tracking-wider text-gray-700 flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-[#11382B] text-white text-xs font-extrabold flex items-center justify-center">
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
                        ? 'bg-emerald-50/50 border-[#11382B] ring-2 ring-[#11382B] shadow-sm'
                        : 'bg-gray-50 border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <span className="absolute -top-2.5 right-3 px-2 py-0.5 rounded-full bg-[#E25B37] text-white text-[9px] font-black uppercase tracking-wider">
                      Save 17%
                    </span>
                    <p className="font-bold text-sm text-[#111827]">Annual Champion</p>
                    <p className="text-2xl font-black font-mono text-[#11382B] mt-1">$190</p>
                    <p className="text-[11px] text-emerald-700 font-medium mt-0.5">($15.83/mo • 2 mos free)</p>
                  </div>

                  {/* Monthly Card */}
                  <div
                    onClick={() => setPlanType('monthly')}
                    className={`p-4 rounded-2xl border cursor-pointer transition-all ${
                      planType === 'monthly'
                        ? 'bg-emerald-50/50 border-[#11382B] ring-2 ring-[#11382B] shadow-sm'
                        : 'bg-gray-50 border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <p className="font-bold text-sm text-[#111827]">Monthly Flex</p>
                    <p className="text-2xl font-black font-mono text-[#11382B] mt-1">$19</p>
                    <p className="text-[11px] text-gray-500 font-medium mt-0.5">Billed monthly</p>
                  </div>
                </div>
              </div>

              {/* Step 2: Pick Partner Charity */}
              <div className="bg-white rounded-3xl p-6 border border-gray-200/80 shadow-sm space-y-4">
                <h2 className="text-xs font-bold uppercase tracking-wider text-gray-700 flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-[#E25B37] text-white text-xs font-extrabold flex items-center justify-center">
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
                          ? 'bg-orange-50/40 border-[#E25B37] ring-1 ring-[#E25B37] shadow-xs'
                          : 'bg-gray-50 border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <img src={c.logo_url || ''} alt={c.name} className="w-9 h-9 rounded-xl object-cover" />
                        <div>
                          <p className="text-xs font-bold text-[#111827]">{c.name}</p>
                          <p className="text-[10px] text-[#E25B37]">{c.tagline}</p>
                        </div>
                      </div>
                      {selectedCharityId === c.id && (
                        <span className="w-5 h-5 rounded-full bg-[#E25B37] text-white flex items-center justify-center text-xs">
                          ✓
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Step 3: Choose Charity Contribution % */}
              <div className="bg-white rounded-3xl p-6 border border-gray-200/80 shadow-sm space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-xs font-bold uppercase tracking-wider text-gray-700 flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-[#11382B] text-white text-xs font-extrabold flex items-center justify-center">
                      3
                    </span>
                    Charity Pledge Split
                  </h2>
                  <span className="font-mono font-black text-xl text-[#11382B]">{charityPct}%</span>
                </div>

                <p className="text-xs text-gray-600">
                  Digital Heroes requires a minimum 10% pledge toward your chosen charity. You can choose up to 50%.
                </p>

                <input
                  type="range"
                  min="10"
                  max="50"
                  step="5"
                  value={charityPct}
                  onChange={e => setCharityPct(Number(e.target.value))}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-[#11382B]"
                />

                <div className="flex justify-between text-[11px] font-mono text-gray-500">
                  <span>10% (Platform Min)</span>
                  <span>25%</span>
                  <span>50% (Max Purpose)</span>
                </div>
              </div>

              {/* Step 4: Account Information */}
              <div className="bg-white rounded-3xl p-6 border border-gray-200/80 shadow-sm space-y-4">
                <h2 className="text-xs font-bold uppercase tracking-wider text-gray-700 flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-gray-200 text-gray-700 text-xs font-extrabold flex items-center justify-center">
                    4
                  </span>
                  Account Information
                </h2>

                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">Full Name</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Alex Morgan"
                      value={fullName}
                      onChange={e => setFullName(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-2xl bg-gray-50 border border-gray-200 text-[#111827] text-xs focus:outline-none focus:bg-white focus:border-[#11382B]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">Email Address</label>
                    <input
                      type="email"
                      required
                      placeholder="alex@example.com"
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-2xl bg-gray-50 border border-gray-200 text-[#111827] text-xs focus:outline-none focus:bg-white focus:border-[#11382B]"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column: Payment Flow */}
            <div className="lg:col-span-5 space-y-6">
              {/* Payment Method Toggle */}
              <div className="flex gap-2 p-1 rounded-full bg-gray-100 border border-gray-200">
                <button
                  type="button"
                  onClick={() => setPaymentMode('card')}
                  className={`flex-1 py-2.5 rounded-full text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
                    paymentMode === 'card'
                      ? 'bg-white text-[#11382B] shadow-xs'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <CreditCard className="w-3.5 h-3.5" />
                  <span>Card (Elements)</span>
                </button>
                <button
                  type="button"
                  onClick={() => setPaymentMode('hosted')}
                  className={`flex-1 py-2.5 rounded-full text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
                    paymentMode === 'hosted'
                      ? 'bg-white text-[#11382B] shadow-xs'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>Stripe Hosted</span>
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
                <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-200/90 shadow-xl shadow-black/5 space-y-6">
                  <h2 className="text-lg font-bold text-[#111827]">Hosted Checkout Summary</h2>

                  <div className="space-y-3 text-xs divide-y divide-gray-100">
                    <div className="flex justify-between pt-2">
                      <span className="text-gray-500">Selected Plan:</span>
                      <span className="font-bold text-[#111827]">
                        {planType === 'yearly' ? 'Annual Champion ($190/yr)' : 'Monthly Flex ($19/mo)'}
                      </span>
                    </div>
                    <div className="flex justify-between pt-2">
                      <span className="text-gray-500">Charity Partner:</span>
                      <span className="font-bold text-[#E25B37] truncate max-w-[180px]">
                        {selectedCharity?.name}
                      </span>
                    </div>
                    <div className="flex justify-between pt-2">
                      <span className="text-gray-500">Charity Allocation:</span>
                      <span className="font-mono font-bold text-[#111827]">{charityPct}%</span>
                    </div>
                  </div>

                  <div className="p-4 rounded-2xl bg-gray-50 border border-gray-100 flex items-center justify-between">
                    <span className="text-xs font-bold text-gray-500">Total Due Today:</span>
                    <span className="text-3xl font-black font-mono text-[#11382B]">
                      {planType === 'yearly' ? '$190.00' : '$19.00'}
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={handleHostedCheckout}
                    disabled={isRedirecting}
                    className="w-full py-4 rounded-full bg-[#11382B] hover:bg-[#0c281e] text-white text-xs font-extrabold uppercase tracking-wider flex items-center justify-center gap-2 shadow-md transition-all active:scale-[0.99] disabled:opacity-50"
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

                  <div className="flex items-center justify-center gap-2 text-[11px] text-gray-500">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
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
    <main className="min-h-screen flex flex-col bg-[#FAFAF8] text-[#111827]">
      <Navbar />

      <div className="pt-32 pb-24 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 w-full flex-1">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-50 border border-emerald-200 text-[#11382B] text-xs font-bold uppercase tracking-wider mb-4">
            <Trophy className="w-3.5 h-3.5 text-emerald-600" /> Official Draw Registration
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-[#111827] tracking-tight">
            Join the Arena. <span className="text-[#11382B]">Win Cash.</span> Fuel Causes.
          </h1>
          <p className="mt-3 text-sm text-gray-600">
            Lock in your subscription to unlock rolling 5-score golf tracking, monthly jackpot draw entries, and direct charity support.
          </p>
        </div>

        <Suspense fallback={
          <div className="flex items-center justify-center p-12 text-[#11382B]">
            <RefreshCw className="w-6 h-6 animate-spin" />
          </div>
        }>
          <SubscribeContent />
        </Suspense>
      </div>

      <Footer />
    </main>
  );
}
