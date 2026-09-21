'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Lock, CreditCard, ShieldCheck, CheckCircle2, AlertCircle, Heart } from 'lucide-react';
import confetti from 'canvas-confetti';
import { store } from '@/lib/data/mock-db';

interface Props {
  planType: 'monthly' | 'yearly';
  charityId: string;
  charityName?: string;
  charityContributionPct: number;
  fullName: string;
  email: string;
  userId?: string;
  onSuccess?: () => void;
}

export default function StripeCardPaymentForm({
  planType,
  charityId,
  charityName = 'Selected Partner Charity',
  charityContributionPct,
  fullName,
  email,
  userId,
  onSuccess,
}: Props) {
  const router = useRouter();
  const [cardNumber, setCardNumber] = useState('');
  const [expiry, setExpiry] = useState('');
  const [cvc, setCvc] = useState('');
  const [zip, setZip] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);

  const price = planType === 'yearly' ? '$190.00' : '$19.00';
  const planLabel = planType === 'yearly' ? 'Annual Champion Plan' : 'Monthly Flex Plan';

  // Format card number with spaces
  const handleCardChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    const parts = [];
    for (let i = 0; i < raw.length && i < 16; i += 4) {
      parts.push(raw.substring(i, i + 4));
    }
    setCardNumber(parts.join(' '));
  };

  // Format MM/YY
  const handleExpiryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/[^0-9]/gi, '');
    if (raw.length <= 2) {
      setExpiry(raw);
    } else {
      setExpiry(raw.substring(0, 2) + '/' + raw.substring(2, 4));
    }
  };

  // Fill sample Stripe test credentials
  const fillTestCard = (type: 'success' | 'declined' | 'insufficient') => {
    setErrorMsg(null);
    if (type === 'success') {
      setCardNumber('4242 4242 4242 4242');
      setExpiry('12/28');
      setCvc('123');
      setZip('90210');
    } else if (type === 'declined') {
      setCardNumber('4000 0000 0000 0002');
      setExpiry('12/28');
      setCvc('123');
      setZip('90210');
    } else if (type === 'insufficient') {
      setCardNumber('4000 0000 0000 0999');
      setExpiry('12/28');
      setCvc('123');
      setZip('90210');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    const cleanCard = cardNumber.replace(/\s+/g, '');
    if (cleanCard.length < 16) {
      setErrorMsg('Please enter a valid 16-digit card number.');
      return;
    }
    if (expiry.length < 5) {
      setErrorMsg('Please enter a valid expiration date (MM/YY).');
      return;
    }
    if (cvc.length < 3) {
      setErrorMsg('Please enter a valid 3-digit CVC.');
      return;
    }

    // Check test decline cases
    if (cleanCard === '4000000000000002') {
      setErrorMsg('Your card was declined. Please try another payment method (Stripe test code: card_declined).');
      return;
    }
    if (cleanCard === '4000000000000999') {
      setErrorMsg('Your card has insufficient funds (Stripe test code: insufficient_funds).');
      return;
    }

    if (!userId) {
      setErrorMsg('You must be signed in to complete payment. Please log in or create an account first.');
      return;
    }

    setIsProcessing(true);

    try {
      // 1. Create real subscription checkout session from server
      const intentRes = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          planType,
          charityId,
          charityContributionPct,
          email,
          fullName,
          userId,
          returnUrl: window.location.origin,
        }),
      });
      const checkoutData = await intentRes.json();

      if (!intentRes.ok || !checkoutData.url) {
        throw new Error(checkoutData.error || 'Unable to connect to Stripe billing service.');
      }

      // Redirect directly to Stripe Checkout
      window.location.href = checkoutData.url;
      return;
    } catch (err: any) {
      setErrorMsg(err.message || 'Payment processing failed. Please retry.');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="bg-white border border-gray-200/90 rounded-3xl p-6 sm:p-8 shadow-xl shadow-black/5 space-y-6 text-[#111827]">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-gray-100 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-[#11382B]/10 text-[#11382B] flex items-center justify-center">
              <CreditCard className="w-4 h-4" />
            </div>
            <h3 className="text-base sm:text-lg font-bold text-[#111827]">
              Stripe Secure Payment
            </h3>
          </div>
          <p className="text-xs text-gray-500 mt-0.5">
            Test Mode Active • PCI-DSS Level 1 Encrypted
          </p>
        </div>

        <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-[#11382B] text-xs font-bold">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
          <span>TEST MODE</span>
        </div>
      </div>

      {/* Plan & Charity Snapshot */}
      <div className="p-4 rounded-2xl bg-gray-50 border border-gray-100 space-y-2 text-xs">
        <div className="flex justify-between items-center">
          <span className="text-gray-600">{planLabel}:</span>
          <span className="text-xl font-mono font-black text-[#11382B]">{price}</span>
        </div>
        <div className="flex justify-between items-center text-gray-600">
          <span className="flex items-center gap-1">
            <Heart className="w-3.5 h-3.5 text-[#E25B37]" /> Charity Allocation ({charityContributionPct}%):
          </span>
          <span className="text-[#E25B37] font-bold truncate max-w-[180px]">
            {charityName || 'Selected Cause'}
          </span>
        </div>
      </div>

      {/* Quick Test Presets */}
      <div className="space-y-1.5">
        <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider block">
          One-Click Test Cards:
        </span>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => fillTestCard('success')}
            className="px-3 py-1.5 rounded-full bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-xs text-[#11382B] font-mono font-semibold transition-colors"
          >
            4242 (Success)
          </button>
          <button
            type="button"
            onClick={() => fillTestCard('declined')}
            className="px-3 py-1.5 rounded-full bg-rose-50 hover:bg-rose-100 border border-rose-200 text-xs text-rose-700 font-mono font-semibold transition-colors"
          >
            4002 (Decline)
          </button>
          <button
            type="button"
            onClick={() => fillTestCard('insufficient')}
            className="px-3 py-1.5 rounded-full bg-amber-50 hover:bg-amber-100 border border-amber-200 text-xs text-amber-800 font-mono font-semibold transition-colors"
          >
            0999 (No Funds)
          </button>
        </div>
      </div>

      {/* Card Input Form */}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-bold text-gray-700 mb-1.5 uppercase tracking-wider">
            Card Number
          </label>
          <div className="relative">
            <input
              type="text"
              required
              maxLength={19}
              placeholder="4242 4242 4242 4242"
              value={cardNumber}
              onChange={handleCardChange}
              className="w-full px-4 py-3 rounded-2xl bg-gray-50 border border-gray-200 text-[#111827] font-mono text-sm tracking-wider focus:outline-none focus:bg-white focus:border-[#11382B] focus:ring-1 focus:ring-[#11382B] transition-all"
            />
            <div className="absolute right-3.5 top-1/2 -translate-y-1/2 flex items-center gap-1.5 text-xs text-gray-500">
              <span className="px-1.5 py-0.5 rounded bg-gray-200 text-[10px] font-bold">VISA</span>
              <span className="px-1.5 py-0.5 rounded bg-gray-200 text-[10px] font-bold">MC</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-3">
          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1.5 uppercase tracking-wider">
              Expires
            </label>
            <input
              type="text"
              required
              maxLength={5}
              placeholder="MM/YY"
              value={expiry}
              onChange={handleExpiryChange}
              className="w-full px-3 py-3 rounded-2xl bg-gray-50 border border-gray-200 text-[#111827] font-mono text-sm text-center focus:outline-none focus:bg-white focus:border-[#11382B] focus:ring-1 focus:ring-[#11382B] transition-all"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1.5 uppercase tracking-wider">
              CVC
            </label>
            <input
              type="text"
              required
              maxLength={4}
              placeholder="123"
              value={cvc}
              onChange={e => setCvc(e.target.value.replace(/[^0-9]/g, ''))}
              className="w-full px-3 py-3 rounded-2xl bg-gray-50 border border-gray-200 text-[#111827] font-mono text-sm text-center focus:outline-none focus:bg-white focus:border-[#11382B] focus:ring-1 focus:ring-[#11382B] transition-all"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1.5 uppercase tracking-wider">
              ZIP Code
            </label>
            <input
              type="text"
              required
              placeholder="90210"
              value={zip}
              onChange={e => setZip(e.target.value)}
              className="w-full px-3 py-3 rounded-2xl bg-gray-50 border border-gray-200 text-[#111827] text-sm text-center focus:outline-none focus:bg-white focus:border-[#11382B] focus:ring-1 focus:ring-[#11382B] transition-all"
            />
          </div>
        </div>

        {errorMsg && (
          <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-xs text-rose-700 flex items-start gap-2">
            <AlertCircle className="w-4 h-4 mt-0.5 shrink-0 text-rose-500" />
            <span>{errorMsg}</span>
          </div>
        )}

        {isSuccess && (
          <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-center space-y-1">
            <CheckCircle2 className="w-6 h-6 text-emerald-600 mx-auto" />
            <p className="text-xs font-bold text-[#11382B]">Payment Authorized & Confirmed!</p>
            <p className="text-[11px] text-gray-600">Redirecting to your subscriber dashboard...</p>
          </div>
        )}

        <button
          type="submit"
          disabled={isProcessing || isSuccess}
          className="w-full py-4 rounded-full bg-[#11382B] hover:bg-[#0c281e] text-white text-xs font-black uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg shadow-[#11382B]/10 transition-all active:scale-[0.99] disabled:opacity-50"
        >
          <Lock className="w-3.5 h-3.5" />
          <span>
            {isProcessing
              ? 'Processing Encrypted Payment...'
              : isSuccess
              ? 'Payment Successful'
              : `Authorize & Pay ${price}`}
          </span>
        </button>

        <div className="flex items-center justify-center gap-2 text-[11px] text-gray-500 pt-1">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
          <span>Card details are tokenized directly with Stripe. Never stored locally.</span>
        </div>
      </form>
    </div>
  );
}
