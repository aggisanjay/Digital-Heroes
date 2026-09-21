-- ==============================================================================
-- DIGITAL HEROES MASTER SUPABASE ONLINE SCHEMA MIGRATION
-- Run this in your Supabase Online SQL Editor:
-- https://supabase.com/dashboard/project/xeqopglggsjgukezraii/sql/new
-- ==============================================================================

-- 1. EXTENSIONS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 2. CHARITIES TABLE & SEED
CREATE TABLE IF NOT EXISTS public.charities (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    tagline TEXT,
    description TEXT NOT NULL,
    logo_url TEXT,
    cover_image_url TEXT,
    featured BOOLEAN NOT NULL DEFAULT false,
    total_raised NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
    events JSONB NOT NULL DEFAULT '[]'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Seed Official Partner Charities
INSERT INTO public.charities (id, name, slug, tagline, description, logo_url, cover_image_url, featured, total_raised, events)
VALUES
(
    'a1111111-1111-1111-1111-111111111111',
    'Fairway Foundation for Youth',
    'fairway-foundation',
    'Empowering underserved youth through golf, leadership, and education.',
    'The Fairway Foundation breaks economic barriers by providing equipment, professional coaching, STEM academic tutoring, and collegiate scholarship opportunities to youth from under-resourced communities across the nation.',
    'https://images.unsplash.com/photo-1535131749006-b7f58c99034b?w=150&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1592919505780-303950717480?w=1200&auto=format&fit=crop&q=80',
    true,
    148500.00,
    '[
        {"id": "ev-1", "title": "Annual Heroes Invitational 2026", "date": "2026-10-15", "location": "Pebble Beach Links", "goal": 50000},
        {"id": "ev-2", "title": "Next-Gen Junior Clinic", "date": "2026-11-02", "location": "Metropolitan Golf Club", "goal": 25000}
    ]'::jsonb
),
(
    'b2222222-2222-2222-2222-222222222222',
    'Veterans On The Green',
    'veterans-on-the-green',
    'Rehabilitation, community, and mental wellness for military veterans.',
    'Veterans On The Green utilizes adaptive golf training and peer-to-peer camaraderie to assist wounded veterans in physical recovery and combat PTSD, fostering purpose and lifelong support networks.',
    'https://images.unsplash.com/photo-1587174486073-ae5e5cff23aa?w=150&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1593111774240-d529f12cf4bb?w=1200&auto=format&fit=crop&q=80',
    false,
    94200.00,
    '[
        {"id": "ev-3", "title": "Valor Pro-Am Challenge", "date": "2026-11-18", "location": "Torrey Pines South", "goal": 40000}
    ]'::jsonb
),
(
    'c3333333-3333-3333-3333-333333333333',
    'Green Links Environmental Trust',
    'green-links-trust',
    'Championing biodiversity, water conservation, and eco-sustainable courses.',
    'Dedicated to modernizing golf course management through indigenous flora revitalization, bird sanctuary restoration, and clean water conservation initiatives worldwide.',
    'https://images.unsplash.com/photo-1518241353330-0f7941c2d9b5?w=150&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1500937386664-56d1dfef3854?w=1200&auto=format&fit=crop&q=80',
    false,
    67800.00,
    '[
        {"id": "ev-4", "title": "Eco-Cup Conservation Scramble", "date": "2026-12-05", "location": "Pinehurst No. 2", "goal": 30000}
    ]'::jsonb
),
(
    'd4444444-4444-4444-4444-444444444444',
    'Adaptive Sports Sanctuary',
    'adaptive-sports-sanctuary',
    'Empowering para-athletes with adaptive golf and sports technology.',
    'Providing specialized mobility carts, prosthetic sports adaptations, and national tournaments so athletes of all abilities can compete at peak performance levels.',
    'https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=150&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1461896836934-ffe607ba8211?w=1200&auto=format&fit=crop&q=80',
    false,
    81350.00,
    '[
        {"id": "ev-5", "title": "Horizon Para-Golf Championship", "date": "2026-10-28", "location": "Bethpage Black", "goal": 35000}
    ]'::jsonb
)
ON CONFLICT (id) DO NOTHING;

