import { describe, it, expect } from 'vitest';
import {
  executeDraw,
  calculateAlgorithmicWeight,
  generateDrawNumbers,
  countMatches,
  validateStablefordScore,
  validateCharityContributionPct,
  type SubscriberEntry,
  type DrawConfig,
} from '../src/lib/draw/engine';

describe('Digital Heroes — Draw & Prize Pool Engine Tests', () => {
  it('correctly calculates base pool and 40% / 35% / 25% tier splits', () => {
    // 1000 active subscribers, $10 prize contribution = $10,000 pool
    const config: DrawConfig = {
      period: '2026-10',
      mode: 'random',
      activeSubscriberCount: 1000,
      prizeContributionPerUser: 10,
      jackpotRolloverIn: 0,
      targetNumbers: [10, 20, 30, 40, 45],
    };

    const entries: SubscriberEntry[] = [];
    const result = executeDraw(config, entries);

    expect(result.totalCyclePool).toBe(10000);
    expect(result.tiers.tier5.basePool).toBe(4000); // 40%
    expect(result.tiers.tier4.basePool).toBe(3500); // 35%
    expect(result.tiers.tier3.basePool).toBe(2500); // 25%
    expect(result.nextJackpotRolloverOut).toBe(4000); // Rolls over since 0 winners in tier 5
  });

  it('splits prize pool equally among multiple winners in each tier', () => {
    const config: DrawConfig = {
      period: '2026-10',
      mode: 'random',
      activeSubscriberCount: 1000,
      prizeContributionPerUser: 10,
      jackpotRolloverIn: 0,
      targetNumbers: [10, 20, 30, 40, 45],
    };

    const entries: SubscriberEntry[] = [
      // 2 Winners with 5 matches
      { userId: 'u1', userName: 'Player 1', scores: [10, 20, 30, 40, 45] },
      { userId: 'u2', userName: 'Player 2', scores: [10, 20, 30, 40, 45] },
      // 5 Winners with 4 matches
      { userId: 'u3', userName: 'Player 3', scores: [10, 20, 30, 40, 1] },
      { userId: 'u4', userName: 'Player 4', scores: [10, 20, 30, 40, 2] },
      { userId: 'u5', userName: 'Player 5', scores: [10, 20, 30, 40, 3] },
      { userId: 'u6', userName: 'Player 6', scores: [10, 20, 30, 40, 4] },
      { userId: 'u7', userName: 'Player 7', scores: [10, 20, 30, 40, 5] },
      // 10 Winners with 3 matches
      ...Array.from({ length: 10 }).map((_, i) => ({
        userId: `u3_${i}`,
        scores: [10, 20, 30, i + 1, i + 6],
      })),
    ];

    const result = executeDraw(config, entries);

    // Tier 5: $4000 split between 2 winners = $2000 each
    expect(result.tiers.tier5.winnersCount).toBe(2);
    expect(result.tiers.tier5.prizePerWinner).toBe(2000);
    expect(result.nextJackpotRolloverOut).toBe(0); // Won, so zero rollover

    // Tier 4: $3500 split between 5 winners = $700 each
    expect(result.tiers.tier4.winnersCount).toBe(5);
    expect(result.tiers.tier4.prizePerWinner).toBe(700);

    // Tier 3: $2500 split between 10 winners = $250 each
    expect(result.tiers.tier3.winnersCount).toBe(10);
    expect(result.tiers.tier3.prizePerWinner).toBe(250);

    expect(result.totalPrizeDistributed).toBe(10000);
  });

  it('correctly incorporates incoming rollover into Tier 5 and carries forward when unclaimed', () => {
    const config: DrawConfig = {
      period: '2026-11',
      mode: 'random',
      activeSubscriberCount: 500,
      prizeContributionPerUser: 10,
      jackpotRolloverIn: 5000, // $5,000 carried over from previous month
      targetNumbers: [5, 15, 25, 35, 45],
    };

    // No 5-match winners
    const entries: SubscriberEntry[] = [
      { userId: 'u1', scores: [5, 15, 25, 35, 1] }, // 4 matches
    ];

    const result = executeDraw(config, entries);

    // Base Tier 5: 40% of $5,000 = $2,000 + $5,000 rollover = $7,000 total Tier 5
    expect(result.tiers.tier5.basePool).toBe(2000);
    expect(result.tiers.tier5.rolloverIn).toBe(5000);
    expect(result.tiers.tier5.totalPool).toBe(7000);
    expect(result.tiers.tier5.winnersCount).toBe(0);
    // Entire $7,000 rolls over to next period
    expect(result.nextJackpotRolloverOut).toBe(7000);
  });

  it('correctly awards rollover when Tier 5 has a winner', () => {
    const config: DrawConfig = {
      period: '2026-12',
      mode: 'random',
      activeSubscriberCount: 500,
      prizeContributionPerUser: 10,
      jackpotRolloverIn: 7000,
      targetNumbers: [5, 15, 25, 35, 45],
    };

    const entries: SubscriberEntry[] = [
      { userId: 'luckyWinner', scores: [5, 15, 25, 35, 45] },
    ];

    const result = executeDraw(config, entries);

    expect(result.tiers.tier5.winnersCount).toBe(1);
    expect(result.tiers.tier5.prizePerWinner).toBe(9000); // $2,000 base + $7,000 rollover
    expect(result.nextJackpotRolloverOut).toBe(0);
  });

  it('computes algorithmic weight rewarding score frequency and consistency', () => {
    // Single score
    const weight1 = calculateAlgorithmicWeight([36]);
    // Full 5 scores with varying standard deviations
    const weightConsistent = calculateAlgorithmicWeight([36, 37, 36, 35, 36]);
    const weightInconsistent = calculateAlgorithmicWeight([10, 45, 12, 44, 20]);

    expect(weightConsistent).toBeGreaterThan(weight1);
    expect(weightConsistent).toBeGreaterThan(weightInconsistent);
    expect(weightConsistent).toBeGreaterThanOrEqual(2.0);
  });

  it('generates exactly 5 unique sorted numbers in 1-45 range', () => {
    for (let i = 0; i < 20; i++) {
      const numbers = generateDrawNumbers();
      expect(numbers).toHaveLength(5);
      const unique = new Set(numbers);
      expect(unique.size).toBe(5);
      numbers.forEach(n => {
        expect(n).toBeGreaterThanOrEqual(1);
        expect(n).toBeLessThanOrEqual(45);
      });
      // Check sorted order
      for (let j = 0; j < 4; j++) {
        expect(numbers[j]).toBeLessThan(numbers[j + 1]);
      }
    }
  });

  it('validates Stableford score bounds and charity percentage requirements', () => {
    expect(validateStablefordScore(36).isValid).toBe(true);
    expect(validateStablefordScore(1).isValid).toBe(true);
    expect(validateStablefordScore(45).isValid).toBe(true);
    expect(validateStablefordScore(0).isValid).toBe(false);
    expect(validateStablefordScore(46).isValid).toBe(false);
    expect(validateStablefordScore(34.5).isValid).toBe(false);

    expect(validateCharityContributionPct(10).isValid).toBe(true);
    expect(validateCharityContributionPct(25).isValid).toBe(true);
    expect(validateCharityContributionPct(100).isValid).toBe(true);
    expect(validateCharityContributionPct(9.9).isValid).toBe(false);
    expect(validateCharityContributionPct(105).isValid).toBe(false);
  });
});
