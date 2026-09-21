'use client';

import React, { useState, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { 
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

      const user = data.user;
      if (user) {
        store.setProfile(user);
      }
      setSuccessMessage(`Authentication successful! Welcome, ${user?.full_name || email}.`);

      setTimeout(() => {
        router.refresh();
        if (redirectPath) {
          router.push(redirectPath);
        } else if (data.destination) {
          router.push(data.destination);
        } else if (user?.role === 'admin') {
          router.push('/admin');
        } else if (user?.subscription_status !== 'active') {
          router.push('/subscribe');
        } else {
          router.push('/dashboard');
        }
      }, 400);

    } catch (err: any) {
      setErrorMessage(err.message || 'Authentication error. Please check your credentials.');
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FAFAF8] text-[#111827] flex flex-col justify-between relative overflow-hidden pt-20 pb-12 px-4 sm:px-6 lg:px-8">
      {/* Background ambient lighting effects */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[500px] bg-gradient-to-tr from-[#11382B]/5 via-emerald-100/40 to-[#E25B37]/5 blur-[120px] pointer-events-none rounded-full" />
      <div className="absolute bottom-10 right-10 w-[400px] h-[400px] bg-[#00D284]/5 blur-[100px] pointer-events-none rounded-full" />

      {/* Main Container */}
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
                Account Sign In
              </span>
            </div>
          </Link>
          <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-[#111827] mt-2">
            Welcome back to the <span className="text-[#11382B]">Arena</span>
          </h1>
          <p className="text-sm text-gray-600 max-w-md mx-auto mt-2">
            Sign in to access your golf scoring ledger, view monthly prize draw tickets, and manage your charity allocations.
          </p>
        </div>

        {/* Centered Member Login Card */}
        <div className="w-full">
          <div className="bg-white border border-gray-200/90 rounded-3xl p-6 sm:p-10 shadow-xl shadow-black/5 relative">
            <div className="flex items-center justify-between pb-5 border-b border-gray-100 mb-6">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-full bg-[#11382B]/10 text-[#11382B] flex items-center justify-center">
                  <Lock className="w-4 h-4" />
                </div>
                <h2 className="text-base font-bold text-[#111827]">Member Sign In</h2>
              </div>
              <span className="text-xs px-3 py-1 rounded-full bg-emerald-50 text-[#11382B] font-semibold border border-emerald-100">
                Secure SSL
              </span>
            </div>

            {/* Error & Success Alerts */}
            {errorMessage && (
              <div className="mb-5 p-3.5 rounded-2xl bg-red-50 border border-red-200 flex items-center gap-3 text-xs text-red-600">
                <AlertCircle className="w-4 h-4 shrink-0 text-red-500" />
                <span>{errorMessage}</span>
              </div>
            )}
            {successMessage && (
              <div className="mb-5 p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center gap-3 text-xs text-emerald-800">
                <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
                <span>{successMessage}</span>
              </div>
            )}

            <form onSubmit={handleStandardSubmit} className="space-y-4">
              {/* Email Field */}
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
                    placeholder="name@example.com"
                    className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl text-sm text-[#111827] placeholder-gray-400 focus:outline-none focus:bg-white focus:border-[#11382B] focus:ring-1 focus:ring-[#11382B] transition-all"
                  />
                </div>
              </div>

              {/* Password Field */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-bold text-gray-700 uppercase tracking-wider">
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
                    className="text-xs text-[#11382B] font-semibold hover:underline"
                  >
                    Forgot password?
                  </button>
                </div>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                    <Lock className="w-4 h-4" />
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your password"
                    className="w-full pl-10 pr-11 py-3 bg-gray-50 border border-gray-200 rounded-2xl text-sm text-[#111827] placeholder-gray-400 focus:outline-none focus:bg-white focus:border-[#11382B] focus:ring-1 focus:ring-[#11382B] transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-gray-400 hover:text-gray-700"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Remember Me */}
              <div className="flex items-center justify-between pt-1">
                <label className="flex items-center gap-2 cursor-pointer text-xs text-gray-600">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="rounded border-gray-300 text-[#11382B] focus:ring-[#11382B] w-4 h-4"
                  />
                  <span>Keep me signed in for 30 days</span>
                </label>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3.5 px-6 rounded-full bg-[#11382B] hover:bg-[#0c281e] text-white font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-[#11382B]/10 transition-all disabled:opacity-50 mt-4 active:scale-[0.99]"
              >
                {isLoading ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <span>Sign In to Account</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>

            {/* Bottom Register Prompt */}
            <div className="mt-6 pt-5 border-t border-gray-100 text-center space-y-2">
              <p className="text-xs text-gray-600">
                Don&apos;t have an account yet?{' '}
                <Link href="/register" className="text-[#11382B] font-bold hover:underline">
                  Create Member Account
                </Link>
              </p>
              <p className="text-[11px] text-gray-400">
                Looking to subscribe? Sign in first, or register to select your plan.
              </p>
            </div>
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

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#FAFAF8] flex items-center justify-center text-[#11382B]">
        <div className="w-8 h-8 border-2 border-[#11382B] border-t-transparent rounded-full animate-spin" />
      </div>
    }>
      <LoginForm />
    </Suspense>
  );
}
