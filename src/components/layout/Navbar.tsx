'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { 
  Sparkles, 
  User, 
  ChevronDown, 
  ArrowRight, 
  CheckCircle2, 
  LogOut, 
  LogIn, 
  LayoutDashboard, 
  ShieldAlert, 
  Menu, 
  X,
  Compass,
  FileSpreadsheet
} from 'lucide-react';
import { store } from '@/lib/data/mock-db';
import { Profile } from '@/lib/types';
import RoleBadge from '@/components/shared/RoleBadge';
import { eventBus } from '@/lib/events';

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState<Profile | null>(null);
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  const refreshUser = async () => {
    try {
      const res = await fetch('/api/auth/me');
      if (res.ok) {
        const data = await res.json();
        if (data.user) {
          setCurrentUser(data.user);
          return;
        }
      }
    } catch (e) {}
    setCurrentUser(store.getCurrentUser());
  };

  useEffect(() => {
    refreshUser();
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);

    // Listen to user switched events
    const unsub = eventBus.on('user:switched', () => {
      refreshUser();
    });

    return () => {
      window.removeEventListener('scroll', handleScroll);
      unsub();
    };
  }, []);

  const handleRoleSwitch = (userId: string) => {
    store.setCurrentUser(userId);
    refreshUser();
    setShowUserDropdown(false);
    setMobileMenuOpen(false);
    
    // Smooth redirect based on role
    const updated = store.getCurrentUser();
    if (updated?.role === 'admin') {
      router.push('/admin');
    } else {
      router.push('/dashboard');
    }
  };

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
    } catch {}
    store.logout();
    refreshUser();
    setShowUserDropdown(false);
    setMobileMenuOpen(false);
    router.push('/login');
  };

  const roleVariant = currentUser?.role === 'admin' 
    ? 'admin' 
    : currentUser?.subscription_status === 'active' 
    ? 'active' 
    : currentUser ? 'lapsed' : 'visitor';

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? 'bg-[#06080F]/95 backdrop-blur-xl border-b border-white/10 shadow-2xl py-3'
          : 'bg-transparent py-5'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          {/* Brand Logo */}
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#00F29D] via-[#00D2FF] to-[#FF6E40] p-[2px] shadow-lg shadow-[#00F29D]/20 group-hover:scale-105 transition-transform duration-300">
              <div className="w-full h-full bg-[#06080F] rounded-[10px] flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-[#00F29D] group-hover:rotate-12 transition-transform duration-300" />
              </div>
            </div>
            <div className="flex flex-col">
              <span className="font-extrabold text-xl tracking-tight text-white flex items-center gap-1.5">
                DIGITAL<span className="text-[#00F29D]">HEROES</span>
              </span>
              <span className="text-[10px] tracking-widest text-[#94A3B8] font-medium uppercase -mt-1">
                Performance • Prize • Purpose
              </span>
            </div>
          </Link>

          {/* Desktop Nav Links */}
          <nav className="hidden md:flex items-center gap-7">
            <Link
              href="/charities"
              className={`text-sm font-medium transition-colors hover:text-[#00F29D] ${
                pathname === '/charities' ? 'text-[#00F29D]' : 'text-[#94A3B8]'
              }`}
            >
              Charities
            </Link>
            <Link
              href="/how-it-works"
              className={`text-sm font-medium transition-colors hover:text-[#00F29D] ${
                pathname === '/how-it-works' ? 'text-[#00F29D]' : 'text-[#94A3B8]'
              }`}
            >
              How It Works
            </Link>
            <Link
              href="/dashboard"
              className={`text-sm font-medium transition-colors hover:text-[#00F29D] ${
                pathname.startsWith('/dashboard') ? 'text-[#00F29D]' : 'text-[#94A3B8]'
              }`}
            >
              Dashboard
            </Link>
            {currentUser?.role === 'admin' && (
              <Link
                href="/admin"
                className={`text-xs font-semibold px-2.5 py-1 rounded-lg bg-[#FF6E40]/10 border border-[#FF6E40]/30 text-[#FF6E40] transition-colors hover:bg-[#FF6E40]/20 flex items-center gap-1.5 ${
                  pathname.startsWith('/admin') ? 'ring-1 ring-[#FF6E40]' : ''
                }`}
              >
                <ShieldAlert className="w-3.5 h-3.5" />
                Admin Panel
              </Link>
            )}
          </nav>

          {/* Right Area: Auth & Subscribe CTAs */}
          <div className="flex items-center gap-3">
            {/* Authenticated State vs Visitor State */}
            {currentUser ? (
              <div className="relative">
                <button
                  onClick={() => setShowUserDropdown(!showUserDropdown)}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/5 border border-white/10 hover:border-white/20 text-xs text-white transition-all"
                >
                  <RoleBadge variant={roleVariant} size="sm" showLabel={false} />
                  <span className="font-medium text-xs max-w-[120px] truncate hidden sm:inline">
                    {currentUser.full_name}
                  </span>
                  <ChevronDown className="w-3.5 h-3.5 text-[#94A3B8]" />
                </button>

                {/* Dropdown Menu */}
                {showUserDropdown && (
                  <div className="absolute right-0 mt-2 w-72 rounded-2xl bg-[#0D1322] border border-white/15 shadow-2xl p-3 z-50 animate-in fade-in zoom-in-95 duration-150">
                    <div className="px-3 py-2 border-b border-white/10 mb-2">
                      <div className="flex items-center justify-between mb-1">
                        <p className="font-bold text-sm text-white truncate">{currentUser.full_name}</p>
                        <RoleBadge variant={roleVariant} size="sm" />
                      </div>
                      <p className="text-[11px] text-[#94A3B8] truncate">{currentUser.email}</p>
                    </div>

                    <div className="space-y-1">
                      <Link
                        href="/dashboard"
                        onClick={() => setShowUserDropdown(false)}
                        className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs text-white hover:bg-white/5 transition-colors"
                      >
                        <LayoutDashboard className="w-4 h-4 text-[#00F29D]" />
                        <span>Subscriber Dashboard</span>
                      </Link>

                      {currentUser.role === 'admin' && (
                        <Link
                          href="/admin"
                          onClick={() => setShowUserDropdown(false)}
                          className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs text-[#FF6E40] hover:bg-[#FF6E40]/10 transition-colors"
                        >
                          <ShieldAlert className="w-4 h-4 text-[#FF6E40]" />
                          <span>Admin Control Panel</span>
                        </Link>
                      )}
                    </div>

                    {/* Sign Out Action */}
                    <div className="mt-3 pt-2 border-t border-white/10">
                      <button

                        onClick={handleLogout}
                        className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs text-red-400 hover:bg-red-500/10 transition-colors"
                      >
                        <LogOut className="w-4 h-4" />
                        <span>Sign Out</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              /* Visitor: Prominent Login Button */
              <Link
                href="/login"
                className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/15 text-xs font-semibold text-white transition-all"
              >
                <LogIn className="w-3.5 h-3.5 text-[#00F29D]" />
                <span>Sign In</span>
              </Link>
            )}

            {/* Subscribe CTA or Active Member Badge */}
            {currentUser?.subscription_status === 'active' ? (
              <Link
                href="/dashboard"
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#00F29D]/10 border border-[#00F29D]/30 text-[#00F29D] text-xs font-bold transition-all hover:bg-[#00F29D]/20 hidden sm:inline-flex"
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Active Member</span>
              </Link>
            ) : (
              <Link
                href="/subscribe"
                className="relative group overflow-hidden rounded-xl p-[1px] font-semibold text-xs transition-transform active:scale-95 hidden sm:inline-block"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-[#00F29D] via-[#00D2FF] to-[#FF6E40] rounded-xl animate-pulse opacity-70 group-hover:opacity-100 transition-opacity" />
                <div className="relative px-3.5 py-2 bg-[#06080F] rounded-[11px] flex items-center gap-1.5 group-hover:bg-[#06080F]/80 transition-colors">
                  <span className="text-[#00F29D] font-bold">Join the Draw</span>
                  <ArrowRight className="w-3.5 h-3.5 text-[#00F29D] group-hover:translate-x-0.5 transition-transform" />
                </div>
              </Link>
            )}


            {/* Mobile Hamburger Menu Toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-xl bg-white/5 border border-white/10 text-[#94A3B8] hover:text-white"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="md:hidden mt-3 pt-3 border-t border-white/10 bg-[#0D1322] rounded-2xl p-4 shadow-2xl space-y-3 animate-in fade-in duration-200">
            <Link
              href="/charities"
              onClick={() => setMobileMenuOpen(false)}
              className="block text-sm font-medium text-[#94A3B8] hover:text-[#00F29D] py-1.5"
            >
              Charity Directory
            </Link>
            <Link
              href="/how-it-works"
              onClick={() => setMobileMenuOpen(false)}
              className="block text-sm font-medium text-[#94A3B8] hover:text-[#00F29D] py-1.5"
            >
              How It Works
            </Link>
            <Link
              href="/dashboard"
              onClick={() => setMobileMenuOpen(false)}
              className="block text-sm font-medium text-[#94A3B8] hover:text-[#00F29D] py-1.5"
            >
              Subscriber Dashboard
            </Link>
            {currentUser?.role === 'admin' && (
              <Link
                href="/admin"
                onClick={() => setMobileMenuOpen(false)}
                className="block text-sm font-semibold text-[#FF6E40] py-1.5"
              >
                Admin Control Panel
              </Link>
            )}

            <div className="pt-3 border-t border-white/10 flex flex-col gap-2">
              {currentUser ? (
                <button
                  onClick={handleLogout}
                  className="w-full py-2.5 px-4 rounded-xl bg-red-500/10 border border-red-500/20 text-xs font-bold text-red-400 flex items-center justify-center gap-2"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Sign Out ({currentUser.full_name})</span>
                </button>
              ) : (
                <Link
                  href="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full py-2.5 px-4 rounded-xl bg-white/10 text-xs font-bold text-white text-center"
                >
                  Sign In to Account
                </Link>
              )}

              <Link
                href="/subscribe"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-[#00F29D] to-[#00D2FF] text-xs font-bold text-[#06080F] text-center"
              >
                Join the Monthly Draw ($10/mo)
              </Link>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
