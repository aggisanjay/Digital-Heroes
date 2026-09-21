'use client';

import React, { useEffect } from 'react';
import { usePathname } from 'next/navigation';

export default function SmoothScrollProvider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  useEffect(() => {
    // Reset window scroll position cleanly on route changes without fighting native scroll
    if (typeof window !== 'undefined') {
      window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
    }
  }, [pathname]);

  return <>{children}</>;
}
