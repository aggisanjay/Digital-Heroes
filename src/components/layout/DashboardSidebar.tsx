'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { 
  BarChart3, 
  Target, 
  Trophy, 
  Heart, 
  CreditCard, 
  ShieldCheck, 
  AlertTriangle, 
  LogOut, 
  Menu, 
  X, 
  Sparkles, 
  ChevronRight,
  RefreshCw,
  Clock
} from 'lucide-react';
import RoleBadge from '@/components/shared/RoleBadge';
import { store } from '@/lib/data/mock-db';

interface UserData {
  id: string;
  email: string;
  full_name?: string;
  role: string;
  subscription_status: string;
}

export default function DashboardSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [user, setUser] = useState<UserData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchUser() {
      try {
        const res = await fetch('/api/auth/me');
        if (res.ok) {
          const data = await res.json();
          if (data.user) {
            setUser(data.user);
          }
        }
      } catch (err) {
        console.warn('Failed to load current session:', err);
      } finally {
        setIsLoading(false);
      }
    }
    fetchUser();
  }, [pathname]);

  const handleSignOut = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
    } catch (e) {
      console.warn('Logout request failed:', e);
    }
    store.logout();
    router.push('/login');
    router.refresh();
  };

  const navItems = [
    { label: 'Overview', href: '/dashboard', icon: BarChart3, exact: true },
    { label: 'Tactile Scores', href: '/dashboard/scores', icon: Target },
    { label: 'Draws & Winnings', href: '/dashboard/draws', icon: Trophy },
    { label: 'Charity Impact', href: '/dashboard/charity', icon: Heart },
    { label: 'Billing & Plan', href: '/dashboard/billing', icon: CreditCard },
  ];

  const subStatus = user?.subscription_status || 'inactive';
  const isPastDue = subStatus === 'past_due';
  const isActive = subStatus === 'active';
  const isAdmin = user?.role === 'admin';

  const sidebarContent = (
    <div className="flex flex-col h-full bg-white border-r border-gray-200/80 text-gray-900 w-64 lg:w-72 select-none shadow-sm">
      {/* 1. Brand Logo */}
      <div className="p-5 border-b border-gray-100 flex items-center justify-between">
        <Link href="/dashboard" className="flex items-center gap-3 group">
          <div className="w-10 h-10 rounded-2xl bg-[#11382B] p-2 flex items-center justify-center shadow-md shadow-[#11382B]/10 group-hover:scale-105 transition-transform">
            <img
              src="/logo-icon.png"
              alt="Digital Heroes Mascot"
              className="w-full h-full object-contain"
            />
          </div>
          <div className="flex flex-col">
            <span className="font-extrabold text-base tracking-tight text-[#111827] leading-none">
              DIGITAL<span className="text-[#00D284]">HEROES</span>
            </span>
            <span className="text-[10px] text-gray-500 font-bold tracking-widest uppercase mt-0.5">
              Player Portal
            </span>
          </div>
        </Link>
        {mobileOpen && (
          <button
            onClick={() => setMobileOpen(false)}
            className="lg:hidden p-2 text-gray-400 hover:text-gray-700 rounded-full hover:bg-gray-100"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* 2. Persistent User Profile & Status Card */}
      <div className="p-4 m-4 rounded-2xl bg-gray-50/90 border border-gray-200/80 space-y-3">
        <div className="flex items-center justify-between">
          <div className="truncate pr-2">
            <p className="font-bold text-sm text-[#111827] truncate">
              {user?.full_name || user?.email?.split('@')[0] || 'Subscriber'}
            </p>
            <p className="text-[11px] text-gray-500 truncate">{user?.email || 'Loading...'}</p>
          </div>
          <RoleBadge variant={isAdmin ? 'admin' : isActive ? 'active' : 'lapsed'} size="sm" />
        </div>

        {/* Live Payment Status Pill */}
        <div className="pt-2 border-t border-gray-200/60">
          <div className="flex items-center justify-between">
            <span className="text-[10px] uppercase font-bold tracking-wider text-gray-500">
              Membership
            </span>
            {isActive ? (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-[#00D284]/15 text-[#11382B] border border-[#00D284]/30">
                <ShieldCheck className="w-3 h-3 text-[#00D284]" />
                <span>Active</span>
              </span>
            ) : isPastDue ? (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-rose-50 text-rose-700 border border-rose-200 animate-pulse">
                <AlertTriangle className="w-3 h-3 text-rose-600" />
                <span>Past Due</span>
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-gray-100 text-gray-600 border border-gray-200">
                <Clock className="w-3 h-3 text-gray-500" />
                <span>Inactive</span>
              </span>
            )}
          </div>

          {/* Action CTA for Past Due / Inactive */}
          {isPastDue && (
            <Link
              href="/dashboard/billing"
              className="mt-2.5 w-full py-1.5 px-3 rounded-full bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold flex items-center justify-between transition-colors shadow-sm"
            >
              <span>Retry Payment</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          )}

          {!isActive && !isPastDue && (
            <Link
              href="/subscribe"
              className="mt-2.5 w-full py-1.5 px-3 rounded-full bg-[#11382B] hover:bg-[#0c281f] text-white text-xs font-bold flex items-center justify-between transition-colors shadow-sm"
            >
              <span>Activate Plan</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          )}
        </div>
      </div>

      {/* 3. Navigation Links */}
      <nav className="flex-1 px-3 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const isActiveLink = item.exact
            ? pathname === item.href
            : pathname.startsWith(item.href);

          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setMobileOpen(false)}
              className={`flex items-center gap-3 px-4 py-2.5 rounded-full text-xs font-semibold transition-all ${
                isActiveLink
                  ? 'bg-[#11382B] text-white shadow-sm'
                  : 'text-gray-600 hover:text-[#111827] hover:bg-gray-100 border border-transparent'
              }`}
            >
              <item.icon className={`w-4 h-4 ${isActiveLink ? 'text-[#00D284]' : 'text-gray-400'}`} />
              <span>{item.label}</span>
            </Link>
          );
        })}

        {/* Admin Console shortcut if user is admin */}
        {isAdmin && (
          <div className="pt-3 mt-3 border-t border-gray-100">
            <Link
              href="/admin/draws"
              onClick={() => setMobileOpen(false)}
              className="flex items-center justify-between px-4 py-2.5 rounded-full text-xs font-bold text-amber-900 bg-amber-50 hover:bg-amber-100 border border-amber-200 transition-colors"
            >
              <div className="flex items-center gap-2.5">
                <ShieldCheck className="w-4 h-4 text-amber-600" />
                <span>Admin Console</span>
              </div>
              <ChevronRight className="w-3.5 h-3.5 text-amber-600" />
            </Link>
          </div>
        )}
      </nav>

      {/* 4. Sign Out Footer */}
      <div className="p-4 border-t border-gray-100">
        <button
          onClick={handleSignOut}
          className="w-full flex items-center justify-center gap-2 px-4 py-2 rounded-full bg-gray-50 hover:bg-rose-50 hover:text-rose-600 border border-gray-200 text-xs font-semibold text-gray-600 transition-colors"
        >
          <LogOut className="w-4 h-4" />
          <span>Sign Out</span>
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile Top Header Bar */}
      <div className="lg:hidden sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-gray-200 px-4 py-3 flex items-center justify-between text-[#111827]">
        <div className="flex items-center gap-2.5">
          <button
            onClick={() => setMobileOpen(true)}
            className="p-2 rounded-full bg-gray-100 border border-gray-200 hover:bg-gray-200 text-gray-700"
          >
            <Menu className="w-5 h-5" />
          </button>
          <span className="font-extrabold text-sm tracking-tight text-[#111827]">
            DIGITAL<span className="text-[#00D284]">HEROES</span>
          </span>
        </div>

        {/* Mobile Status Indicator */}
        <div className="flex items-center gap-2">
          {isActive ? (
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#00D284]/15 text-[#11382B] border border-[#00D284]/30">
              Active
            </span>
          ) : isPastDue ? (
            <Link href="/dashboard/billing" className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-rose-50 text-rose-700 border border-rose-200 animate-pulse">
              Retry Payment
            </Link>
          ) : (
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-gray-100 text-gray-600 border border-gray-200">
              Inactive
            </span>
          )}
        </div>
      </div>

      {/* Desktop Sidebar (Fixed Left) */}
      <aside className="hidden lg:block fixed inset-y-0 left-0 z-30">
        {sidebarContent}
      </aside>

      {/* Mobile Drawer Overlay */}
      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div className="fixed inset-0 bg-black/40 backdrop-blur-xs" onClick={() => setMobileOpen(false)} />
          <div className="relative flex-1 max-w-xs w-full bg-white z-10 shadow-2xl animate-in slide-in-from-left duration-200">
            {sidebarContent}
          </div>
        </div>
      )}
    </>
  );
}
