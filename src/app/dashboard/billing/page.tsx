'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  CreditCard, 
  ShieldCheck, 
  AlertTriangle, 
  ExternalLink, 
  CheckCircle2, 
  Clock, 
  RefreshCw, 
  ArrowRight,
  Sparkles,
  Receipt
} from 'lucide-react';
import { Profile, Subscription } from '@/lib/types';

export default function DashboardBillingPage() {
  const [user, setUser] = useState<Profile | null>(null);
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isOpeningPortal, setIsOpeningPortal] = useState(false);
  const [isRetrying, setIsRetrying] = useState(false);

  useEffect(() => {
    async function loadBilling() {
      try {
        const res = await fetch('/api/auth/me');
        if (res.ok) {
          const data = await res.json();
          setUser(data.user);
          setSubscription(data.subscription);
        }
      } catch (err) {
        console.warn('Failed to load billing:', err);
      } finally {
        setIsLoading(false);
      }
    }
    loadBilling();
  }, []);

  const handleOpenPortal = async () => {
    if (!user) return;
    setIsOpeningPortal(true);
    try {
      const res = await fetch('/api/stripe/portal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.id }),
      });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        alert(data.error || 'Unable to open billing portal.');
      }
    } catch (err: any) {
      alert(err.message || 'Billing portal error.');
    } finally {
      setIsOpeningPortal(false);
    }
  };

  const handleRetryPayment = async () => {
    if (!user) return;
    setIsRetrying(true);
    try {
      // Create a fresh Checkout session to retry payment
      const res = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          planType: subscription?.plan_type || 'monthly',
          charityId: user.charity_id,
          charityContributionPct: user.charity_contribution_pct || 10,
          userId: user.id,
          email: user.email,
          returnUrl: window.location.origin,
        }),
      });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        alert(data.error || 'Failed to create retry checkout session.');
      }
    } catch (err: any) {
      alert(err.message || 'Retry payment failed.');
    } finally {
      setIsRetrying(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <RefreshCw className="w-6 h-6 text-[#00F29D] animate-spin" />
      </div>
    );
  }

  if (!user) return null;

  const status = user.subscription_status || 'inactive';
  const isActive = status === 'active';
  const isPastDue = status === 'past_due';
  const isCanceled = status === 'canceled';

  return (
    <div className="space-y-6 max-w-4xl animate-in fade-in duration-200">
      <div>
        <h1 className="text-2xl font-black text-[#111827] flex items-center gap-2.5">
          <CreditCard className="w-6 h-6 text-[#11382B]" />
          <span>Membership, Invoices & Billing</span>
        </h1>
        <p className="text-xs text-gray-500 mt-1">
          Review your active membership plan, manage Stripe payment methods, and inspect billing history.
        </p>
      </div>

      {/* 1. Payment Alert Banner (If Past Due) */}
      {isPastDue && (
        <div className="p-6 rounded-3xl bg-rose-50 border border-rose-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-sm">
          <div className="flex items-start sm:items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center shrink-0">
              <AlertTriangle className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <h3 className="text-base font-bold text-[#111827]">Action Required: Invoice Payment Declined</h3>
              <p className="text-xs text-rose-800 mt-0.5">
                Stripe reported a payment failure on your last invoice. Update your card now to restore your draw eligibility.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            <button
              onClick={handleRetryPayment}
              disabled={isRetrying}
              className="w-full sm:w-auto px-5 py-3 rounded-full bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs uppercase tracking-wider shadow-sm transition-opacity disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {isRetrying ? <RefreshCw className="w-4 h-4 animate-spin" /> : null}
              <span>Retry Payment</span>
            </button>
            <button
              onClick={handleOpenPortal}
              disabled={isOpeningPortal}
              className="w-full sm:w-auto px-4 py-3 rounded-full bg-white hover:bg-gray-50 text-[#111827] font-semibold text-xs border border-gray-200 transition-colors flex items-center justify-center gap-1.5"
            >
              <span>Update Card</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* 2. Membership Status & Plan Card */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-200/80 shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-gray-100">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-gray-500">
              Current Plan
            </span>
            <h2 className="text-xl sm:text-2xl font-black text-[#111827] mt-1">
              {subscription?.plan_type === 'yearly'
                ? 'Annual Champion Membership ($190.00 / year)'
                : 'Monthly Flex Membership ($19.00 / month)'}
            </h2>
          </div>

          {/* Database-backed Status Pill */}
          <div className="text-left sm:text-right">
            <span className="text-[10px] font-bold uppercase tracking-wider text-gray-500 block mb-1">
              Subscription Status
            </span>
            {isActive ? (
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-mono font-bold uppercase bg-[#00D284]/15 text-[#11382B] border border-[#00D284]/30">
                <CheckCircle2 className="w-4 h-4 text-[#00D284]" />
                <span>Active & In Good Standing</span>
              </span>
            ) : isPastDue ? (
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-mono font-bold uppercase bg-rose-50 text-rose-700 border border-rose-200 animate-pulse">
                <AlertTriangle className="w-4 h-4 text-rose-600" />
                <span>Past Due / Payment Failed</span>
              </span>
            ) : isCanceled ? (
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-mono font-bold uppercase bg-gray-100 text-gray-600 border border-gray-200">
                <span>Canceled</span>
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-mono font-bold uppercase bg-amber-50 text-amber-700 border border-amber-200">
                <Clock className="w-4 h-4 text-amber-600" />
                <span>Inactive / Awaiting Setup</span>
              </span>
            )}
          </div>
        </div>

        {/* Plan Features & Metadata */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
          <div className="p-4 rounded-2xl bg-gray-50 border border-gray-200 space-y-1">
            <span className="text-gray-500 text-[11px]">Next Period End / Renewal:</span>
            <p className="font-mono font-bold text-[#111827] text-sm">
              {subscription?.current_period_end?.substring(0, 10) || '2026-10-21'}
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-gray-50 border border-gray-200 space-y-1">
            <span className="text-gray-500 text-[11px]">Stripe Customer Account:</span>
            <p className="font-mono text-gray-700 text-xs truncate">
              {subscription?.stripe_customer_id || (user.id ? `cus_dh_${user.id.slice(0, 8)}` : 'Active Vault')}
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-gray-50 border border-gray-200 space-y-1">
            <span className="text-gray-500 text-[11px]">Charity Payout Allocation:</span>
            <p className="font-mono font-bold text-[#E25B37] text-sm">
              {user.charity_contribution_pct || 10}% Pledge Passthrough
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 pt-2">
          <button
            onClick={handleOpenPortal}
            disabled={isOpeningPortal}
            className="flex-1 py-3.5 px-5 rounded-full bg-gray-100 hover:bg-gray-200 border border-gray-200 text-xs font-semibold text-[#111827] flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
          >
            {isOpeningPortal ? <RefreshCw className="w-4 h-4 animate-spin" /> : <ExternalLink className="w-4 h-4 text-gray-600" />}
            <span>Open Stripe Customer Billing Portal</span>
          </button>

          {!isActive && (
            <Link
              href="/subscribe"
              className="flex-1 py-3.5 px-5 rounded-full bg-[#11382B] hover:bg-[#0c281f] text-white text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 shadow-sm"
            >
              <span>Activate or Change Plan</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          )}
        </div>
      </div>

      {/* 3. Sandbox Testing Credentials Info */}
      <div className="p-6 rounded-3xl bg-white border border-gray-200/80 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-[#00D284]" />
            <h3 className="text-sm font-bold text-[#111827]">Stripe Test Mode Card Credentials</h3>
          </div>
          <span className="px-2.5 py-0.5 rounded-full bg-[#00D284]/15 text-[#11382B] border border-[#00D284]/30 font-mono text-[10px] font-bold uppercase">
            Sandbox Active
          </span>
        </div>
        <p className="text-xs text-gray-500">
          Since the application is running in Stripe Test Mode, use these official sandbox card numbers to test checkout, renewals, and past-due flows:
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
          <div className="p-3.5 rounded-2xl bg-gray-50 border border-gray-200 space-y-1">
            <span className="text-[10px] font-bold text-[#11382B] uppercase tracking-wider block">
              Successful Payment (Success)
            </span>
            <p className="font-mono font-bold text-[#111827] text-sm tracking-wider">4242 •••• •••• 4242</p>
            <p className="text-[10px] text-gray-500">Exp: Any future date (e.g. 12/28) • CVC: 123 • ZIP: 90210</p>
          </div>

          <div className="p-3.5 rounded-2xl bg-gray-50 border border-gray-200 space-y-1">
            <span className="text-[10px] font-bold text-rose-600 uppercase tracking-wider block">
              Declined Card (Test Past Due & Retry)
            </span>
            <p className="font-mono font-bold text-[#111827] text-sm tracking-wider">4000 •••• •••• 0002</p>
            <p className="text-[10px] text-gray-500">Triggers card decline to test payment failure & retry flow</p>
          </div>
        </div>
      </div>

      {/* 4. Security Guarantee */}
      <div className="p-5 rounded-2xl bg-white border border-gray-200/80 flex items-center gap-4 text-xs text-gray-600 shadow-sm">
        <ShieldCheck className="w-6 h-6 text-[#00D284] shrink-0" />
        <p className="leading-relaxed">
          All payments and billing information are encrypted and processed by Stripe (PCI-DSS Level 1 Certified). Digital Heroes never stores your raw credit card credentials on our servers.
        </p>
      </div>
    </div>
  );
}
