'use client';

import React, { useState, useEffect } from 'react';
import { Heart, CheckCircle2, RefreshCw, Sparkles, ExternalLink } from 'lucide-react';
import { Profile, Charity } from '@/lib/types';

export default function DashboardCharityPage() {
  const [user, setUser] = useState<Profile | null>(null);
  const [charities, setCharities] = useState<Charity[]>([]);
  const [selectedCharityId, setSelectedCharityId] = useState<string>('');
  const [charityPct, setCharityPct] = useState<number>(10);
  const [isSaving, setIsSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadCharityData() {
      try {
        const [authRes, charRes] = await Promise.all([
          fetch('/api/auth/me'),
          fetch('/api/charities'),
        ]);

        if (authRes.ok) {
          const authData = await authRes.json();
          const currentUser = authData.user;
          setUser(currentUser);
          if (currentUser?.charity_id) setSelectedCharityId(currentUser.charity_id);
          if (currentUser?.charity_contribution_pct) setCharityPct(currentUser.charity_contribution_pct);
        }

        if (charRes.ok) {
          const charData = await charRes.json();
          if (charData.charities) setCharities(charData.charities);
        }
      } catch (e) {
        console.warn('Failed to load charity data:', e);
      } finally {
        setIsLoading(false);
      }
    }
    loadCharityData();
  }, []);

  const handleSave = async () => {
    if (!user) return;
    setIsSaving(true);
    setSavedSuccess(false);

    try {
      await fetch('/api/admin/users', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.id,
          charity_id: selectedCharityId,
          charity_contribution_pct: charityPct,
        }),
      });

      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 3000);
    } catch (err) {
      alert('Failed to update charity preference.');
    } finally {
      setIsSaving(false);
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

  return (
    <div className="space-y-6 max-w-4xl animate-in fade-in duration-200">
      <div>
        <h1 className="text-2xl font-black text-[#111827] flex items-center gap-2.5">
          <Heart className="w-6 h-6 text-[#E25B37] fill-[#E25B37]" />
          <span>Charity Passthrough & Impact</span>
        </h1>
        <p className="text-xs text-gray-500 mt-1">
          Every month, a percentage of your subscription is pledged directly to your designated partner cause.
        </p>
      </div>

      {/* Allocation Slider Card */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-200/80 shadow-sm space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-[#111827]">Your Pledge Allocation</h3>
            <p className="text-xs text-gray-500">
              Guaranteed 100% passthrough of selected percentage to the charity
            </p>
          </div>
          <span className="font-mono font-black text-3xl text-[#E25B37]">{charityPct}%</span>
        </div>

        <div className="space-y-3">
          <input
            type="range"
            min="10"
            max="50"
            step="5"
            value={charityPct}
            onChange={e => setCharityPct(Number(e.target.value))}
            className="w-full h-2.5 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-[#E25B37]"
          />
          <div className="flex justify-between text-[11px] font-mono text-gray-500">
            <span>10% (Platform Minimum)</span>
            <span>25%</span>
            <span>50% (Champion Purpose)</span>
          </div>
        </div>

        <div className="flex items-center gap-3 pt-2">
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="px-6 py-3 rounded-full bg-[#11382B] hover:bg-[#0c281f] text-white font-bold text-xs shadow-sm transition-colors disabled:opacity-50"
          >
            {isSaving ? 'Saving Changes...' : 'Save Allocation Preference'}
          </button>
          {savedSuccess && (
            <span className="text-xs text-[#00D284] font-bold flex items-center gap-1.5 animate-in fade-in">
              <CheckCircle2 className="w-4 h-4" /> Preference Saved to Database!
            </span>
          )}
        </div>
      </div>

      {/* Select Charity Partner */}
      <div className="space-y-4">
        <h3 className="text-base font-bold text-[#111827]">Choose Your Designated Charity</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {charities.map((c) => {
            const isSelected = c.id === selectedCharityId;

            return (
              <div
                key={c.id}
                onClick={() => setSelectedCharityId(c.id)}
                className={`p-5 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between ${
                  isSelected
                    ? 'bg-[#E25B37]/5 border-[#E25B37] shadow-sm ring-1 ring-[#E25B37]'
                    : 'bg-white border-gray-200 hover:border-gray-300 shadow-sm'
                }`}
              >
                <div className="flex items-start gap-4">
                  <img
                    src={c.logo_url || ''}
                    alt={c.name}
                    className="w-12 h-12 rounded-xl object-cover border border-gray-200 shrink-0"
                  />
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="font-bold text-[#111827] text-sm">{c.name}</h4>
                      {isSelected && (
                        <span className="px-2.5 py-0.5 rounded-full text-[9px] font-bold uppercase bg-[#E25B37] text-white">
                          Selected
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-gray-500 mt-1 line-clamp-2 leading-relaxed">
                      {c.tagline || c.description}
                    </p>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between text-xs">
                  <span className="text-gray-500">Total Platform Raised:</span>
                  <span className="font-mono font-bold text-[#E25B37]">
                    ${Number(c.total_raised).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
