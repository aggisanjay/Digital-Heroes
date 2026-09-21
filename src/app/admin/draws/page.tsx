'use client';

import React, { useState, useEffect } from 'react';
import { 
  Trophy, 
  Play, 
  RefreshCw, 
  CheckCircle2, 
  Trash2, 
  Sliders, 
  Sparkles,
  Award
} from 'lucide-react';
import { Draw } from '@/lib/types';
import { generateDrawNumbers } from '@/lib/draw/engine';

export default function AdminDrawsPage() {
  const [draws, setDraws] = useState<Draw[]>([]);
  const [drawMode, setDrawMode] = useState<'random' | 'algorithmic'>('algorithmic');
  const [targetNumbers, setTargetNumbers] = useState<number[]>([12, 24, 31, 38, 42]);
  const [simulationResult, setSimulationResult] = useState<any>(null);
  const [isSimulating, setIsSimulating] = useState(false);
  const [publishSuccess, setPublishSuccess] = useState<string | null>(null);
  const [actionFeedbackToast, setActionFeedbackToast] = useState<string | null>(null);

  const loadDraws = async () => {
    try {
      const res = await fetch('/api/draws?all=true');
      const data = await res.json();
      if (data.draws) setDraws(data.draws);
    } catch (e) {
      console.warn('Failed to load draws:', e);
    }
  };

  useEffect(() => {
    loadDraws();
  }, []);

  const handleGenerateRandomTargets = () => {
    const numbers = generateDrawNumbers();
    setTargetNumbers(numbers);
  };

  const handleRunSimulation = async () => {
    setIsSimulating(true);
    setPublishSuccess(null);
    try {
      const res = await fetch('/api/draws', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'simulate', mode: drawMode, targetNumbers }),
      });
      const data = await res.json();
      if (data.simulation) {
        setSimulationResult(data.simulation);
      }
    } catch (e: any) {
      alert(e.message || 'Simulation failed');
    } finally {
      setIsSimulating(false);
    }
  };

  const handlePublishDraw = async () => {
    if (!confirm('Are you sure you want to publish this draw? This will lock in winner records and snapshot rollover balances in the database.')) {
      return;
    }
    try {
      const res = await fetch('/api/draws', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'publish', mode: drawMode, targetNumbers }),
      });
      const data = await res.json();
      if (data.draw) {
        setPublishSuccess(`Draw ${data.draw.period} published to database with ${data.winnersCount ?? 0} verified subscriber winners!`);
        setSimulationResult(null);
        await loadDraws();
      } else {
        alert(data.error || 'Failed to publish draw');
      }
    } catch (e: any) {
      alert(e.message);
    }
  };

  const handleDeleteDraw = async (drawId?: string) => {
    const isAll = !drawId;
    const msg = isAll 
      ? 'Are you sure you want to reset all test draws and winners from the database? This returns the draw room to a fresh slate.' 
      : 'Are you sure you want to delete this draw and its associated winner records?';
    if (!confirm(msg)) return;

    try {
      const url = drawId ? `/api/draws?id=${encodeURIComponent(drawId)}` : '/api/draws';
      const res = await fetch(url, { method: 'DELETE' });
      const data = await res.json();
      if (res.ok) {
        setActionFeedbackToast(data.message || 'Draws cleared successfully.');
        setTimeout(() => setActionFeedbackToast(null), 3000);
        await loadDraws();
      } else {
        alert(data.error || 'Failed to delete draw');
      }
    } catch (err: any) {
      alert(err.message || 'Failed to delete draw');
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-[#111827] flex items-center gap-2.5">
            <Trophy className="w-6 h-6 text-[#E25B37]" />
            <span>Draw Engine Simulator & Manager</span>
          </h1>
          <p className="text-xs text-gray-500 mt-1">
            Simulate prize tier distributions against real active subscribers and lock in official published draws.
          </p>
        </div>

        {actionFeedbackToast && (
          <div className="px-4 py-2 rounded-full bg-[#00D284]/15 border border-[#00D284]/40 text-[#11382B] text-xs font-bold flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-[#00D284]" />
            <span>{actionFeedbackToast}</span>
          </div>
        )}
      </div>

      {/* Simulator Control Surface */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-200/80 shadow-sm space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Controls Column */}
          <div className="lg:col-span-5 space-y-6">
            <h3 className="text-xs font-bold uppercase tracking-wider text-gray-500 flex items-center gap-2">
              <Sliders className="w-4 h-4 text-[#00D284]" />
              <span>Simulation Parameters</span>
            </h3>

            {/* Mode Select */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-[#111827] uppercase tracking-wider">
                Target Generation Mode
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setDrawMode('algorithmic')}
                  className={`p-3.5 rounded-2xl border text-xs font-bold transition-all text-left ${
                    drawMode === 'algorithmic'
                      ? 'bg-[#11382B] border-[#11382B] text-white shadow-sm'
                      : 'bg-gray-50 border-gray-200 text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <p className={`font-extrabold ${drawMode === 'algorithmic' ? 'text-white' : 'text-[#111827]'}`}>Algorithmic</p>
                  <p className={`text-[10px] mt-0.5 ${drawMode === 'algorithmic' ? 'text-gray-200' : 'text-gray-500'}`}>Weighted by consistency</p>
                </button>

                <button
                  type="button"
                  onClick={() => setDrawMode('random')}
                  className={`p-3.5 rounded-2xl border text-xs font-bold transition-all text-left ${
                    drawMode === 'random'
                      ? 'bg-[#11382B] border-[#11382B] text-white shadow-sm'
                      : 'bg-gray-50 border-gray-200 text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <p className={`font-extrabold ${drawMode === 'random' ? 'text-white' : 'text-[#111827]'}`}>True Random</p>
                  <p className={`text-[10px] mt-0.5 ${drawMode === 'random' ? 'text-gray-200' : 'text-gray-500'}`}>Uniform lottery RNG</p>
                </button>
              </div>
            </div>

            {/* Target Numbers Input */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-[#111827] uppercase tracking-wider">
                  Target Numbers (5 unique: 1–45)
                </label>
                <button
                  type="button"
                  onClick={handleGenerateRandomTargets}
                  className="text-xs text-[#11382B] font-bold hover:underline flex items-center gap-1"
                >
                  <Sparkles className="w-3.5 h-3.5 text-[#00D284]" />
                  <span>Roll Random Targets</span>
                </button>
              </div>

              <div className="grid grid-cols-5 gap-2">
                {targetNumbers.map((num, idx) => (
                  <input
                    key={idx}
                    type="number"
                    min={1}
                    max={45}
                    value={num}
                    onChange={(e) => {
                      const updated = [...targetNumbers];
                      updated[idx] = Math.max(1, Math.min(45, Number(e.target.value) || 1));
                      setTargetNumbers(updated);
                    }}
                    className="w-full h-12 rounded-xl bg-gray-50 border border-gray-200 text-center font-mono font-black text-base text-[#111827] focus:outline-none focus:border-[#11382B] focus:bg-white"
                  />
                ))}
              </div>
            </div>

            {/* Run Dry-Run Simulation Button */}
            <button
              type="button"
              onClick={handleRunSimulation}
              disabled={isSimulating}
              className="w-full py-3.5 rounded-full bg-[#11382B] hover:bg-[#0c281f] text-white font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all shadow-sm disabled:opacity-50"
            >
              {isSimulating ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin text-[#00D284]" />
                  <span>Simulating Real Subscriber Pool...</span>
                </>
              ) : (
                <>
                  <Play className="w-4 h-4 text-[#00D284]" />
                  <span>Run Dry-Run Simulation</span>
                </>
              )}
            </button>
          </div>

          {/* Simulation Output Column */}
          <div className="lg:col-span-7 bg-gray-50/80 rounded-2xl p-5 border border-gray-200 space-y-4">
            <div className="flex items-center justify-between border-b border-gray-200 pb-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-gray-500">
                Simulation Projection
              </h3>
              {simulationResult && (
                <button
                  type="button"
                  onClick={handlePublishDraw}
                  className="px-5 py-2 rounded-full bg-[#00D284] hover:bg-[#00b973] text-[#11382B] font-black text-xs uppercase tracking-wider shadow-sm transition-opacity"
                >
                  Officially Publish & Lock Draw
                </button>
              )}
            </div>

            {publishSuccess && (
              <div className="p-4 rounded-2xl bg-[#00D284]/15 border border-[#00D284]/40 text-[#11382B] text-xs font-semibold flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 shrink-0 text-[#00D284]" />
                <span>{publishSuccess}</span>
              </div>
            )}

            {simulationResult ? (
              <div className="space-y-4">
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
                  <div className="p-3 rounded-xl bg-white border border-gray-200 shadow-xs">
                    <span className="text-[10px] text-gray-500 uppercase font-bold block">Gross Pool</span>
                    <span className="font-mono font-black text-sm text-[#111827]">
                      ${(simulationResult.totalCyclePool ?? 0).toFixed(2)}
                    </span>
                  </div>
                  <div className="p-3 rounded-xl bg-white border border-gray-200 shadow-xs">
                    <span className="text-[10px] text-gray-500 uppercase font-bold block">Prize Pool (Available)</span>
                    <span className="font-mono font-black text-sm text-[#111827]">
                      ${(simulationResult.totalAvailablePoolWithRollover ?? 0).toFixed(2)}
                    </span>
                  </div>
                  <div className="p-3 rounded-xl bg-white border border-gray-200 shadow-xs">
                    <span className="text-[10px] text-gray-500 uppercase font-bold block">Total Winners</span>
                    <span className="font-mono font-black text-sm text-[#00D284]">
                      {simulationResult.winners?.length ?? 0}
                    </span>
                  </div>
                  <div className="p-3 rounded-xl bg-white border border-gray-200 shadow-xs">
                    <span className="text-[10px] text-gray-500 uppercase font-bold block">Rollover Out</span>
                    <span className="font-mono font-black text-sm text-amber-600">
                      ${(simulationResult.nextJackpotRolloverOut ?? 0).toFixed(2)}
                    </span>
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-xs text-left text-gray-700">
                    <thead className="text-[10px] uppercase text-gray-500 border-b border-gray-200">
                      <tr>
                        <th className="pb-2">Tier</th>
                        <th className="pb-2">Allocated</th>
                        <th className="pb-2">Winners</th>
                        <th className="pb-2">Per Winner</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      <tr>
                        <td className="py-2.5 font-bold text-[#11382B]">Tier 5 Match</td>
                        <td className="py-2.5 font-mono">${(simulationResult.tiers?.tier5?.totalPool ?? 0).toFixed(2)}</td>
                        <td className="py-2.5 font-bold">{simulationResult.tiers?.tier5?.winnersCount ?? 0}</td>
                        <td className="py-2.5 font-mono font-bold text-[#11382B]">
                          ${(simulationResult.tiers?.tier5?.prizePerWinner ?? 0).toFixed(2)}
                        </td>
                      </tr>
                      <tr>
                        <td className="py-2.5 font-bold text-blue-600">Tier 4 Match</td>
                        <td className="py-2.5 font-mono">${(simulationResult.tiers?.tier4?.totalPool ?? 0).toFixed(2)}</td>
                        <td className="py-2.5 font-bold">{simulationResult.tiers?.tier4?.winnersCount ?? 0}</td>
                        <td className="py-2.5 font-mono font-bold text-blue-600">
                          ${(simulationResult.tiers?.tier4?.prizePerWinner ?? 0).toFixed(2)}
                        </td>
                      </tr>
                      <tr>
                        <td className="py-2.5 font-bold text-[#E25B37]">Tier 3 Match</td>
                        <td className="py-2.5 font-mono">${(simulationResult.tiers?.tier3?.totalPool ?? 0).toFixed(2)}</td>
                        <td className="py-2.5 font-bold">{simulationResult.tiers?.tier3?.winnersCount ?? 0}</td>
                        <td className="py-2.5 font-mono font-bold text-[#E25B37]">
                          ${(simulationResult.tiers?.tier3?.prizePerWinner ?? 0).toFixed(2)}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            ) : (
              <div className="p-12 text-center text-gray-400 text-xs">
                Click &ldquo;Run Dry-Run Simulation&rdquo; to project real payouts across the database subscriber pool.
              </div>
            )}
          </div>
        </div>

        {/* Published Draw History */}
        <div className="mt-8 pt-6 border-t border-gray-100">
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-gray-500">
              Recent Published Draws ({draws.length})
            </h4>
            {draws.length > 0 && (
              <button
                onClick={() => handleDeleteDraw()}
                className="px-3.5 py-1.5 rounded-full bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-700 text-xs font-bold flex items-center gap-1.5 transition-colors"
                title="Clear all test draws and winner records"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Reset All Test Draws</span>
              </button>
            )}
          </div>

          <div className="space-y-2">
            {draws.length === 0 ? (
              <p className="text-xs text-gray-400 italic p-4 rounded-2xl bg-gray-50 border border-gray-200 text-center">
                No published draws in ledger. Run the simulation above to publish a draw.
              </p>
            ) : (
              draws.map(d => (
                <div
                  key={d.id}
                  className="p-3.5 rounded-2xl bg-gray-50 border border-gray-200 flex items-center justify-between text-xs"
                >
                  <div>
                    <span className="font-mono font-bold text-[#111827]">{d.period}</span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#00D284]/15 text-[#11382B] border border-[#00D284]/30 font-bold ml-2">
                      {d.mode}
                    </span>
                    <span className="text-gray-500 ml-2">
                      Numbers: [{d.target_numbers.join(', ')}]
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="text-right font-mono">
                      <span className="text-[#111827] font-bold">${Number(d.pool_total).toLocaleString()}</span>
                      <span className="text-[10px] text-amber-600 block">
                        Rollover: ${Number(d.jackpot_rollover_out).toLocaleString()}
                      </span>
                    </div>
                    <button
                      onClick={() => handleDeleteDraw(d.id)}
                      className="p-1.5 rounded-full bg-white hover:bg-rose-50 text-gray-400 hover:text-rose-600 border border-gray-200 transition-colors"
                      title="Delete this draw"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
