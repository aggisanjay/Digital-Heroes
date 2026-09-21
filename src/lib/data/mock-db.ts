import { Charity, Draw, Profile, Score, Winner, Donation, Subscription, SubscriptionStatus } from '../types';
import { executeDraw, type DrawConfig } from '../draw/engine';
import { eventBus } from '../events';

export const INITIAL_CHARITIES: Charity[] = [
  {
    id: 'a1111111-1111-1111-1111-111111111111',
    name: 'Fairway Foundation for Youth',
    slug: 'fairway-foundation',
    tagline: 'Empowering underserved youth through golf, leadership, and education.',
    description: 'The Fairway Foundation breaks economic barriers by providing equipment, professional coaching, STEM academic tutoring, and collegiate scholarship opportunities to youth from under-resourced communities across the nation.',
    logo_url: 'https://images.unsplash.com/photo-1535131749006-b7f58c99034b?w=150&auto=format&fit=crop&q=80',
    cover_image_url: 'https://images.unsplash.com/photo-1592919505780-303950717480?w=1200&auto=format&fit=crop&q=80',
    featured: true,
    total_raised: 148500.00,
    events: [
      { id: 'ev-1', title: 'Annual Heroes Invitational 2026', date: '2026-10-15', location: 'Pebble Beach Links', goal: 50000 },
      { id: 'ev-2', title: 'Next-Gen Junior Clinic', date: '2026-11-02', location: 'Metropolitan Golf Club', goal: 25000 }
    ],
    created_at: new Date('2026-01-01').toISOString(),
  },
  {
    id: 'b2222222-2222-2222-2222-222222222222',
    name: 'Veterans On The Green',
    slug: 'veterans-on-the-green',
    tagline: 'Rehabilitation, community, and mental wellness for military veterans.',
    description: 'Veterans On The Green utilizes adaptive golf training and peer-to-peer camaraderie to assist wounded veterans in physical recovery and combat PTSD, fostering purpose and lifelong support networks.',
    logo_url: 'https://images.unsplash.com/photo-1587174486073-ae5e5cff23aa?w=150&auto=format&fit=crop&q=80',
    cover_image_url: 'https://images.unsplash.com/photo-1593111774240-d529f12cf4bb?w=1200&auto=format&fit=crop&q=80',
    featured: false,
    total_raised: 94200.00,
    events: [
      { id: 'ev-3', title: 'Valor Pro-Am Challenge', date: '2026-11-18', location: 'Torrey Pines South', goal: 40000 }
    ],
    created_at: new Date('2026-01-01').toISOString(),
  },
  {
    id: 'c3333333-3333-3333-3333-333333333333',
    name: 'Green Links Environmental Trust',
    slug: 'green-links-trust',
    tagline: 'Championing biodiversity, water conservation, and eco-sustainable courses.',
    description: 'Dedicated to modernizing golf course management through indigenous flora revitalization, bird sanctuary restoration, and clean water conservation initiatives worldwide.',
    logo_url: 'https://images.unsplash.com/photo-1518241353330-0f7941c2d9b5?w=150&auto=format&fit=crop&q=80',
    cover_image_url: 'https://images.unsplash.com/photo-1500937386664-56d1dfef3854?w=1200&auto=format&fit=crop&q=80',
    featured: false,
    total_raised: 67800.00,
    events: [
      { id: 'ev-4', title: 'Eco-Cup Conservation Scramble', date: '2026-12-05', location: 'Pinehurst No. 2', goal: 30000 }
    ],
    created_at: new Date('2026-01-01').toISOString(),
  },
  {
    id: 'd4444444-4444-4444-4444-444444444444',
    name: 'Adaptive Sports Sanctuary',
    slug: 'adaptive-sports-sanctuary',
    tagline: 'Empowering para-athletes with adaptive golf and sports technology.',
    description: 'Providing specialized mobility carts, prosthetic sports adaptations, and national tournaments so athletes of all abilities can compete at peak performance levels.',
    logo_url: 'https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=150&auto=format&fit=crop&q=80',
    cover_image_url: 'https://images.unsplash.com/photo-1461896836934-ffe607ba8211?w=1200&auto=format&fit=crop&q=80',
    featured: false,
    total_raised: 81350.00,
    events: [
      { id: 'ev-5', title: 'Horizon Para-Golf Championship', date: '2026-10-28', location: 'Bethpage Black', goal: 35000 }
    ],
    created_at: new Date('2026-01-01').toISOString(),
  }
];

