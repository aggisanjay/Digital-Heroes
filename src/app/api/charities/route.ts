import { NextResponse } from 'next/server';
import { store } from '@/lib/data/mock-db';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const slug = searchParams.get('slug');

  if (slug) {
    const charity = store.getCharityBySlug(slug);
    if (!charity) {
      return NextResponse.json({ error: 'Charity not found' }, { status: 404 });
    }
    return NextResponse.json({ charity });
  }

  const charities = store.getCharities();
  return NextResponse.json({ charities });
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { name, slug, tagline, description, logo_url, cover_image_url, featured, events } = body;

    if (!name || !description) {
      return NextResponse.json({ error: 'Name and description are required' }, { status: 400 });
    }

    const newCharity = store.createCharity({
      name,
      slug: slug || name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
      tagline: tagline || null,
      description,
      logo_url: logo_url || 'https://images.unsplash.com/photo-1535131749006-b7f58c99034b?w=150&auto=format&fit=crop&q=80',
      cover_image_url: cover_image_url || 'https://images.unsplash.com/photo-1592919505780-303950717480?w=1200&auto=format&fit=crop&q=80',
      featured: Boolean(featured),
      events: events || [],
    });

    return NextResponse.json({ charity: newCharity });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to create charity' }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const body = await req.json();
    const { id, ...updates } = body;

    if (!id) {
      return NextResponse.json({ error: 'Charity ID is required' }, { status: 400 });
    }

    const updated = store.updateCharity(id, updates);
    return NextResponse.json({ charity: updated });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to update charity' }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get('id');

  if (!id) {
    return NextResponse.json({ error: 'Charity ID is required' }, { status: 400 });
  }

  store.deleteCharity(id);
  return NextResponse.json({ success: true });
}
