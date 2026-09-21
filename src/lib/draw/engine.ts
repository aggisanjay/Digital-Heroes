/**
 * Digital Heroes — Core Draw & Prize Pool Calculation Engine
 * 
 * Implements isolated mathematical operations for:
 * - Active subscriber pool scaling
 * - 40% / 35% / 25% tier prize allocations
 * - Unclaimed 5-match jackpot rollover
 * - Equal prize splits among multiple winners with penny-perfect rounding
 * - Score matching against target numbers
 * - Algorithmic user score frequency & consistency weight calculations
 */

export interface SubscriberEntry {
  userId: string;
  userName?: string;
  userEmail?: string;
  scores: number[]; // Array of up to 5 Stableford scores (1-45)
  scoreDates?: string[];
  charityId?: string;
}

export interface DrawConfig {
  period: string;
  mode: 'random' | 'algorithmic';
  activeSubscriberCount: number;
  prizeContributionPerUser: number; // e.g., $10.00 from a $19 subscription
  jackpotRolloverIn: number; // Unclaimed rollover from previous draw
  targetNumbers: number[]; // 5 unique numbers in range 1-45
}

export interface TierSplit {
  tier: 5 | 4 | 3;
  percentage: number;
  basePool: number;
  rolloverIn: number;
  totalPool: number;
  winnersCount: number;
  prizePerWinner: number;
  unclaimedRolloverOut: number;
}

export interface DrawSimulationResult {
  period: string;
  mode: 'random' | 'algorithmic';
  activeSubscriberCount: number;
  totalCyclePool: number;
  totalAvailablePoolWithRollover: number;
  targetNumbers: number[];
  tiers: {
    tier5: TierSplit;
    tier4: TierSplit;
    tier3: TierSplit;
  };
  totalPrizeDistributed: number;
  nextJackpotRolloverOut: number;
  winners: {
    userId: string;
    userName?: string;
    tier: 5 | 4 | 3;
    matches: number;
    matchedNumbers: number[];
    prizeAmount: number;
  }[];
}

/**
 * Calculates algorithmic weight based on golf score frequency and consistency
 * - Frequency: Rewards logging up to the maximum 5 rolling scores (+0.2 per score)
 * - Consistency: Standard deviation bonus for consistent performance (+0.1 to +0.5)
 */
export function calculateAlgorithmicWeight(scores: number[]): number {
  if (!scores || scores.length === 0) return 1.0;
  
  const countBonus = (Math.min(scores.length, 5) / 5) * 1.0; // Up to +1.0
  
  let consistencyBonus = 0.2;
  if (scores.length >= 3) {
    const mean = scores.reduce((a, b) => a + b, 0) / scores.length;
    const variance = scores.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / scores.length;
    const stdDev = Math.sqrt(variance);
    // Lower standard deviation in Stableford indicates high consistency
    consistencyBonus = Math.max(0.1, Math.min(0.5, (10 - stdDev) * 0.05));
  }

  const totalWeight = 1.0 + countBonus + consistencyBonus;
  return Math.round(totalWeight * 100) / 100;
}

/**
 * Generates 5 unique random winning numbers in range 1 to 45
 */
export function generateDrawNumbers(): number[] {
  const numbers = new Set<number>();
  while (numbers.size < 5) {
    const n = Math.floor(Math.random() * 45) + 1;
    numbers.add(n);
  }
  return Array.from(numbers).sort((a, b) => a - b);
}

/**
 * Ensures every subscriber gets a complete, legitimate 5-number draw ticket.
 * Uses the player's unique logged scores (1-45), and fills any missing slots
 * with deterministic unique numbers seeded by (userId + period).
 */
export function getCompleteTicket(userId: string, scores: number[], period: string): number[] {
  const unique = Array.from(new Set(scores.filter(n => Number.isInteger(n) && n >= 1 && n <= 45)));
  let seed = 0;
  for (let i = 0; i < userId.length; i++) seed = (seed * 31 + userId.charCodeAt(i)) >>> 0;
  for (let i = 0; i < period.length; i++) seed = (seed * 17 + period.charCodeAt(i)) >>> 0;

  let candidate = (seed % 45) + 1;
  while (unique.length < 5) {
    if (!unique.includes(candidate)) {
      unique.push(candidate);
    }
    seed = (seed * 1664525 + 1013904223) >>> 0;
    candidate = (seed % 45) + 1;
  }
  return unique.slice(0, 5).sort((a, b) => a - b);
}

/**
 * Counts how many numbers match between target draw and user's score entry
 */
export function countMatches(entryScores: number[], targetNumbers: number[]): {
  count: number;
  matchedNumbers: number[];
} {
  const targetSet = new Set(targetNumbers);
  const matched = entryScores.filter(n => targetSet.has(n));
  // Unique matched numbers
  const uniqueMatched = Array.from(new Set(matched)).sort((a, b) => a - b);
  return {
    count: uniqueMatched.length,
    matchedNumbers: uniqueMatched,
  };
}

/**
 * Core Draw Execution & Simulation
 * Runs the deterministic prize distribution and winner calculation
 */
