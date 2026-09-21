'use client';

import { useState, useEffect } from 'react';
import { eventBus, type DHEvent } from './events';

/**
 * React hook: subscribe to one or more events and trigger a re-render
 * when any of them fire. Returns a monotonically increasing tick counter.
 */
export function useRealtimeSync(events: DHEvent[]): number {
  const [tick, setTick] = useState(0);

  useEffect(() => {
    const unsubs = events.map(event =>
      eventBus.on(event, () => setTick(prev => prev + 1))
    );

    return () => {
      unsubs.forEach(unsub => unsub());
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [events.join(',')]);

  return tick;
}

/**
 * React hook: subscribe to ALL events (useful for admin dashboards
 * that need to stay in sync with everything).
 */
export function useRealtimeSyncAll(): number {
  const ALL_EVENTS: DHEvent[] = [
    'score:updated',
    'draw:published',
    'draw:simulated',
    'subscription:changed',
    'donation:added',
    'winner:updated',
    'charity:updated',
    'user:switched',
    'data:reset',
  ];

  return useRealtimeSync(ALL_EVENTS);
}
