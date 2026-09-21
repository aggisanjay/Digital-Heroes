'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { Calendar, Trophy, AlertCircle, Trash2, Edit3, Plus, CheckCircle2, Flame, History, Info, Lock, ArrowRight } from 'lucide-react';
import confetti from 'canvas-confetti';
import { Score, Profile } from '@/lib/types';
import { store } from '@/lib/data/mock-db';

interface Props {
  userId: string;
  onScoresChange?: () => void;
}

export default function TactileScorecard({ userId, onScoresChange }: Props) {
  const [currentUser, setCurrentUser] = useState<Profile | null>(null);
  const [scores, setScores] = useState<Score[]>([]);
  const [scoreVal, setScoreVal] = useState<number>(36);
  const [dateVal, setDateVal] = useState<string>(new Date().toISOString().substring(0, 10));
  const [courseVal, setCourseVal] = useState<string>('Pebble Beach Links');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [editingScoreId, setEditingScoreId] = useState<string | null>(null);
  const [conflictingScore, setConflictingScore] = useState<Score | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const loadScores = async () => {
    setCurrentUser(store.getCurrentUser());
    try {
      const res = await fetch(`/api/scores?userId=${encodeURIComponent(userId)}`);
      if (res.ok) {
        const data = await res.json();
        if (data.scores && Array.isArray(data.scores)) {
          setScores(data.scores);
          store.syncUserScores(userId, data.scores);
          return;
        }
      }
    } catch (e) {
      // Fallback to store
    }
    const userScores = store.getUserScores(userId);
    setScores(userScores);
  };

  useEffect(() => {
    loadScores();
  }, [userId]);

  // Check for date collision in real time
  useEffect(() => {
    const normDate = dateVal ? dateVal.substring(0, 10) : '';
    const conflict = scores.find(
      s => (s.date && s.date.substring(0, 10) === normDate) && s.id !== editingScoreId
    );
    setConflictingScore(conflict || null);
    if (conflict) {
      setErrorMessage(`A score (${conflict.score} pts at ${conflict.course_name || 'Course'}) already exists for ${normDate}.`);
    } else {
      setErrorMessage(null);
    }
  }, [dateVal, scores, editingScoreId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    if (scoreVal < 1 || scoreVal > 45) {
      setErrorMessage('Stableford scores must be between 1 and 45.');
      return;
    }

    setIsSubmitting(true);

    try {
      if (editingScoreId) {
        const res = await fetch('/api/scores', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            scoreId: editingScoreId,
            score: scoreVal,
            date: dateVal,
            courseName: courseVal,
            userId,
          }),
        });

        const resData = await res.json();
        if (!res.ok) {
          throw new Error(resData.error || 'Failed to update score');
        }

        // Update local reactive store
        store.updateScore(editingScoreId, scoreVal, dateVal, courseVal, userId);
        setSuccessMessage(resData.message || 'Round updated successfully!');
        setEditingScoreId(null);
      } else {
        const res = await fetch('/api/scores', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            userId,
            score: scoreVal,
            date: dateVal,
            courseName: courseVal,
          }),
        });

        const resData = await res.json();
        if (!res.ok) {
          throw new Error(resData.error || 'Failed to record score');
        }

        if (resData.score) {
          const currentScores = store.getUserScores(userId).filter(s => s.id !== resData.score.id);
          store.syncUserScores(userId, [resData.score, ...currentScores]);
        } else {
          store.addScore(userId, scoreVal, dateVal, courseVal);
        }

        setSuccessMessage(resData.message || 'Round logged! Rolling 5-score window updated.');
        
        // Trigger celebratory confetti
        confetti({
          particleCount: 50,
          spread: 60,
          origin: { y: 0.7 },
          colors: ['#00F29D', '#00D2FF', '#FF6E40'],
        });
      }

      await loadScores();
      if (onScoresChange) onScoresChange();
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to record score.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditClick = (score: Score) => {
    setEditingScoreId(score.id);
    setScoreVal(score.score);
    setDateVal(score.date ? score.date.substring(0, 10) : new Date().toISOString().substring(0, 10));
    setCourseVal(score.course_name || '');
    setErrorMessage(null);
    setSuccessMessage(null);
  };

  const handleCancelEdit = () => {
    setEditingScoreId(null);
    setScoreVal(36);
    setDateVal(new Date().toISOString().substring(0, 10));
    setCourseVal('Pebble Beach Links');
    setErrorMessage(null);
    setSuccessMessage(null);
  };

  const handleDeleteClick = async (scoreId: string) => {
    if (confirm('Are you sure you want to remove this round?')) {
      try {
        await fetch(`/api/scores?id=${encodeURIComponent(scoreId)}`, {
          method: 'DELETE',
        });
      } catch (e) {
        // Fallback
      }
      store.deleteScore(scoreId);
      await loadScores();
      if (onScoresChange) onScoresChange();
    }
  };

  // Find oldest score that will be evicted on next insert
  const oldestScore = scores.length >= 5 ? scores[scores.length - 1] : null;
  const isLapsed = currentUser && currentUser.subscription_status !== 'active';

  return (
    <div className="space-y-8">
      {isLapsed ? (
        <div className="glass-panel-elevated rounded-3xl p-8 sm:p-12 border border-rose-500/30 text-center space-y-4 relative overflow-hidden">
          <div className="w-14 h-14 rounded-2xl bg-rose-500/10 border border-rose-500/30 flex items-center justify-center text-rose-400 mx-auto">
            <Lock className="w-7 h-7" />
          </div>
          <h3 className="text-2xl font-extrabold text-white">Score Entry Locked</h3>
          <p className="text-xs sm:text-sm text-[#94A3B8] max-w-lg mx-auto leading-relaxed">
            Your membership is currently <span className="text-rose-400 font-mono font-bold uppercase">{currentUser?.subscription_status}</span>. Real-time server validation requires an active subscription to log scores and participate in monthly jackpot draws.
          </p>
          <div className="pt-2">
            <Link
              href="/subscribe"
              className="px-8 py-3.5 rounded-xl btn-primary text-xs font-bold inline-flex items-center gap-2 shadow-xl shadow-[#00F29D]/20"
            >
              <span>Reactivate Subscription Now ($19/mo)</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      ) : (
        /* Entry Form Terminal */
        <div className="glass-panel-elevated rounded-3xl p-6 sm:p-8 border border-white/10 relative overflow-hidden">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-xl sm:text-2xl font-extrabold text-white flex items-center gap-2">
                <Trophy className="w-5 h-5 text-[#00F29D]" />
                {editingScoreId ? 'Edit Stableford Round' : 'Log Stableford Round'}
              </h3>
              <p className="text-xs sm:text-sm text-[#94A3B8] mt-1">
                Your last 5 scores determine your monthly algorithmic draw odds & handicap.
              </p>
            </div>

            {/* Slots indicator */}
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/5 border border-white/10">
              <span className="text-xs text-[#94A3B8]">Active Window:</span>
              <span className="text-xs font-mono font-bold text-[#00F29D]">{scores.length} / 5</span>
            </div>
          </div>

        {/* 6th Score Auto-Eviction Alert */}
        {!editingScoreId && scores.length >= 5 && (
          <div className="mb-6 p-3.5 rounded-xl bg-[#FF6E40]/10 border border-[#FF6E40]/30 flex items-start gap-3 text-xs text-[#FF6E40]">
            <Info className="w-4 h-4 mt-0.5 shrink-0" />
            <div>
              <span className="font-bold">Rolling 5 Window Active:</span> Adding a new score will auto-evict your oldest recorded score from{' '}
              <span className="font-mono underline">{oldestScore?.date}</span> ({oldestScore?.score} pts).
            </div>
          </div>
        )}

        {/* Duplicate Date Warning with Quick Fix */}
        {conflictingScore && (
          <div className="mb-6 p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-between gap-3 text-xs text-amber-300">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMessage}</span>
            </div>
            <button
              type="button"
              onClick={() => handleEditClick(conflictingScore)}
              className="px-3 py-1 rounded-lg bg-amber-400 text-black font-bold hover:bg-amber-300 transition-colors"
            >
              Edit That Round
            </button>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Tactile Score Value Stepper / Slider */}
          <div className="p-6 rounded-2xl bg-[#06080F]/70 border border-white/10">
            <div className="flex items-center justify-between mb-4">
              <label className="text-xs font-bold uppercase tracking-wider text-[#94A3B8]">
                Stableford Points (1 – 45)
              </label>
              <div className="flex items-center gap-2">
                <span className="text-3xl font-black text-white font-mono">{scoreVal}</span>
                <span className="text-xs text-[#00F29D] font-bold">PTS</span>
              </div>
            </div>

            {/* Slider with quick buttons */}
            <input
              type="range"
              min={1}
              max={45}
              value={scoreVal}
              onChange={e => setScoreVal(Number(e.target.value))}
              className="w-full h-2 bg-white/10 rounded-lg appearance-none cursor-pointer accent-[#00F29D]"
            />

            <div className="flex justify-between text-[11px] text-[#64748B] mt-2">
              <span>1 (Min)</span>
              <span>18 (Bogey Round)</span>
              <span>36 (Par Round)</span>
              <span>45 (Max)</span>
            </div>

            {/* Quick Adjustment Pills */}
            <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t border-white/5">
              {[28, 32, 36, 38, 40, 42].map(val => (
                <button
                  key={val}
                  type="button"
                  onClick={() => setScoreVal(val)}
                  className={`px-3 py-1 rounded-lg text-xs font-mono font-bold border transition-all ${
                    scoreVal === val
                      ? 'bg-[#00F29D]/20 border-[#00F29D] text-[#00F29D]'
                      : 'bg-white/5 border-white/10 text-[#94A3B8] hover:text-white'
                  }`}
                >
                  {val} pts
                </button>
              ))}
            </div>
          </div>

          {/* Date and Course Input */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[#94A3B8] mb-2">
                Round Date (One per date)
              </label>
              <div className="relative">
                <input
                  type="date"
                  required
                  value={dateVal}
                  onChange={e => setDateVal(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-[#06080F]/70 border border-white/10 text-white text-sm focus:outline-none focus:border-[#00F29D] transition-colors"
                />
              </div>
              {/* Date quick links */}
              <div className="flex gap-2 mt-2">
                <button
                  type="button"
                  onClick={() => setDateVal(new Date().toISOString().substring(0, 10))}
                  className="text-[11px] text-[#00F29D] hover:underline"
                >
                  Today
                </button>
                <span className="text-[#64748B]">•</span>
                <button
                  type="button"
                  onClick={() => {
                    const d = new Date();
                    d.setDate(d.getDate() - 1);
                    setDateVal(d.toISOString().substring(0, 10));
                  }}
                  className="text-[11px] text-[#94A3B8] hover:underline"
                >
                  Yesterday
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[#94A3B8] mb-2">
                Golf Course / Club Name
              </label>
              <input
                type="text"
                placeholder="e.g. Pinehurst No. 2"
                value={courseVal}
                onChange={e => setCourseVal(e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-[#06080F]/70 border border-white/10 text-white text-sm focus:outline-none focus:border-[#00F29D] transition-colors"
              />
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-3 pt-2">
            <button
              type="submit"
              disabled={Boolean(conflictingScore) || isSubmitting}
              className={`flex-1 py-4 rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition-all ${
                conflictingScore || isSubmitting
                  ? 'bg-white/10 text-white/40 cursor-not-allowed'
                  : 'btn-primary'
              }`}
            >
              {isSubmitting ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                  <span>{editingScoreId ? 'Updating Round...' : 'Saving Round...'}</span>
                </div>
              ) : editingScoreId ? (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Update Round</span>
                </>
              ) : (
                <>
                  <Plus className="w-4 h-4" />
                  <span>Save to Rolling 5 Window</span>
                </>
              )}
            </button>

            {editingScoreId && (
              <button
                type="button"
                onClick={handleCancelEdit}
                className="px-6 py-4 rounded-xl glass-panel text-sm font-semibold text-[#94A3B8] hover:text-white"
              >
                Cancel
              </button>
            )}
          </div>

          {successMessage && (
            <div className="p-3.5 rounded-xl bg-[#00F29D]/10 border border-[#00F29D]/30 text-xs text-[#00F29D] flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>{successMessage}</span>
            </div>
          )}
        </form>
      </div>
      )}

      {/* Active Rolling 5 Scores Presentation */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h4 className="text-lg font-bold text-white flex items-center gap-2">
            <History className="w-4 h-4 text-[#00F29D]" />
            Active Rolling 5 Scores
            <span className="text-xs text-[#64748B] font-normal">(Reverse Chronological)</span>
          </h4>
          <span className="text-xs text-[#94A3B8]">
            Avg: <strong className="text-white font-mono">
              {scores.length > 0
                ? (scores.reduce((a, b) => a + b.score, 0) / scores.length).toFixed(1)
                : 0}
            </strong> pts
          </span>
        </div>

        {scores.length === 0 ? (
          <div className="p-12 text-center rounded-3xl glass-panel border border-white/10">
            <Trophy className="w-12 h-12 text-[#64748B] mx-auto mb-3 opacity-50" />
            <p className="text-base font-semibold text-white">No Scores Logged Yet</p>
            <p className="text-xs text-[#94A3B8] mt-1">
              Log your first round above to generate your entry ticket numbers for the monthly jackpot draw!
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-5 gap-4">
            <AnimatePresence>
              {scores.map((sc, index) => (
                <motion.div
                  key={sc.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  transition={{ duration: 0.2, delay: index * 0.05 }}
                  className={`glass-panel rounded-2xl p-4 relative flex flex-col justify-between border transition-all ${
                    index === 0
                      ? 'border-[#00F29D]/40 bg-[#00F29D]/5 shadow-lg shadow-[#00F29D]/5'
                      : index === 4
                      ? 'border-white/10 opacity-75'
                      : 'border-white/10'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-white/5 text-[#94A3B8]">
                        #{index + 1} {index === 0 && '• LATEST'}
                        {index === 4 && '• OLDEST'}
                      </span>
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => handleEditClick(sc)}
                          className="text-white/40 hover:text-white transition-colors"
                          title="Edit score"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDeleteClick(sc.id)}
                          className="text-white/40 hover:text-rose-400 transition-colors"
                          title="Delete score"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    <div className="text-3xl font-black text-white font-mono my-2">
                      {sc.score}
                    </div>

                    <p className="text-xs font-semibold text-slate-300 truncate">
                      {sc.course_name || 'Home Course'}
                    </p>
                  </div>

                  <div className="mt-4 pt-3 border-t border-white/5 flex items-center justify-between text-[11px] text-[#64748B]">
                    <span>{sc.date}</span>
                    <span className="text-[#00F29D] font-mono text-[10px]">Verified</span>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>
    </div>
  );
}
