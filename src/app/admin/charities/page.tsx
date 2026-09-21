'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Heart, Plus, Edit2, Trash2, ArrowRight, CheckCircle2, RefreshCw } from 'lucide-react';
import { Charity } from '@/lib/types';

export default function AdminCharitiesPage() {
  const [charities, setCharities] = useState<Charity[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingCharity, setEditingCharity] = useState<Charity | null>(null);
  const [isNewCharity, setIsNewCharity] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const [charityForm, setCharityForm] = useState({
    name: '',
    slug: '',
    tagline: '',
    description: '',
    logo_url: '',
    cover_image_url: '',
    featured: false,
  });

  const loadCharities = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/charities');
      const data = await res.json();
      if (data.charities && Array.isArray(data.charities)) {
        setCharities(data.charities);
      }
    } catch (err) {
      console.error('Failed to load charities:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCharities();
  }, []);

  const handleSaveCharity = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (isNewCharity) {
        const res = await fetch('/api/charities', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(charityForm),
        });
        const data = await res.json();
        if (res.ok) {
          setToast('Charity created successfully!');
          setTimeout(() => setToast(null), 3000);
        } else {
          alert(data.error || 'Failed to create charity');
        }
      } else if (editingCharity) {
        const res = await fetch('/api/charities', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id: editingCharity.id, ...charityForm }),
        });
        const data = await res.json();
        if (res.ok) {
          setToast('Charity updated successfully!');
          setTimeout(() => setToast(null), 3000);
        } else {
          alert(data.error || 'Failed to update charity');
        }
      }
      setEditingCharity(null);
      setIsNewCharity(false);
      await loadCharities();
    } catch (err: any) {
      alert(err.message || 'Error saving charity');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteCharity = async (id: string) => {
    if (!confirm('Are you sure you want to delete this partner charity?')) return;
    try {
      const res = await fetch(`/api/charities?id=${encodeURIComponent(id)}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        setToast('Charity removed.');
        setTimeout(() => setToast(null), 3000);
        await loadCharities();
      } else {
        alert('Failed to delete charity');
      }
    } catch (err: any) {
      alert(err.message || 'Error deleting charity');
    }
  };

  return (
    <div className="space-y-6">
      {/* Toast Feedback */}
      {toast && (
        <div className="p-4 rounded-2xl bg-[#00F29D]/10 border border-[#00F29D]/30 text-xs text-[#00F29D] font-bold flex items-center gap-2 animate-in fade-in duration-200">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{toast}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <Heart className="w-6 h-6 text-[#FF6E40]" /> Partner Charity CMS
          </h1>
          <p className="text-xs text-[#94A3B8] mt-1">
            Manage supported charitable causes, edit organization profiles and banners, and monitor disbursements.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={loadCharities}
            className="p-2 rounded-xl glass-panel text-slate-400 hover:text-white"
            title="Refresh charities"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
          <button
            onClick={() => {
              setIsNewCharity(true);
              setEditingCharity(null);
              setCharityForm({
                name: '',
                slug: '',
                tagline: '',
                description: '',
                logo_url: '',
                cover_image_url: '',
                featured: false,
              });
            }}
            className="px-4 py-2 rounded-xl btn-charity text-xs font-bold flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" /> Add Partner Charity
          </button>
        </div>
      </div>

      {/* Charity Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {charities.length === 0 && !loading ? (
          <div className="col-span-2 p-12 text-center text-xs text-[#64748B] glass-panel rounded-3xl">
            No partner charities found. Click &quot;Add Partner Charity&quot; to establish your first supported cause.
          </div>
        ) : (
          charities.map(c => (
            <div
              key={c.id}
              className="glass-panel-elevated rounded-3xl p-6 border border-white/10 flex flex-col justify-between"
            >
              <div className="space-y-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <img
                      src={c.logo_url || 'https://images.unsplash.com/photo-1535131749006-b7f58c99034b?w=150&auto=format&fit=crop&q=80'}
                      alt={c.name}
                      className="w-12 h-12 rounded-2xl object-cover border border-white/10 bg-black/40"
                    />
                    <div>
                      <h4 className="text-base font-bold text-white">{c.name}</h4>
                      <p className="text-xs text-[#FF6E40]">{c.tagline}</p>
                    </div>
                  </div>
                  {c.featured && (
                    <span className="px-2 py-0.5 rounded bg-[#FF6E40]/20 text-[#FF6E40] text-[10px] font-bold">
                      Featured
                    </span>
                  )}
                </div>

                <p className="text-xs text-[#94A3B8] line-clamp-2 leading-relaxed">
                  {c.description}
                </p>

                <div className="p-3.5 rounded-xl bg-white/5 border border-white/5 flex items-center justify-between text-xs">
                  <span className="text-[#94A3B8]">Total Raised & Allocated:</span>
                  <span className="font-mono font-bold text-white">
                    ${Number(c.total_raised || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                  </span>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-white/10 flex items-center justify-between">
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      setEditingCharity(c);
                      setIsNewCharity(false);
                      setCharityForm({
                        name: c.name,
                        slug: c.slug,
                        tagline: c.tagline || '',
                        description: c.description,
                        logo_url: c.logo_url || '',
                        cover_image_url: c.cover_image_url || '',
                        featured: Boolean(c.featured),
                      });
                    }}
                    className="px-3 py-1.5 rounded-lg glass-panel text-xs text-[#00F29D] font-semibold hover:border-white/30"
                  >
                    Edit Details
                  </button>
                  <button
                    onClick={() => handleDeleteCharity(c.id)}
                    className="px-3 py-1.5 rounded-lg glass-panel text-xs text-rose-400 font-semibold hover:border-rose-400/30"
                  >
                    Delete
                  </button>
                </div>

                <Link
                  href={`/charities/${c.slug}`}
                  className="text-xs text-[#94A3B8] hover:text-white flex items-center gap-1"
                >
                  <span>Public Profile</span>
                  <ArrowRight className="w-3 h-3" />
                </Link>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Edit / Add Charity Modal */}
      {(editingCharity || isNewCharity) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="glass-panel-elevated rounded-3xl p-6 sm:p-8 max-w-xl w-full border border-white/10 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-bold text-white">
                {isNewCharity ? 'Create New Partner Charity' : 'Edit Partner Charity'}
              </h3>
              <button
                onClick={() => {
                  setEditingCharity(null);
                  setIsNewCharity(false);
                }}
                className="text-[#94A3B8] hover:text-white text-lg"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveCharity} className="space-y-4">
              <div>
                <label className="block text-xs text-[#94A3B8] mb-1 font-bold">Organization Name</label>
                <input
                  type="text"
                  required
                  value={charityForm.name}
                  onChange={e => setCharityForm({ ...charityForm, name: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-xs focus:outline-none focus:border-[#FF6E40]"
                />
              </div>
              <div>
                <label className="block text-xs text-[#94A3B8] mb-1 font-bold">Short Tagline</label>
                <input
                  type="text"
                  value={charityForm.tagline}
                  onChange={e => setCharityForm({ ...charityForm, tagline: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-xs focus:outline-none focus:border-[#FF6E40]"
                />
              </div>
              <div>
                <label className="block text-xs text-[#94A3B8] mb-1 font-bold">Description</label>
                <textarea
                  required
                  rows={3}
                  value={charityForm.description}
                  onChange={e => setCharityForm({ ...charityForm, description: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-xs focus:outline-none focus:border-[#FF6E40]"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-[#94A3B8] mb-1 font-bold">Logo URL</label>
                  <input
                    type="url"
                    value={charityForm.logo_url}
                    onChange={e => setCharityForm({ ...charityForm, logo_url: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-xs focus:outline-none focus:border-[#FF6E40]"
                  />
                </div>
                <div>
                  <label className="block text-xs text-[#94A3B8] mb-1 font-bold">Cover Image URL</label>
                  <input
                    type="url"
                    value={charityForm.cover_image_url}
                    onChange={e => setCharityForm({ ...charityForm, cover_image_url: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-xs focus:outline-none focus:border-[#FF6E40]"
                  />
                </div>
              </div>
              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="featured"
                  checked={charityForm.featured}
                  onChange={e => setCharityForm({ ...charityForm, featured: e.target.checked })}
                  className="accent-[#FF6E40] w-4 h-4 rounded"
                />
                <label htmlFor="featured" className="text-xs text-white cursor-pointer select-none">
                  Feature on Homepage Spotlight
                </label>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => {
                    setEditingCharity(null);
                    setIsNewCharity(false);
                  }}
                  className="px-4 py-2.5 rounded-xl glass-panel text-xs text-[#94A3B8] hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-6 py-2.5 rounded-xl btn-charity text-xs font-bold"
                >
                  {saving ? 'Saving...' : 'Save Charity'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