-- 3. PROFILES TABLE (Mirrors and extends Supabase auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT NOT NULL,
    full_name TEXT,
    role TEXT NOT NULL DEFAULT 'subscriber' CHECK (role IN ('public', 'subscriber', 'admin')),
    subscription_status TEXT NOT NULL DEFAULT 'inactive' CHECK (subscription_status IN ('inactive', 'trialing', 'active', 'past_due', 'canceled', 'lapsed')),
    charity_id UUID REFERENCES public.charities(id) ON DELETE SET NULL,
    charity_contribution_pct NUMERIC(5, 2) NOT NULL DEFAULT 10.00 CHECK (charity_contribution_pct >= 10.00 AND charity_contribution_pct <= 100.00),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Trigger to automatically create a profile row whenever a user signs up via Supabase Auth
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, email, full_name, role, subscription_status, charity_contribution_pct)
    VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
        COALESCE(NEW.raw_user_meta_data->>'role', 'subscriber'),
        'inactive',
        10.00
    )
    ON CONFLICT (id) DO UPDATE SET
        email = EXCLUDED.email,
        full_name = COALESCE(EXCLUDED.full_name, public.profiles.full_name),
        updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 4. SUBSCRIPTIONS TABLE
CREATE TABLE IF NOT EXISTS public.subscriptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE UNIQUE,
    stripe_customer_id TEXT,
    stripe_subscription_id TEXT,
    plan_type TEXT NOT NULL CHECK (plan_type IN ('monthly', 'yearly')),
    status TEXT NOT NULL CHECK (status IN ('trialing', 'active', 'past_due', 'canceled', 'lapsed')),
    current_period_start TIMESTAMPTZ,
    current_period_end TIMESTAMPTZ,
    cancel_at_period_end BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 5. SCORES TABLE (Stableford: 1-45, Unique Date per User, Rolling 5 window)
CREATE TABLE IF NOT EXISTS public.scores (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    score INTEGER NOT NULL CHECK (score >= 1 AND score <= 45),
    date DATE NOT NULL,
    course_name TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT unique_user_score_date UNIQUE (user_id, date)
);

CREATE INDEX IF NOT EXISTS idx_scores_user_date ON public.scores(user_id, date DESC);

-- Automated trigger to evict scores beyond rolling 5
CREATE OR REPLACE FUNCTION public.enforce_rolling_five_scores()
RETURNS TRIGGER AS $$
BEGIN
    DELETE FROM public.scores
    WHERE id IN (
        SELECT id FROM public.scores
        WHERE user_id = NEW.user_id
        ORDER BY date DESC, created_at DESC
        OFFSET 5
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trg_enforce_rolling_scores ON public.scores;
CREATE TRIGGER trg_enforce_rolling_scores
    AFTER INSERT ON public.scores
    FOR EACH ROW
    EXECUTE FUNCTION public.enforce_rolling_five_scores();

-- 6. DRAWS TABLE
CREATE TABLE IF NOT EXISTS public.draws (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    period TEXT NOT NULL,
    mode TEXT NOT NULL CHECK (mode IN ('random', 'algorithmic')),
    status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'simulated', 'published')),
    target_numbers INTEGER[] NOT NULL DEFAULT '{}',
    pool_total NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
    active_subscribers_count INTEGER NOT NULL DEFAULT 0,
    jackpot_rollover_in NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
    jackpot_rollover_out NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
    tier_5_pool NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
    tier_4_pool NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
    tier_3_pool NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
    draw_date TIMESTAMPTZ NOT NULL DEFAULT now(),
    published_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 7. DRAW ENTRIES TABLE