export const REAL_USER_IDS = {
  ADMIN: 'c347cde2-7b49-416c-a0d1-41d8e3d37d86',
};

export const INITIAL_PROFILES: Profile[] = [
  {
    id: REAL_USER_IDS.ADMIN,
    email: 'admin@digitalheroes.org',
    full_name: 'Marcus Vance',
    role: 'admin',
    subscription_status: 'active',
    charity_id: 'a1111111-1111-1111-1111-111111111111',
    charity_contribution_pct: 20.0,
    created_at: new Date('2026-01-01').toISOString(),
    updated_at: new Date('2026-01-01').toISOString(),
  },
];

export const INITIAL_SCORES: Score[] = [];


export const INITIAL_DRAWS: Draw[] = [
  {
    id: 'draw-2026-08',
    period: '2026-08',
    mode: 'algorithmic',
    status: 'published',
    target_numbers: [14, 22, 35, 38, 41],
    pool_total: 12450.00,
    active_subscribers_count: 1245,
    jackpot_rollover_in: 3200.00,
    jackpot_rollover_out: 8180.00, // Rolled over because 0 5-match winners
    tier_5_pool: 8180.00, // 40% ($4980) + $3200 rollover
    tier_4_pool: 4357.50, // 35%
    tier_3_pool: 3112.50, // 25%
    draw_date: '2026-08-31T20:00:00Z',
    published_at: '2026-08-31T20:05:00Z',
    created_at: '2026-08-31T19:00:00Z',
  }
];

export const INITIAL_WINNERS: Winner[] = [];


export const INITIAL_SUBSCRIPTIONS: Subscription[] = [];

// In-browser & Server unified repository
class DigitalHeroesStore {
  private profiles: Profile[] = [...INITIAL_PROFILES];
  private subscriptions: Subscription[] = [...INITIAL_SUBSCRIPTIONS];
  private charities: Charity[] = [...INITIAL_CHARITIES];
  private scores: Score[] = [...INITIAL_SCORES];
  private draws: Draw[] = [...INITIAL_DRAWS];
  private winners: Winner[] = [...INITIAL_WINNERS];
  private donations: Donation[] = [];
  private currentUserId: string | null = null;

  constructor() {
    if (typeof window !== 'undefined') {
      this.loadFromLocalStorage();
    }
  }

