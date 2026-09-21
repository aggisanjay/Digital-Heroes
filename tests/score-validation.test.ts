import { describe, it, expect, beforeEach } from 'vitest';
import { store } from '../src/lib/data/mock-db';

describe('Digital Heroes — Score Management & Rolling 5 Window Tests', () => {
  const testUserId = 'test-user-scoring';

  beforeEach(() => {
    store.resetToDefaults();
  });

  it('allows adding up to 5 scores on distinct dates', () => {
    store.addScore(testUserId, 36, '2026-09-01', 'Course 1');
    store.addScore(testUserId, 38, '2026-09-02', 'Course 2');
    store.addScore(testUserId, 40, '2026-09-03', 'Course 3');
    store.addScore(testUserId, 35, '2026-09-04', 'Course 4');
    store.addScore(testUserId, 42, '2026-09-05', 'Course 5');

    const scores = store.getUserScores(testUserId);
    expect(scores).toHaveLength(5);
    // Reverse chronological order (latest date first)
    expect(scores[0].date).toBe('2026-09-05');
    expect(scores[4].date).toBe('2026-09-01');
  });

  it('auto-evicts the oldest score when a 6th score is entered', () => {
    store.addScore(testUserId, 30, '2026-09-01', 'Oldest Round');
    store.addScore(testUserId, 31, '2026-09-02', 'Round 2');
    store.addScore(testUserId, 32, '2026-09-03', 'Round 3');
    store.addScore(testUserId, 33, '2026-09-04', 'Round 4');
    store.addScore(testUserId, 34, '2026-09-05', 'Round 5');

    // 6th score entered with newest date
    store.addScore(testUserId, 45, '2026-09-06', 'Brand New Round');

    const scores = store.getUserScores(testUserId);
    expect(scores).toHaveLength(5);
    // Newest is present
    expect(scores[0].score).toBe(45);
    expect(scores[0].date).toBe('2026-09-06');
    // Oldest (2026-09-01) must have been evicted!
    const dates = scores.map(s => s.date);
    expect(dates).not.toContain('2026-09-01');
    expect(dates).toContain('2026-09-02');
  });

  it('rejects duplicate dates for the same user', () => {
    store.addScore(testUserId, 36, '2026-09-10', 'Round 1');

    expect(() => {
      store.addScore(testUserId, 40, '2026-09-10', 'Conflicting Round');
    }).toThrow(/already exists for date/);
  });

  it('rejects invalid Stableford scores below 1 or above 45', () => {
    expect(() => {
      store.addScore(testUserId, 0, '2026-09-11');
    }).toThrow(/between 1 and 45/);

    expect(() => {
      store.addScore(testUserId, 46, '2026-09-11');
    }).toThrow(/between 1 and 45/);
  });

  it('allows updating an existing score without collision', () => {
    const sc = store.addScore(testUserId, 36, '2026-09-15', 'Initial Course');
    const updated = store.updateScore(sc.id, 41, '2026-09-15', 'Updated Course');

    expect(updated.score).toBe(41);
    expect(updated.course_name).toBe('Updated Course');
  });

  it('allows deleting a score and opening space in rolling window', () => {
    const sc = store.addScore(testUserId, 36, '2026-09-20', 'Round to delete');
    expect(store.getUserScores(testUserId)).toHaveLength(1);

    store.deleteScore(sc.id);
    expect(store.getUserScores(testUserId)).toHaveLength(0);
  });
});
