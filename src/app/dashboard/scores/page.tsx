'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Target, RefreshCw, ChevronLeft } from 'lucide-react';
import TactileScorecard from '@/components/scoring/TactileScorecard';

export default function DashboardScoresPage() {
  const [userId, setUserId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadUser() {
      try {
        const res = await fetch('/api/auth/me');
        if (res.ok) {
          const data = await res.json();
          if (data.user?.id) setUserId(data.user.id);
        }
      } catch (e) {
        console.warn('Failed to load user:', e);
      } finally {
        setIsLoading(false);
      }
    }
    loadUser();
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <RefreshCw className="w-6 h-6 text-[#00D284] animate-spin" />
      </div>
    );
  }

  if (!userId) {
    return (
      <div className="p-8 text-center text-gray-500">
        Please sign in to view and log golf scores.
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-[#111827] flex items-center gap-2.5">
            <Target className="w-6 h-6 text-[#00D284]" />
            <span>Tactile Scorecard & Rolling Rounds</span>
          </h1>
          <p className="text-xs text-gray-500 mt-1">
            Log your tournament Stableford scores (1–45). Your 5 latest scores automatically form your monthly draw ticket.
          </p>
        </div>
      </div>

      <TactileScorecard userId={userId} />
    </div>
  );
}
