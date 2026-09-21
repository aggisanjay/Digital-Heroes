'use client';

import React, { useState, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { 
  Sparkles, 
  Lock, 
  Mail, 
  Eye, 
  EyeOff, 
  ArrowRight, 
  AlertCircle, 
  CheckCircle2
} from 'lucide-react';
import { store } from '@/lib/data/mock-db';

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectPath = searchParams.get('redirect');

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const handleStandardSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !email.includes('@')) {
      setErrorMessage('Please enter a valid email address.');
      return;
    }
    if (!password || password.length < 6) {
      setErrorMessage('Please enter your password (minimum 6 characters).');
      return;
    }

    setIsLoading(true);
    setErrorMessage('');

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Authentication error.');
      }

      const user = data.user || store.login(email);
      if (data.user) {
        store.setProfile(data.user);
      }
      setSuccessMessage(`Authentication successful! Welcome, ${user.full_name || email}.`);

      setTimeout(() => {
        if (redirectPath) {
          router.push(redirectPath);
        } else if (data.destination) {
          router.push(data.destination);
        } else if (user.role === 'admin') {
          router.push('/admin');
        } else if (user.subscription_status !== 'active') {
          router.push('/subscribe');
        } else {
          router.push('/dashboard');
        }
      }, 500);

    } catch (err: any) {
      setErrorMessage(err.message || 'Authentication error. Please check your credentials.');
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#06080F] text-white flex flex-col justify-between relative overflow-hidden pt-24 pb-12 px-4 sm:px-6 lg:px-8">
      {/* Background ambient lighting effects */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[500px] bg-gradient-to-tr from-[#00F29D]/10 via-[#00D2FF]/10 to-[#FF6E40]/10 blur-[130px] pointer-events-none rounded-full" />
      <div className="absolute bottom-10 right-10 w-[400px] h-[400px] bg-[#00F29D]/5 blur-[120px] pointer-events-none rounded-full" />

      {/* Main Container */}
      <div className="max-w-4xl mx-auto w-full relative z-10 my-auto">
        {/* Header Branding */}
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
                Account Sign In
              </span>
            </div>
          </Link>
          <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-white mt-2">
            Welcome back to the <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#00F29D] to-[#00D2FF]">Arena</span>
          </h1>
          <p className="text-sm text-[#94A3B8] max-w-md mx-auto mt-2">
            Sign in to access your scoring ledger, manage your monthly prize draw allocation, and support your charity.
          </p>
        </div>

        {/* Centered Member Login Card */}
        <div className="max-w-xl mx-auto w-full">
          <div className="bg-[#0D1322]/90 backdrop-blur-xl border border-white/10 rounded-2xl p-6 sm:p-8 shadow-2xl relative">

            <div className="flex items-center gap-2.5 pb-5 border-b border-white/10 mb-6">
              <Lock className="w-4 h-4 text-[#00F29D]" />
              <h2 className="text-base font-bold text-white tracking-wide">Member Sign In</h2>
            </div>

            {/* Error & Success Alerts */}
            {errorMessage && (
              <div className="mb-5 p-3 rounded-xl bg-red-500/10 border border-red-500/30 flex items-center gap-3 text-xs text-red-400">
                <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
                <span>{errorMessage}</span>
              </div>
            )}
            {successMessage && (
              <div className="mb-5 p-3 rounded-xl bg-[#00F29D]/10 border border-[#00F29D]/30 flex items-center gap-3 text-xs text-[#00F29D]">
                <CheckCircle2 className="w-4 h-4 shrink-0 text-[#00F29D]" />
                <span>{successMessage}</span>
              </div>
            )}

            <form onSubmit={handleStandardSubmit} className="space-y-4">
              {/* Email Field */}
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
                    placeholder="name@example.com"
                    className="w-full pl-10 pr-4 py-3 bg-[#06080F] border border-white/15 rounded-xl text-sm text-white placeholder-[#64748B] focus:outline-none focus:border-[#00F29D] focus:ring-1 focus:ring-[#00F29D] transition-all"
                  />
                </div>
              </div>

              {/* Password Field */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-semibold text-[#94A3B8] uppercase tracking-wider">
                    Password
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      if (email && email.includes('@')) {
                        setSuccessMessage(`Password recovery instructions sent to ${email}.`);
                        setErrorMessage('');
                      } else {
                        setErrorMessage('Please enter your email address above to receive password recovery instructions.');
                      }
                    }}
                    className="text-[11px] text-[#00F29D] hover:underline"
                  >
                    Forgot password?
                  </button>
                </div>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#64748B]">
                    <Lock className="w-4 h-4" />
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your password"
                    className="w-full pl-10 pr-11 py-3 bg-[#06080F] border border-white/15 rounded-xl text-sm text-white placeholder-[#64748B] focus:outline-none focus:border-[#00F29D] focus:ring-1 focus:ring-[#00F29D] transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-[#64748B] hover:text-white"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Remember Me */}
              <div className="flex items-center justify-between pt-1">
                <label className="flex items-center gap-2 cursor-pointer text-xs text-[#94A3B8]">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="rounded bg-[#06080F] border-white/20 text-[#00F29D] focus:ring-[#00F29D] focus:ring-offset-0 w-3.5 h-3.5"
                  />
                  <span>Keep me signed in for 30 days</span>
                </label>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-[#00F29D] to-[#00D2FF] hover:opacity-95 text-[#06080F] font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-[#00F29D]/20 transition-all disabled:opacity-50 mt-4 active:scale-[0.99]"
              >
                {isLoading ? (
                  <div className="w-5 h-5 border-2 border-[#06080F] border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <span>Sign In to Account</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>

            {/* Bottom Register Prompt */}
            <div className="mt-6 pt-5 border-t border-white/10 text-center space-y-2">
              <p className="text-xs text-[#94A3B8]">
                Don&apos;t have an account yet?{' '}
                <Link href="/register" className="text-[#00F29D] font-bold hover:underline">
                  Create Account
                </Link>
              </p>
              <p className="text-[11px] text-[#64748B]">
                Looking to subscribe? Sign in first, or register to select your plan.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Footer Minimal Info */}
      <div className="max-w-4xl mx-auto w-full text-center text-xs text-[#64748B] mt-8">
        Digital Heroes &copy; 2026 • All rights reserved.
      </div>
    </div>

  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#06080F] flex items-center justify-center text-white">
        <div className="w-8 h-8 border-2 border-[#00F29D] border-t-transparent rounded-full animate-spin" />
      </div>
    }>
      <LoginForm />
    </Suspense>
  );
}
