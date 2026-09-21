'use client';

import React, { useState, useEffect } from 'react';
import { Trophy, Award, RefreshCw, ShieldCheck } from 'lucide-react';
import WinnerPrizeShowcase from '@/components/dashboard/WinnerPrizeShowcase';
import { Profile, Winner, Draw, Score } from '@/lib/types';

export default function DashboardDrawsPage() {
  const [user, setUser] = useState<Profile | null>(null);
  const [winnings, setWinnings] = useState<Winner[]>([]);
  const [draws, setDraws] = useState<Draw[]>([]);
  const [scores, setScores] = useState<Score[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadData = async () => {
    try {
      const authRes = await fetch('/api/auth/me');
      if (!authRes.ok) return;
      const authData = await authRes.json();
      const currentUser = authData.user;
      setUser(currentUser);

      if (currentUser) {
        const [winRes, drawRes, scoreRes] = await Promise.all([
          fetch(`/api/winners?userId=${encodeURIComponent(currentUser.id)}`),
          fetch('/api/draws'),
          fetch(`/api/scores?userId=${encodeURIComponent(currentUser.id)}`),
        ]);

        const winData = await winRes.json();
        const drawData = await drawRes.json();
        const scoreData = await scoreRes.json();

        if (winData.winners) setWinnings(winData.winners);
        if (drawData.draws) setDraws(drawData.draws);
        if (scoreData.scores) setScores(scoreData.scores);
      }
    } catch (e) {
      console.warn('Failed to load draws data:', e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <RefreshCw className="w-6 h-6 text-[#00F29D] animate-spin" />
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-[#111827] flex items-center gap-2.5">
            <Trophy className="w-6 h-6 text-[#00D284]" />
            <span>Jackpot Draws & Prize Claims</span>
          </h1>
          <p className="text-xs text-gray-500 mt-1">
            Track your active rolling ticket, claim winning prize disbursements, and inspect published platform draw results.
          </p>
        </div>
      </div>

      {/* Winner Prize Showcase & Active Ticket Station */}
      <WinnerPrizeShowcase
        user={user}
        winnings={winnings}
        draws={draws}
        scores={scores}
        onRefresh={loadData}
      />

      {/* Platform Monthly Draws Ledger */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-200/80 shadow-sm space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-gray-100">
          <h3 className="text-base font-bold text-[#111827] flex items-center gap-2">
            <Award className="w-4 h-4 text-[#00D284]" />
            <span>Platform Monthly Draws History</span>
          </h3>
          <span className="text-xs text-gray-500 font-mono">{draws.length} Draws Logged</span>
        </div>

        <div className="divide-y divide-gray-100">
          {draws.length === 0 ? (
            <p className="text-xs text-gray-400 p-4 text-center">No draws published yet.</p>
          ) : (
            draws.map(d => (
              <div key={d.id} className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-[#111827]">Period: {d.period}</span>
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase ${
                      d.status === 'published' ? 'bg-[#00D284]/15 text-[#11382B] border border-[#00D284]/30' : 'bg-gray-100 text-gray-600'
                    }`}>
                      {d.status}
                    </span>
                    <span className="text-xs text-gray-500">({d.mode} engine)</span>
                  </div>
                  <div className="flex items-center gap-2 mt-2">
                    <span className="text-xs text-gray-500">Winning Target Numbers:</span>
                    <div className="flex gap-1.5">
                      {d.target_numbers.map((num, i) => (
                        <span 
                          key={i} 
                          className="w-7 h-7 rounded-lg bg-gray-100 text-[#111827] font-mono text-xs flex items-center justify-center font-bold border border-gray-200"
                        >
                          {num}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="text-left sm:text-right font-mono">
                  <div className="text-base font-bold text-[#111827]">
                    ${Number(d.pool_total).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                  </div>
                  <div className="text-[11px] text-amber-600 font-medium">
                    Rollover Out: ${Number(d.jackpot_rollover_out).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