CREATE TABLE IF NOT EXISTS public.draw_entries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    draw_id UUID NOT NULL REFERENCES public.draws(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    entry_numbers INTEGER[] NOT NULL,
    weight NUMERIC(5, 2) NOT NULL DEFAULT 1.00,
    match_count INTEGER NOT NULL DEFAULT 0,
    tier_won INTEGER CHECK (tier_won IN (5, 4, 3)),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT unique_draw_user_entry UNIQUE (draw_id, user_id)
);

-- 8. WINNERS TABLE
CREATE TABLE IF NOT EXISTS public.winners (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    draw_id UUID NOT NULL REFERENCES public.draws(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    tier INTEGER NOT NULL CHECK (tier IN (5, 4, 3)),
    amount NUMERIC(12, 2) NOT NULL CHECK (amount >= 0),
    payout_status TEXT NOT NULL DEFAULT 'pending' CHECK (payout_status IN ('pending', 'paid')),
    proof_url TEXT,
    proof_status TEXT NOT NULL DEFAULT 'unsubmitted' CHECK (proof_status IN ('unsubmitted', 'submitted', 'approved', 'rejected')),
    proof_rejection_reason TEXT,
    reviewed_by UUID REFERENCES public.profiles(id),
    reviewed_at TIMESTAMPTZ,
    paid_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 9. DONATIONS TABLE
CREATE TABLE IF NOT EXISTS public.donations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    charity_id UUID NOT NULL REFERENCES public.charities(id) ON DELETE CASCADE,
    donor_name TEXT,
    donor_email TEXT,
    amount NUMERIC(12, 2) NOT NULL CHECK (amount > 0),
    stripe_payment_id TEXT,
    status TEXT NOT NULL DEFAULT 'succeeded' CHECK (status IN ('pending', 'succeeded', 'failed')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 10. ROW LEVEL SECURITY POLICIES
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.scores ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.charities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.draws ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.draw_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.winners ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.donations ENABLE ROW LEVEL SECURITY;

-- Helper to check if current user is admin
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM public.profiles
        WHERE id = auth.uid() AND role = 'admin'
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Profiles Policies
CREATE POLICY "Users can read own profile" ON public.profiles FOR SELECT USING (auth.uid() = id OR public.is_admin());
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id OR public.is_admin());
CREATE POLICY "Admins can manage profiles" ON public.profiles FOR ALL USING (public.is_admin());

-- Charities Policies
CREATE POLICY "Public can view charities" ON public.charities FOR SELECT TO public USING (true);
CREATE POLICY "Admins can manage charities" ON public.charities FOR ALL USING (public.is_admin());

-- Subscriptions Policies
CREATE POLICY "Users can view own subscription" ON public.subscriptions FOR SELECT USING (auth.uid() = user_id OR public.is_admin());
CREATE POLICY "Admins can manage subscriptions" ON public.subscriptions FOR ALL USING (public.is_admin());

-- Scores Policies
CREATE POLICY "Users can view own scores" ON public.scores FOR SELECT USING (auth.uid() = user_id OR public.is_admin());
CREATE POLICY "Users can insert own scores" ON public.scores FOR INSERT WITH CHECK (auth.uid() = user_id OR public.is_admin());
CREATE POLICY "Users can update own scores" ON public.scores FOR UPDATE USING (auth.uid() = user_id OR public.is_admin());
CREATE POLICY "Users can delete own scores" ON public.scores FOR DELETE USING (auth.uid() = user_id OR public.is_admin());

-- Draws Policies
CREATE POLICY "Public can view published draws" ON public.draws FOR SELECT USING (status = 'published' OR public.is_admin());
CREATE POLICY "Admins can manage draws" ON public.draws FOR ALL USING (public.is_admin());

-- Storage Bucket for Proofs
INSERT INTO storage.buckets (id, name, public) 
VALUES ('winner-proofs', 'winner-proofs', true)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Authenticated users can upload proof" ON storage.objects
FOR INSERT TO authenticated WITH CHECK (bucket_id = 'winner-proofs');

CREATE POLICY "Public can view proof images" ON storage.objects
FOR SELECT TO public USING (bucket_id = 'winner-proofs');