  private saveToLocalStorage() {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem('dh_profiles', JSON.stringify(this.profiles));
      localStorage.setItem('dh_subscriptions', JSON.stringify(this.subscriptions));
      localStorage.setItem('dh_charities', JSON.stringify(this.charities));
      localStorage.setItem('dh_scores', JSON.stringify(this.scores));
      localStorage.setItem('dh_draws', JSON.stringify(this.draws));
      localStorage.setItem('dh_winners', JSON.stringify(this.winners));
      localStorage.setItem('dh_donations', JSON.stringify(this.donations));
      if (this.currentUserId) {
        localStorage.setItem('dh_current_user_id', this.currentUserId);
      } else {
        localStorage.removeItem('dh_current_user_id');
      }
    } catch (e) {
      console.warn('LocalStorage save failed:', e);
    }
  }

  private loadFromLocalStorage() {
    try {
      const storedProfiles = localStorage.getItem('dh_profiles');
      if (storedProfiles) {
        const parsed = JSON.parse(storedProfiles);
        // Filter out legacy dummy profiles
        this.profiles = parsed.filter((p: Profile) => 
          p.email !== 'alex.morgan@example.com' && 
          p.email !== 'sarah.jenkins@example.com' && 
          p.email !== 'elena.rostova@example.com' &&
          !p.id.startsWith('sub-') &&
          !p.id.startsWith('usr-')
        );
      }

      const storedSubs = localStorage.getItem('dh_subscriptions');
      if (storedSubs) {
        const parsed = JSON.parse(storedSubs);
        this.subscriptions = parsed.filter((s: Subscription) => !s.id.startsWith('sub-rec-00') && !s.user_id.startsWith('sub-'));
      }

      const storedCharities = localStorage.getItem('dh_charities');
      if (storedCharities) this.charities = JSON.parse(storedCharities);

      const storedScores = localStorage.getItem('dh_scores');
      if (storedScores) {
        const parsed = JSON.parse(storedScores);
        this.scores = parsed.filter((s: Score) => !s.id.startsWith('sc-') && !s.user_id.startsWith('sub-'));
      }

      const storedDraws = localStorage.getItem('dh_draws');
      if (storedDraws) this.draws = JSON.parse(storedDraws);

      const storedWinners = localStorage.getItem('dh_winners');
      if (storedWinners) {
        const parsed = JSON.parse(storedWinners);
        this.winners = parsed.filter((w: Winner) => 
          w && 
          w.user_id && 
          !w.user_id.startsWith('sub-') && 
          !w.user_id.startsWith('usr-')
        );
      }

      const storedDonations = localStorage.getItem('dh_donations');
      if (storedDonations) this.donations = JSON.parse(storedDonations);

      const storedCurrentUserId = localStorage.getItem('dh_current_user_id');
      if (
        storedCurrentUserId && 
        storedCurrentUserId !== 'sub-001' && 
        storedCurrentUserId !== 'sub-002' && 
        storedCurrentUserId !== 'sub-004' && 
        storedCurrentUserId !== 'visitor'
      ) {
        this.currentUserId = storedCurrentUserId;
      } else {
        this.currentUserId = null;
      }
    } catch (e) {
      console.warn('LocalStorage load failed:', e);
    }
  }


  // --- Subscriptions Lifecycle ---
  getUserSubscription(userId: string): Subscription | null {
    return this.subscriptions.find(s => s.user_id === userId) || null;
  }

  createOrUpdateSubscription(
    userId: string,
    planType: 'monthly' | 'yearly',
    status: SubscriptionStatus = 'active',
    stripeSubId?: string
  ): Subscription {
    const existingIdx = this.subscriptions.findIndex(s => s.user_id === userId);
    const now = new Date();
    const periodEnd = new Date(now);
    if (planType === 'yearly') {
      periodEnd.setFullYear(now.getFullYear() + 1);
    } else {
      periodEnd.setMonth(now.getMonth() + 1);
    }

    if (existingIdx !== -1) {
      this.subscriptions[existingIdx] = {
        ...this.subscriptions[existingIdx],
        plan_type: planType,
        status,
        stripe_subscription_id: stripeSubId || this.subscriptions[existingIdx].stripe_subscription_id,
        current_period_start: now.toISOString(),
        current_period_end: periodEnd.toISOString(),
        cancel_at_period_end: false,
        updated_at: now.toISOString(),
      };
      this.updateProfile(userId, { subscription_status: status });
      this.saveToLocalStorage();
      eventBus.emit('subscription:changed', { userId, status });
      return this.subscriptions[existingIdx];
    }

    const newSub: Subscription = {
      id: 'sub-rec-' + Math.random().toString(36).substring(2, 9),
      user_id: userId,
      stripe_customer_id: 'cus_' + Math.random().toString(36).substring(2, 10),
      stripe_subscription_id: stripeSubId || 'sub_stripe_' + Math.random().toString(36).substring(2, 8),
      plan_type: planType,
      status,
      current_period_start: now.toISOString(),
      current_period_end: periodEnd.toISOString(),
      cancel_at_period_end: false,
      created_at: now.toISOString(),
      updated_at: now.toISOString(),
    };

    this.subscriptions.push(newSub);
    this.updateProfile(userId, { subscription_status: status });
    this.saveToLocalStorage();
    eventBus.emit('subscription:changed', { userId, status });
    return newSub;
  }

  cancelSubscription(userId: string): Subscription {
    const idx = this.subscriptions.findIndex(s => s.user_id === userId);
    if (idx === -1) throw new Error('Subscription not found');

    this.subscriptions[idx] = {
      ...this.subscriptions[idx],
      status: 'canceled',
      cancel_at_period_end: true,
      updated_at: new Date().toISOString(),
    };

    this.updateProfile(userId, { subscription_status: 'canceled' });
    this.saveToLocalStorage();
    eventBus.emit('subscription:changed', { userId, status: 'canceled' });
    return this.subscriptions[idx];
  }

  reactivateSubscription(userId: string, planType: 'monthly' | 'yearly' = 'monthly'): Subscription {
    return this.createOrUpdateSubscription(userId, planType, 'active');
  }

  // --- Auth & Profile ---
  getProfile(userId: string): Profile | null {
    if (!userId || userId === 'visitor') return null;
    const p = this.profiles.find(u => u.id === userId);
    if (!p) return null;
    if (p.charity_id && !p.charity) {
      p.charity = this.charities.find(c => c.id === p.charity_id) || null;
    }
    return p;
  }

  getCurrentUser(): Profile | null {
    if (this.currentUserId === 'visitor' || !this.currentUserId) {
      if (typeof window !== 'undefined') {
        const storedId = localStorage.getItem('dh_current_user_id');
        if (storedId && storedId !== 'visitor') {
          this.currentUserId = storedId;
        }
      }
    }
    if (this.currentUserId === 'visitor' || !this.currentUserId) return null;
    let p = this.profiles.find(u => u.id === this.currentUserId);
    if (!p && typeof window !== 'undefined') {
      const storedEmail = localStorage.getItem('dh_user_email');
      if (storedEmail) {
        p = this.profiles.find(u => u.email && u.email.toLowerCase() === storedEmail.toLowerCase());
      }
    }
    if (!p) return null;
    if (p && p.charity_id && !p.charity) {
      p.charity = this.charities.find(c => c.id === p.charity_id) || null;
    }
    return p;
  }

  setProfile(profile: Profile) {
    const idx = this.profiles.findIndex(u => u.id === profile.id || u.email.toLowerCase() === profile.email.toLowerCase());
    if (idx !== -1) {
      this.profiles[idx] = { ...this.profiles[idx], ...profile, id: profile.id };
    } else {
      this.profiles.push(profile);
    }
    this.currentUserId = profile.id;
    if (typeof window !== 'undefined') {
      localStorage.setItem('dh_user_email', profile.email);
    }
    this.saveToLocalStorage();
    eventBus.emit('user:switched', { userId: profile.id });
  }

  logout() {
    this.currentUserId = null;
    this.saveToLocalStorage();
    eventBus.emit('user:switched', { userId: 'visitor' });
  }

  setCurrentUser(userId: string | null) {
    this.currentUserId = userId;
    this.saveToLocalStorage();
    eventBus.emit('user:switched', { userId: userId || 'visitor' });
  }

  login(email: string): Profile {
    let p = this.profiles.find(u => u.email.toLowerCase() === email.toLowerCase());
    if (!p) {
      // Auto-create new user with inactive subscription
      p = {
        id: 'usr-' + Math.random().toString(36).substring(2, 9),
        email,
        full_name: email.split('@')[0].replace('.', ' '),
        role: email.toLowerCase().includes('admin') ? 'admin' : 'subscriber',
        subscription_status: 'inactive',
        charity_id: this.charities[0].id,
        charity_contribution_pct: 10.0,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      this.profiles.push(p);
    }
    this.currentUserId = p.id;
    this.saveToLocalStorage();
    eventBus.emit('user:switched', { userId: p.id });
    return p;
  }

  register(email: string, fullName: string, charityId: string, plan: 'monthly' | 'yearly'): Profile {
    let user = this.profiles.find(u => u.email.toLowerCase() === email.toLowerCase());
    if (user) {
      if (fullName) user.full_name = fullName;
      if (charityId) user.charity_id = charityId;
      user.updated_at = new Date().toISOString();
    } else {
      user = {
        id: 'usr-' + Math.random().toString(36).substring(2, 9),
        email,
        full_name: fullName,
        role: 'subscriber',
        subscription_status: 'inactive',
        charity_id: charityId || this.charities[0].id,
        charity_contribution_pct: 10.0,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      this.profiles.push(user);
    }
    this.currentUserId = user.id;
    this.saveToLocalStorage();
    eventBus.emit('user:switched', { userId: user.id });
    return user;
  }


  updateProfile(userId: string, updates: Partial<Profile>): Profile {
    let idx = this.profiles.findIndex(u => u.id === userId);
    if (idx === -1) {
      const newProfile: Profile = {
        id: userId,
        email: updates.email || 'user@example.com',
        full_name: updates.full_name || 'Player',
        role: updates.role || 'subscriber',
        subscription_status: updates.subscription_status || 'inactive',
        charity_id: updates.charity_id || null,
        charity_contribution_pct: updates.charity_contribution_pct || 10,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      this.profiles.push(newProfile);
      this.saveToLocalStorage();
      return newProfile;
    }
    this.profiles[idx] = {
      ...this.profiles[idx],
      ...updates,
      updated_at: new Date().toISOString(),
    };
    this.saveToLocalStorage();
    return this.profiles[idx];
  }

  getAllUsers(): Profile[] {
    return this.profiles.map(p => ({
      ...p,
      charity: this.charities.find(c => c.id === p.charity_id) || null,
    }));
  }

  // --- Charities ---
  getCharities(): Charity[] {
    return this.charities;
  }

  getCharityBySlug(slug: string): Charity | null {
    return this.charities.find(c => c.slug === slug) || null;
  }

  createCharity(charity: Omit<Charity, 'id' | 'total_raised' | 'created_at'>): Charity {
    const newCharity: Charity = {
      ...charity,
      id: 'ch-' + Math.random().toString(36).substring(2, 9),
      total_raised: 0,
      created_at: new Date().toISOString(),
    };
    this.charities.push(newCharity);
    this.saveToLocalStorage();
    return newCharity;
  }

  updateCharity(id: string, updates: Partial<Charity>): Charity {
    const idx = this.charities.findIndex(c => c.id === id);
    if (idx === -1) throw new Error('Charity not found');
    this.charities[idx] = { ...this.charities[idx], ...updates };
    this.saveToLocalStorage();
    return this.charities[idx];
  }

  deleteCharity(id: string) {
    this.charities = this.charities.filter(c => c.id !== id);
    this.saveToLocalStorage();
  }

  // --- Scores (Rolling 5 scores window with unique date constraint) ---
  getUserScores(userId: string): Score[] {
    return this.scores
      .filter(s => s.user_id === userId)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 5);
  }

  getAllUserScores(userId: string): Score[] {
    return this.scores
      .filter(s => s.user_id === userId)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }

  addScore(userId: string, scoreVal: number, date: string, courseName?: string): Score {
    // 1. Validate Stableford range 1 - 45
    if (scoreVal < 1 || scoreVal > 45) {
      throw new Error('Stableford score must be between 1 and 45.');
    }

    // 2. Check for duplicate date
    const existingDateScore = this.scores.find(s => s.user_id === userId && s.date === date);
    if (existingDateScore) {
      throw new Error(`A score already exists for date ${date}. Please edit or delete that entry.`);
    }

    // 3. Create new score
    const newScore: Score = {
      id: 'sc-' + Math.random().toString(36).substring(2, 9),
      user_id: userId,
      score: scoreVal,
      date,
      course_name: courseName || 'Local Course',
      created_at: new Date().toISOString(),
    };

    this.scores.push(newScore);

    // 4. Enforce Rolling 5 Window: Keep only the 5 most recent scores by date
    const userScores = this.scores
      .filter(s => s.user_id === userId)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    if (userScores.length > 5) {
      const idsToKeep = new Set(userScores.slice(0, 5).map(s => s.id));
      this.scores = this.scores.filter(s => s.user_id !== userId || idsToKeep.has(s.id));
    }

    this.saveToLocalStorage();
    eventBus.emit('score:updated', { userId, scoreId: newScore.id });
    return newScore;
  }

  syncUserScores(userId: string, fetchedScores: Score[]) {
    if (!Array.isArray(fetchedScores)) return;
    const otherScores = this.scores.filter(s => s.user_id !== userId);
    this.scores = [...otherScores, ...fetchedScores];
    this.saveToLocalStorage();
    eventBus.emit('score:updated', { userId });
  }

  updateScore(scoreId: string, scoreVal: number, date: string, courseName?: string, userId?: string): Score {
    let idx = this.scores.findIndex(s => s.id === scoreId);

    if (scoreVal < 1 || scoreVal > 45) {
      throw new Error('Stableford score must be between 1 and 45.');
    }

    const normDate = date ? date.substring(0, 10) : new Date().toISOString().substring(0, 10);

    // Fallback: search by date and user if exact ID was not found
    if (idx === -1) {
      idx = this.scores.findIndex(
        s => (s.date && s.date.substring(0, 10) === normDate) && (!userId || s.user_id === userId)
      );
    }

    // If still not found, upsert into scores
    if (idx === -1) {
      const targetUserId = userId || this.getCurrentUser()?.id || 'user';
      const newScore: Score = {
        id: scoreId,
        user_id: targetUserId,
        score: scoreVal,
        date: normDate,
        course_name: courseName || 'Local Course',
        created_at: new Date().toISOString(),
      };
      this.scores.unshift(newScore);
      this.saveToLocalStorage();
      eventBus.emit('score:updated', { scoreId, userId: targetUserId });
      return newScore;
    }

    // Check if new date collides with another score for the same user
    const targetUserId = this.scores[idx].user_id;
    const collision = this.scores.find(
      s => s.user_id === targetUserId && s.id !== this.scores[idx].id && s.date && s.date.substring(0, 10) === normDate
    );
    if (collision) {
      throw new Error(`A score already exists for date ${normDate}.`);
    }

    this.scores[idx] = {
      ...this.scores[idx],
      score: scoreVal,
      date: normDate,
      course_name: courseName || this.scores[idx].course_name,
    };
    this.saveToLocalStorage();
    eventBus.emit('score:updated', { scoreId: this.scores[idx].id, userId: targetUserId });
    return this.scores[idx];
  }

  deleteScore(scoreId: string) {
    this.scores = this.scores.filter(s => s.id !== scoreId);
    this.saveToLocalStorage();
    eventBus.emit('score:updated', { scoreId });
  }

  // --- Draws & Simulation ---
  getDraws(): Draw[] {
    return [...this.draws].sort((a, b) => new Date(b.draw_date).getTime() - new Date(a.draw_date).getTime());
  }

  getPublishedDraws(): Draw[] {
    return this.draws
      .filter(d => d.status === 'published')
      .sort((a, b) => new Date(b.draw_date).getTime() - new Date(a.draw_date).getTime());
  }

  getLatestJackpotRollover(): number {
    const published = this.getPublishedDraws();
    if (published.length === 0) return 3200.00;
    return published[0].jackpot_rollover_out;
  }

  simulateDraw(mode: 'random' | 'algorithmic', targetNumbers: number[]): any {
    const activeSubscribers = this.profiles.filter(p => p.subscription_status === 'active');
    const subscriberCount = Math.max(activeSubscribers.length, 120); // Baseline active simulation pool
    const rolloverIn = this.getLatestJackpotRollover();

    const config: DrawConfig = {
      period: new Date().toISOString().substring(0, 7),
      mode,
      activeSubscriberCount: subscriberCount,
      prizeContributionPerUser: 10.00,
      jackpotRolloverIn: rolloverIn,
      targetNumbers,
    };

    // Gather entries
    const entries = activeSubscribers.map(sub => {
      const userScores = this.getUserScores(sub.id).map(s => s.score);
      return {
        userId: sub.id,
        userName: sub.full_name || sub.email,
        scores: userScores.length > 0 ? userScores : [12, 24, 33, 38, 42],
      };
    });

    return executeDraw(config, entries);
  }

  publishDraw(mode: 'random' | 'algorithmic', targetNumbers: number[]): Draw {
    const sim = this.simulateDraw(mode, targetNumbers);
    const newDraw: Draw = {
      id: 'draw-' + new Date().toISOString().substring(0, 7) + '-' + Math.random().toString(36).substring(2, 6),
      period: sim.period,
      mode,
      status: 'published',
      target_numbers: targetNumbers,
      pool_total: sim.totalCyclePool,
      active_subscribers_count: sim.activeSubscriberCount,
      jackpot_rollover_in: sim.tiers.tier5.rolloverIn,
      jackpot_rollover_out: sim.nextJackpotRolloverOut,
      tier_5_pool: sim.tiers.tier5.totalPool,
      tier_4_pool: sim.tiers.tier4.totalPool,
      tier_3_pool: sim.tiers.tier3.totalPool,
      draw_date: new Date().toISOString(),
      published_at: new Date().toISOString(),
      created_at: new Date().toISOString(),
    };

    this.draws.unshift(newDraw);

    // Create winner records
    for (const w of sim.winners) {
      this.winners.unshift({
        id: 'win-' + Math.random().toString(36).substring(2, 9),
        draw_id: newDraw.id,
        user_id: w.userId,
        tier: w.tier,
        amount: w.prizeAmount,
        payout_status: 'pending',
        proof_url: null,
        proof_status: 'unsubmitted',
        proof_rejection_reason: null,
        reviewed_by: null,
        reviewed_at: null,
        paid_at: null,
        created_at: new Date().toISOString(),
      });
    }

    this.saveToLocalStorage();
    eventBus.emit('draw:published', { drawId: newDraw.id });
    return newDraw;
  }

  // --- Winners & Proofs ---
  getWinners(): Winner[] {
    return this.winners.map(w => ({
      ...w,
      draw: this.draws.find(d => d.id === w.draw_id),
      profile: this.profiles.find(p => p.id === w.user_id),
    }));
  }

  getUserWinnings(userId: string): Winner[] {
    return this.winners
      .filter(w => w.user_id === userId)
      .map(w => ({
        ...w,
        draw: this.draws.find(d => d.id === w.draw_id),
      }));
  }

  createTestWinning(userId: string, amount: number = 3112.50, tier: 3 | 4 | 5 = 3): Winner {
    const latestDraw = this.draws[0] || { id: 'draw-2026-08' };
    const newWin: Winner = {
      id: 'win-' + Math.random().toString(36).substring(2, 9),
      draw_id: latestDraw.id,
      user_id: userId,
      tier,
      amount,
      payout_status: 'pending',
      proof_status: 'unsubmitted',
      proof_url: null,
      proof_rejection_reason: null,
      reviewed_by: null,
      reviewed_at: null,
      paid_at: null,
      created_at: new Date().toISOString(),
    };
    this.winners.unshift(newWin);
    this.saveToLocalStorage();
    eventBus.emit('winner:updated', { winnerId: newWin.id, userId });
    return newWin;
  }

  clearUserWinnings(userId: string) {
    this.winners = this.winners.filter(w => w.user_id !== userId);
    this.saveToLocalStorage();
    eventBus.emit('winner:updated', { userId });
  }

  submitWinnerProof(winnerId: string, proofUrl: string) {
    const idx = this.winners.findIndex(w => w.id === winnerId);
    if (idx === -1) {
      const fallbackWin: Winner = {
        id: winnerId,
        draw_id: this.draws[0]?.id || 'draw-latest',
        user_id: this.currentUserId || 'unknown-user',
        tier: 5,
        amount: 3680,
        payout_status: 'pending',
        proof_url: proofUrl,
        proof_status: 'submitted',
        proof_rejection_reason: null,
        reviewed_by: null,
        reviewed_at: null,
        paid_at: null,
        created_at: new Date().toISOString(),
      };
      this.winners.unshift(fallbackWin);
      this.saveToLocalStorage();
      eventBus.emit('winner:updated', { winnerId });
      return fallbackWin;
    }
    this.winners[idx] = {
      ...this.winners[idx],
      proof_url: proofUrl,
      proof_status: 'submitted',
      proof_rejection_reason: null,
    };
    this.saveToLocalStorage();
    eventBus.emit('winner:updated', { winnerId });
    return this.winners[idx];
  }

  reviewWinnerProof(winnerId: string, adminId: string, approved: boolean, rejectionReason?: string) {
    const idx = this.winners.findIndex(w => w.id === winnerId);
    if (idx === -1) {
      const fallbackWin: Winner = {
        id: winnerId,
        draw_id: this.draws[0]?.id || 'draw-latest',
        user_id: this.currentUserId || 'unknown-user',
        tier: 5,
        amount: 3680,
        payout_status: 'pending',
        proof_url: 'https://images.unsplash.com/photo-1592919505780-303950717480?w=1200&auto=format&fit=crop&q=80',
        proof_status: approved ? 'approved' : 'rejected',
        proof_rejection_reason: approved ? null : (rejectionReason || 'Proof could not be validated.'),
        reviewed_by: adminId,
        reviewed_at: new Date().toISOString(),
        paid_at: null,
        created_at: new Date().toISOString(),
      };
      this.winners.unshift(fallbackWin);
      this.saveToLocalStorage();
      eventBus.emit('winner:updated', { winnerId, status: approved ? 'approved' : 'rejected' });
      return fallbackWin;
    }
    this.winners[idx] = {
      ...this.winners[idx],
      proof_status: approved ? 'approved' : 'rejected',
      proof_rejection_reason: approved ? null : (rejectionReason || 'Proof could not be validated against official tournament record.'),
      reviewed_by: adminId,
      reviewed_at: new Date().toISOString(),
    };
    this.saveToLocalStorage();
    eventBus.emit('winner:updated', { winnerId, status: approved ? 'approved' : 'rejected' });
    return this.winners[idx];
  }

  markWinnerPaid(winnerId: string, adminId: string) {
    const idx = this.winners.findIndex(w => w.id === winnerId);
    if (idx === -1) {
      const fallbackWin: Winner = {
        id: winnerId,
        draw_id: this.draws[0]?.id || 'draw-latest',
        user_id: this.currentUserId || 'unknown-user',
        tier: 5,
        amount: 3680,
        payout_status: 'paid',
        proof_url: 'https://images.unsplash.com/photo-1592919505780-303950717480?w=1200&auto=format&fit=crop&q=80',
        proof_status: 'approved',
        proof_rejection_reason: null,
        reviewed_by: adminId,
        reviewed_at: new Date().toISOString(),
        paid_at: new Date().toISOString(),
        created_at: new Date().toISOString(),
      };
      this.winners.unshift(fallbackWin);
      this.saveToLocalStorage();
      eventBus.emit('winner:updated', { winnerId, status: 'paid' });
      return fallbackWin;
    }
    this.winners[idx] = {
      ...this.winners[idx],
      payout_status: 'paid',
      paid_at: new Date().toISOString(),
      reviewed_by: adminId,
    };
    this.saveToLocalStorage();
    eventBus.emit('winner:updated', { winnerId, status: 'paid' });
    return this.winners[idx];
  }

  // --- Donations ---
  addDonation(charityId: string, amount: number, donorName?: string, donorEmail?: string, userId?: string): Donation {
    const newDonation: Donation = {
      id: 'don-' + Math.random().toString(36).substring(2, 9),
      user_id: userId || null,
      charity_id: charityId,
      donor_name: donorName || 'Anonymous Hero',
      donor_email: donorEmail || null,
      amount,
      stripe_payment_id: 'ch_test_' + Math.random().toString(36).substring(2, 12),
      status: 'succeeded',
      created_at: new Date().toISOString(),
    };
    this.donations.unshift(newDonation);

    // Update charity total raised
    const cIdx = this.charities.findIndex(c => c.id === charityId);
    if (cIdx !== -1) {
      this.charities[cIdx].total_raised = Number(this.charities[cIdx].total_raised) + Number(amount);
    }

    this.saveToLocalStorage();
    eventBus.emit('donation:added', { charityId, amount });
    return newDonation;
  }

  getDonations(): Donation[] {
    return this.donations.map(d => ({
      ...d,
      charity: this.charities.find(c => c.id === d.charity_id),
    }));
  }

  // Reset state to clean real Supabase user state
  resetToDefaults() {
    this.profiles = [...INITIAL_PROFILES];
    this.charities = [...INITIAL_CHARITIES];
    this.scores = [...INITIAL_SCORES];
    this.draws = [...INITIAL_DRAWS];
    this.winners = [...INITIAL_WINNERS];
    this.subscriptions = [...INITIAL_SUBSCRIPTIONS];
    this.donations = [];
    this.currentUserId = null;
    if (typeof window !== 'undefined') {
      try {
        localStorage.clear();
      } catch (e) {}
    }
    this.saveToLocalStorage();
    eventBus.emit('data:reset');
    eventBus.emit('user:switched', { userId: 'visitor' });
  }

}

// Global singleton instance
export const store = new DigitalHeroesStore();