export function executeDraw(
  config: DrawConfig,
  entries: SubscriberEntry[]
): DrawSimulationResult {
  const {
    period,
    mode,
    activeSubscriberCount,
    prizeContributionPerUser,
    jackpotRolloverIn,
    targetNumbers,
  } = config;

  if (targetNumbers.length !== 5) {
    throw new Error('Draw targetNumbers must contain exactly 5 numbers.');
  }

  // 1. Calculate Base Pool from Active Subscribers
  const totalCyclePool = Math.round(activeSubscriberCount * prizeContributionPerUser * 100) / 100;

  // 2. Base Tier Allocations: 40% / 35% / 25%
  const tier5Base = Math.round(totalCyclePool * 0.40 * 100) / 100;
  const tier4Base = Math.round(totalCyclePool * 0.35 * 100) / 100;
  const tier3Base = Math.round(totalCyclePool * 0.25 * 100) / 100;

  // Tier 5 incorporates rollover
  const tier5Total = Math.round((tier5Base + jackpotRolloverIn) * 100) / 100;

  // 3. Match Evaluation
  const tier5Candidates: { entry: SubscriberEntry; matchedNumbers: number[] }[] = [];
  const tier4Candidates: { entry: SubscriberEntry; matchedNumbers: number[] }[] = [];
  const tier3Candidates: { entry: SubscriberEntry; matchedNumbers: number[] }[] = [];

  for (const entry of entries) {
    const fullTicket = getCompleteTicket(entry.userId, entry.scores || [], period);
    entry.scores = fullTicket; // Snapshot full ticket for audit
    const { count, matchedNumbers } = countMatches(fullTicket, targetNumbers);

    if (count === 5) {
      tier5Candidates.push({ entry, matchedNumbers });
    } else if (count === 4) {
      tier4Candidates.push({ entry, matchedNumbers });
    } else if (count === 3) {
      tier3Candidates.push({ entry, matchedNumbers });
    }
  }

  // 4. Equal Split Among Winners in Each Tier (Down to 2 decimals)
  const tier5WinnersCount = tier5Candidates.length;
  const tier4WinnersCount = tier4Candidates.length;
  const tier3WinnersCount = tier3Candidates.length;

  const tier5PrizePerWinner = tier5WinnersCount > 0 
    ? Math.floor((tier5Total / tier5WinnersCount) * 100) / 100 
    : 0;

  const tier4PrizePerWinner = tier4WinnersCount > 0 
    ? Math.floor((tier4Base / tier4WinnersCount) * 100) / 100 
    : 0;

  const tier3PrizePerWinner = tier3WinnersCount > 0 
    ? Math.floor((tier3Base / tier3WinnersCount) * 100) / 100 
    : 0;

  // 5. Rollover Logic:
  // If Tier 5 has 0 winners, entire Tier 5 pool (base + rolloverIn) rolls over to next cycle!
  const nextJackpotRolloverOut = tier5WinnersCount === 0 ? tier5Total : 0;

  // Build Winners List
  const winners: DrawSimulationResult['winners'] = [
    ...tier5Candidates.map(c => ({
      userId: c.entry.userId,
      userName: c.entry.userName,
      tier: 5 as const,
      matches: 5,
      matchedNumbers: c.matchedNumbers,
      prizeAmount: tier5PrizePerWinner,
    })),
    ...tier4Candidates.map(c => ({
      userId: c.entry.userId,
      userName: c.entry.userName,
      tier: 4 as const,
      matches: 4,
      matchedNumbers: c.matchedNumbers,
      prizeAmount: tier4PrizePerWinner,
    })),
    ...tier3Candidates.map(c => ({
      userId: c.entry.userId,
      userName: c.entry.userName,
      tier: 3 as const,
      matches: 3,
      matchedNumbers: c.matchedNumbers,
      prizeAmount: tier3PrizePerWinner,
    })),
  ];

  const totalPrizeDistributed = Math.round(
    (tier5PrizePerWinner * tier5WinnersCount +
     tier4PrizePerWinner * tier4WinnersCount +
     tier3PrizePerWinner * tier3WinnersCount) * 100
  ) / 100;

  return {
    period,
    mode,
    activeSubscriberCount,
    totalCyclePool,
    totalAvailablePoolWithRollover: Math.round((totalCyclePool + jackpotRolloverIn) * 100) / 100,
    targetNumbers,
    tiers: {
      tier5: {
        tier: 5,
        percentage: 40,
        basePool: tier5Base,
        rolloverIn: jackpotRolloverIn,
        totalPool: tier5Total,
        winnersCount: tier5WinnersCount,
        prizePerWinner: tier5PrizePerWinner,
        unclaimedRolloverOut: nextJackpotRolloverOut,
      },
      tier4: {
        tier: 4,
        percentage: 35,
        basePool: tier4Base,
        rolloverIn: 0,
        totalPool: tier4Base,
        winnersCount: tier4WinnersCount,
        prizePerWinner: tier4PrizePerWinner,
        unclaimedRolloverOut: 0,
      },
      tier3: {
        tier: 3,
        percentage: 25,
        basePool: tier3Base,
        rolloverIn: 0,
        totalPool: tier3Base,
        winnersCount: tier3WinnersCount,
        prizePerWinner: tier3PrizePerWinner,
        unclaimedRolloverOut: 0,
      },
    },
    totalPrizeDistributed,
    nextJackpotRolloverOut,
    winners,
  };
}

/**
 * Validates Stableford Score input
 * Must be an integer between 1 and 45 inclusive
 */
export function validateStablefordScore(score: number): { isValid: boolean; error?: string } {
  if (!Number.isInteger(score)) {
    return { isValid: false, error: 'Score must be a whole number.' };
  }
  if (score < 1 || score > 45) {
    return { isValid: false, error: 'Stableford score must be between 1 and 45.' };
  }
  return { isValid: true };
}

/**
 * Validates charity contribution percentage (minimum 10%, maximum 100%)
 */
export function validateCharityContributionPct(pct: number): { isValid: boolean; error?: string } {
  if (typeof pct !== 'number' || isNaN(pct)) {
    return { isValid: false, error: 'Contribution must be a valid number.' };
  }
  if (pct < 10) {
    return { isValid: false, error: 'Minimum charity contribution is 10%.' };
  }
  if (pct > 100) {
    return { isValid: false, error: 'Maximum charity contribution is 100%.' };
  }
  return { isValid: true };
}
