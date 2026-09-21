-- Digital Heroes Initial Seed Data
-- Populates default charities, events, and sample draws

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
