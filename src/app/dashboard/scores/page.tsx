'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import TactileScorecard from '@/components/scoring/TactileScorecard';
import { store } from '@/lib/data/mock-db';
import { Profile } from '@/lib/types';

export default function ScoresPage() {
  const [user, setUser] = useState<Profile | null>(null);

  useEffect(() => {
    setUser(store.getCurrentUser());
  }, []);

  return (
    <main className="min-h-screen flex flex-col bg-[#06080F]">
      <Navbar />
      <div className="flex-1 max-w-4xl mx-auto w-full px-4 sm:px-6 pt-28 pb-20">
        <div className="mb-6">
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-1.5 text-xs text-[#94A3B8] hover:text-white transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Dashboard</span>
          </Link>
        </div>

        {user && <TactileScorecard userId={user.id} />}
      </div>
      <Footer />
    </main>
  );
}
