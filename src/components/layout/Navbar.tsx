'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { 
  ChevronDown, 
  ArrowRight, 
  LogOut, 
  LogIn, 
  LayoutDashboard, 
  ShieldAlert, 
  Menu, 
  X,
  Sparkles
} from 'lucide-react';
import { store } from '@/lib/data/mock-db';
import { Profile } from '@/lib/types';
import RoleBadge from '@/components/shared/RoleBadge';
import { eventBus } from '@/lib/events';
import Pill from '@/components/ui/Pill';

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

    const unsub = eventBus.on('user:switched', () => {
      refreshUser();
    });

    return () => {
      window.removeEventListener('scroll', handleScroll);
      unsub();
    };
  }, []);

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

  // Do not render floating public navbar on interior dashboard / admin pages (they have their own sidebars)
  if (pathname.startsWith('/dashboard') || pathname.startsWith('/admin')) {
    return null;
  }

  return (
    <header className="fixed top-4 sm:top-6 left-0 right-0 z-50 px-4 pointer-events-none flex justify-center">
      <div
        className={`pointer-events-auto w-full max-w-5xl rounded-full transition-all duration-300 ${
          scrolled
            ? 'bg-white/95 backdrop-blur-2xl border border-black/10 shadow-xl shadow-black/5 py-2.5 px-5'
            : 'bg-white/80 backdrop-blur-xl border border-black/8 shadow-md shadow-black/[0.03] py-3 px-6'
        }`}
      >
        <div className="flex items-center justify-between">
          {/* Brand Logo */}
          <Link href="/" className="flex items-center gap-2.5 group shrink-0">
            <div className="w-9 h-9 rounded-full bg-[#11382B]/5 border border-[#11382B]/15 flex items-center justify-center p-1 group-hover:scale-105 transition-transform duration-200">
              <img
                src="/logo-icon.png"
                alt="Digital Heroes Mascot"
                className="w-full h-full object-contain filter drop-shadow-sm"
              />
            </div>
            <div className="flex flex-col">
              <span className="font-extrabold text-base tracking-tight text-gray-900 leading-none">
                DIGITAL<span className="text-[#11382B]">HEROES</span>
              </span>
              <span className="text-[9px] tracking-wider text-gray-500 font-semibold uppercase mt-0.5">
                Golf • Prize • Charity
              </span>
            </div>
          </Link>

          {/* Desktop Nav Links (Center Pills) */}
          <nav className="hidden md:flex items-center gap-1 bg-gray-100/70 p-1 rounded-full border border-gray-200/50">
            <Link
              href="/charities"
              className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-all ${
                pathname === '/charities'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Charities
            </Link>
            <Link
              href="/how-it-works"
              className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-all ${
                pathname === '/how-it-works'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              How It Works
            </Link>
            <Link
              href="/subscribe"
              className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-all ${
                pathname === '/subscribe'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Membership
            </Link>
          </nav>

          {/* Right Action Pills */}
          <div className="flex items-center gap-2">
            {currentUser ? (
              <div className="relative">
                <button
                  onClick={() => setShowUserDropdown(!showUserDropdown)}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-gray-100 hover:bg-gray-200/80 border border-gray-200 text-xs font-bold text-gray-900 transition-all"
                >
                  <RoleBadge variant={roleVariant} size="sm" showLabel={false} />
                  <span className="max-w-[110px] truncate hidden sm:inline">
                    {currentUser.full_name || currentUser.email}
                  </span>
                  <ChevronDown className="w-3.5 h-3.5 text-gray-500" />
                </button>

                {showUserDropdown && (
                  <div className="absolute right-0 mt-2 w-64 rounded-3xl bg-white border border-gray-200 shadow-2xl p-3 z-50 animate-in fade-in zoom-in-95 duration-150">
                    <div className="px-3 py-2 border-b border-gray-100 mb-1">
                      <p className="font-bold text-xs text-gray-900 truncate">{currentUser.full_name}</p>
                      <p className="text-[10px] text-gray-500 truncate">{currentUser.email}</p>
                    </div>

                    <div className="space-y-1 pt-1">
                      <Link
                        href="/dashboard"
                        onClick={() => setShowUserDropdown(false)}
                        className="w-full flex items-center gap-2.5 px-3 py-2 rounded-2xl text-xs font-semibold text-gray-800 hover:bg-gray-50 transition-colors"
                      >
                        <LayoutDashboard className="w-4 h-4 text-emerald-700" />
                        <span>Subscriber Dashboard</span>
                      </Link>

                      {currentUser.role === 'admin' && (
                        <Link
                          href="/admin"
                          onClick={() => setShowUserDropdown(false)}
                          className="w-full flex items-center gap-2.5 px-3 py-2 rounded-2xl text-xs font-semibold text-amber-800 hover:bg-amber-50 transition-colors"
                        >
                          <ShieldAlert className="w-4 h-4 text-amber-600" />
                          <span>Admin Control Station</span>
                        </Link>
                      )}

                      <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-2.5 px-3 py-2 rounded-2xl text-xs font-semibold text-rose-600 hover:bg-rose-50 transition-colors"
                      >
                        <LogOut className="w-4 h-4" />
                        <span>Sign Out</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <Pill href="/login" variant="outline" size="sm">
                Sign In
              </Pill>
            )}

            <Pill href="/subscribe" variant="primary" size="sm" arrow>
              Join the Draw
            </Pill>

            {/* Mobile Toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-full bg-gray-100 border border-gray-200 text-gray-700 hover:bg-gray-200"
            >
              {mobileMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Mobile Dropdown */}
        {mobileMenuOpen && (
          <div className="md:hidden mt-3 pt-3 border-t border-gray-100 space-y-2 pb-1">
            <Link
              href="/charities"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 rounded-xl text-xs font-semibold text-gray-700 hover:bg-gray-100"
            >
              Charities Directory
            </Link>
            <Link
              href="/how-it-works"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 rounded-xl text-xs font-semibold text-gray-700 hover:bg-gray-100"
            >
              How It Works
            </Link>
            <Link
              href="/subscribe"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 rounded-xl text-xs font-semibold text-gray-700 hover:bg-gray-100"
            >
              Membership & Pricing
            </Link>
          </div>
        )}
      </div>
    </header>
  );
}
