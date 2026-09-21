/**
 * Digital Heroes — Real-Time Event Bus
 *
 * Lightweight pub/sub system that enables instant UI reactivity
 * without requiring WebSockets or a live database.
 *
 * When store mutations occur (score added, draw published, etc.),
 * events are emitted and all subscribed components re-render.
 */

export type DHEvent =
  | 'score:updated'
  | 'draw:published'
  | 'draw:simulated'
  | 'subscription:changed'
  | 'donation:added'
  | 'winner:updated'
  | 'charity:updated'
  | 'user:switched'
  | 'data:reset';

type EventCallback = (payload?: any) => void;

class DigitalHeroesEventBus {
  private listeners: Map<DHEvent, Set<EventCallback>> = new Map();

  on(event: DHEvent, callback: EventCallback): () => void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event)!.add(callback);

    // Return unsubscribe function
    return () => {
      this.listeners.get(event)?.delete(callback);
    };
  }

  off(event: DHEvent, callback: EventCallback): void {
    this.listeners.get(event)?.delete(callback);
  }

  emit(event: DHEvent, payload?: any): void {
    this.listeners.get(event)?.forEach(cb => {
      try {
        cb(payload);
      } catch (e) {
        console.warn(`[EventBus] Error in listener for "${event}":`, e);
      }
    });
  }

  /** Remove all listeners (useful for testing or full teardown) */
  clear(): void {
    this.listeners.clear();
  }
}

// Global singleton — shared across all components
export const eventBus = new DigitalHeroesEventBus();

