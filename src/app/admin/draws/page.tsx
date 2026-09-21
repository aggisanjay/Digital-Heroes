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
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-white flex items-center gap-2.5">
            <Trophy className="w-7 h-7 text-[#00F29D]" />
            <span>Draw Room & Prize Simulator</span>
          </h1>
          <p className="text-xs text-[#94A3B8] mt-1">
            Simulate prize tier distributions against real active subscribers and lock in official published draws.
          </p>
        </div>

        {actionFeedbackToast && (
          <div className="px-4 py-2 rounded-xl bg-[#00F29D]/15 border border-[#00F29D]/40 text-[#00F29D] text-xs font-bold flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4" />
            <span>{actionFeedbackToast}</span>
          </div>
        )}
      </div>

      {/* Simulator Control Surface */}
      <div className="glass-panel-elevated rounded-3xl p-6 sm:p-8 border border-white/10 space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Controls Column */}
          <div className="lg:col-span-5 space-y-6">
            <h3 className="text-sm font-bold uppercase tracking-wider text-[#94A3B8] flex items-center gap-2">
              <Sliders className="w-4 h-4 text-[#00F29D]" />
              <span>Simulation Parameters</span>
            </h3>

            {/* Mode Select */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-white uppercase tracking-wider">
                Target Generation Mode
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setDrawMode('algorithmic')}
                  className={`p-3.5 rounded-2xl border text-xs font-bold transition-all text-left ${
                    drawMode === 'algorithmic'
                      ? 'bg-[#00F29D]/15 border-[#00F29D] text-[#00F29D] shadow-lg shadow-[#00F29D]/10'
                      : 'bg-white/5 border-white/10 text-[#94A3B8] hover:text-white'
                  }`}
                >
                  <p className="font-extrabold text-white">Algorithmic</p>
                  <p className="text-[10px] text-[#94A3B8] mt-0.5">Weighted by consistency</p>
                </button>

                <button
                  type="button"
                  onClick={() => setDrawMode('random')}
                  className={`p-3.5 rounded-2xl border text-xs font-bold transition-all text-left ${
                    drawMode === 'random'
                      ? 'bg-[#00F29D]/15 border-[#00F29D] text-[#00F29D] shadow-lg shadow-[#00F29D]/10'
                      : 'bg-white/5 border-white/10 text-[#94A3B8] hover:text-white'
                  }`}
                >
                  <p className="font-extrabold text-white">True Random</p>
                  <p className="text-[10px] text-[#94A3B8] mt-0.5">Uniform lottery RNG</p>
                </button>
              </div>
            </div>

            {/* Target Numbers Input */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-white uppercase tracking-wider">
                  Target Numbers (5 unique: 1–45)
                </label>
                <button
                  type="button"
                  onClick={handleGenerateRandomTargets}
                  className="text-xs text-[#00F29D] font-bold hover:underline flex items-center gap-1"
                >
                  <Sparkles className="w-3.5 h-3.5" />
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
                    className="w-full h-12 rounded-xl bg-white/5 border border-white/10 text-center font-mono font-black text-base text-white focus:outline-none focus:border-[#00F29D]"
                  />
                ))}
              </div>
            </div>

            {/* Run Dry-Run Simulation Button */}
            <button
              type="button"
              onClick={handleRunSimulation}
              disabled={isSimulating}
              className="w-full py-4 rounded-xl bg-white/10 hover:bg-white/15 border border-white/15 text-white font-extrabold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all disabled:opacity-50"
            >
              {isSimulating ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin text-[#00F29D]" />
                  <span>Simulating Real Subscriber Pool...</span>
                </>
              ) : (
                <>
                  <Play className="w-4 h-4 text-[#00F29D]" />
                  <span>Run Dry-Run Simulation</span>
                </>
              )}
            </button>
          </div>

          {/* Simulation Output Column */}
          <div className="lg:col-span-7 bg-black/40 rounded-2xl p-5 border border-white/10 space-y-4">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-[#94A3B8]">
                Simulation Projection
              </h3>
              {simulationResult && (
                <button
                  type="button"
                  onClick={handlePublishDraw}
                  className="px-4 py-2 rounded-xl bg-gradient-to-r from-[#00F29D] to-[#00D2FF] text-[#06080F] font-black text-xs uppercase tracking-wider shadow-lg shadow-[#00F29D]/20 hover:opacity-95 transition-opacity"
                >
                  Officially Publish & Lock Draw
                </button>
              )}
            </div>

            {publishSuccess && (
              <div className="p-4 rounded-xl bg-[#00F29D]/15 border border-[#00F29D]/40 text-[#00F29D] text-xs flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>{publishSuccess}</span>
              </div>
            )}

            {simulationResult ? (
              <div className="space-y-4">
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
                  <div className="p-3 rounded-xl bg-white/5 border border-white/5">
                    <span className="text-[10px] text-[#94A3B8] block">Subscribers</span>
                    <span className="font-mono font-bold text-white text-base">
                      {simulationResult.activeSubscriberCount}
                    </span>
                  </div>
                  <div className="p-3 rounded-xl bg-white/5 border border-white/5">
                    <span className="text-[10px] text-[#94A3B8] block">Total Cycle Pool</span>
                    <span className="font-mono font-bold text-[#00F29D] text-base">
                      ${simulationResult.totalCyclePool.toFixed(2)}
                    </span>
                  </div>
                  <div className="p-3 rounded-xl bg-white/5 border border-white/5">
                    <span className="text-[10px] text-[#94A3B8] block">Prizes Distributed</span>
                    <span className="font-mono font-bold text-white text-base">
                      ${simulationResult.totalPrizeDistributed.toFixed(2)}
                    </span>
                  </div>
                  <div className="p-3 rounded-xl bg-white/5 border border-white/5">
                    <span className="text-[10px] text-[#94A3B8] block">Next Rollover</span>
                    <span className="font-mono font-bold text-amber-400 text-base">
                      ${simulationResult.nextJackpotRolloverOut.toFixed(2)}
                    </span>
                  </div>
                </div>

                {/* Tier Splits */}
                <div className="overflow-x-auto">
                  <table className="w-full text-xs text-left">
                    <thead>
                      <tr className="border-b border-white/10 text-[#94A3B8]">
                        <th className="py-2">Tier</th>
                        <th className="py-2">Total Pool</th>
                        <th className="py-2">Winners</th>
                        <th className="py-2">Per Winner</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      <tr>
                        <td className="py-2.5 font-bold text-[#00F29D]">Tier 5 (Jackpot)</td>
                        <td className="py-2.5 font-mono">${simulationResult.tiers.tier5.totalPool.toFixed(2)}</td>
                        <td className="py-2.5 font-bold">{simulationResult.tiers.tier5.winnersCount}</td>
                        <td className="py-2.5 font-mono font-bold text-[#00F29D]">
                          ${simulationResult.tiers.tier5.prizePerWinner.toFixed(2)}
                        </td>
                      </tr>
                      <tr>
                        <td className="py-2.5 font-bold text-[#00D2FF]">Tier 4 Match</td>
                        <td className="py-2.5 font-mono">${simulationResult.tiers.tier4.totalPool.toFixed(2)}</td>
                        <td className="py-2.5 font-bold">{simulationResult.tiers.tier4.winnersCount}</td>
                        <td className="py-2.5 font-mono font-bold text-[#00D2FF]">
                          ${simulationResult.tiers.tier4.prizePerWinner.toFixed(2)}
                        </td>
                      </tr>
                      <tr>
                        <td className="py-2.5 font-bold text-[#FF6E40]">Tier 3 Match</td>
                        <td className="py-2.5 font-mono">${simulationResult.tiers.tier3.totalPool.toFixed(2)}</td>
                        <td className="py-2.5 font-bold">{simulationResult.tiers.tier3.winnersCount}</td>
                        <td className="py-2.5 font-mono font-bold text-[#FF6E40]">
                          ${simulationResult.tiers.tier3.prizePerWinner.toFixed(2)}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            ) : (
              <div className="p-12 text-center text-[#64748B] text-xs">
                Click &ldquo;Run Dry-Run Simulation&rdquo; to project real payouts across the database subscriber pool.
              </div>
            )}
          </div>
        </div>

        {/* Published Draw History */}
        <div className="mt-8 pt-6 border-t border-white/10">
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#94A3B8]">
              Recent Published Draws ({draws.length})
            </h4>
            {draws.length > 0 && (
              <button
                onClick={() => handleDeleteDraw()}
                className="px-3 py-1.5 rounded-xl bg-rose-500/15 hover:bg-rose-500/25 border border-rose-500/30 text-rose-300 text-xs font-bold flex items-center gap-1.5 transition-colors"
                title="Clear all test draws and winner records"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Reset All Test Draws</span>
              </button>
            )}
          </div>

          <div className="space-y-2">
            {draws.length === 0 ? (
              <p className="text-xs text-[#64748B] italic p-4 rounded-xl bg-white/5 border border-white/10 text-center">
                No published draws in ledger. Run the simulation above to publish a draw.
              </p>
            ) : (
              draws.map(d => (
                <div
                  key={d.id}
                  className="p-3.5 rounded-xl bg-white/5 border border-white/10 flex items-center justify-between text-xs"
                >
                  <div>
                    <span className="font-mono font-bold text-white">{d.period}</span>
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-white/5 text-[#00F29D] font-bold ml-2">
                      {d.mode}
                    </span>
                    <span className="text-slate-400 ml-2">
                      Numbers: [{d.target_numbers.join(', ')}]
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="text-right font-mono">
                      <span className="text-white font-bold">${Number(d.pool_total).toLocaleString()}</span>
                      <span className="text-[10px] text-amber-400 block">
                        Rollover: ${Number(d.jackpot_rollover_out).toLocaleString()}
                      </span>
                    </div>
                    <button
                      onClick={() => handleDeleteDraw(d.id)}
                      className="p-1.5 rounded-lg bg-white/5 hover:bg-rose-500/20 text-slate-400 hover:text-rose-300 transition-colors"
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
