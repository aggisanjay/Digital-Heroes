import { NextResponse } from 'next/server';
import { store } from '@/lib/data/mock-db';
import { createAdminClient } from '@/lib/supabase/admin';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const userId = searchParams.get('userId') || store.getCurrentUser()?.id;

  if (!userId) {
    return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
  }

  // 1. Try querying Supabase database
  try {
    const supabaseAdmin = createAdminClient();
    const { data: dbScores, error: dbError } = await supabaseAdmin
      .from('scores')
      .select('*')
      .eq('user_id', userId)
      .order('date', { ascending: false })
      .limit(5);

    if (!dbError && dbScores && dbScores.length > 0) {
      return NextResponse.json({ scores: dbScores, source: 'supabase' });
    }
  } catch (err) {
    // Fallback to store
  }

  const scores = store.getUserScores(userId);
  return NextResponse.json({ scores, source: 'store' });
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { userId, score, date, courseName } = body;

    const targetUserId = userId || store.getCurrentUser()?.id;
    if (!targetUserId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }

    // Verify subscription status server-side (Supabase first)
    let user: any = null;
    try {
      const supabaseAdmin = createAdminClient();
      const { data: dbProfile } = await supabaseAdmin.from('profiles').select('*').eq('id', targetUserId).maybeSingle();
      if (dbProfile) user = dbProfile;
    } catch (e) {}

    if (!user) {
      user = store.getProfile(targetUserId);
    }
    if (user && user.subscription_status !== 'active') {
      return NextResponse.json(
        { error: 'An active subscription is required to enter golf scores. Please activate your subscription.' },
        { status: 403 }
      );
    }


    // 1. Sync to Supabase database
    let dbPersisted = false;
    try {
      const supabaseAdmin = createAdminClient();
      const { error: insertError } = await supabaseAdmin.from('scores').insert({
        user_id: targetUserId,
        score: Number(score),
        date,
        course_name: courseName || 'Default Course',
      });
      if (!insertError) {
        dbPersisted = true;
      }
    } catch (dbErr: any) {
      console.warn('Supabase score insert notice:', dbErr.message);
    }

    // 2. Mirror into reactive store
    const newScore = store.addScore(targetUserId, Number(score), date, courseName);
    const updatedScores = store.getUserScores(targetUserId);

    return NextResponse.json({
      score: newScore,
      scores: updatedScores,
      dbPersisted,
      message: 'Score recorded successfully. Rolling 5-score window updated.',
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to save score' }, { status: 400 });
  }
}

export async function PUT(req: Request) {
  try {
    const body = await req.json();
    const { scoreId, score, date, courseName, userId } = body;

    if (!scoreId) {
      return NextResponse.json({ error: 'Score ID is required' }, { status: 400 });
    }

    const numScore = Number(score);
    if (isNaN(numScore) || numScore < 1 || numScore > 45) {
      return NextResponse.json({ error: 'Stableford scores must be between 1 and 45.' }, { status: 400 });
    }

    const normDate = date ? String(date).substring(0, 10) : new Date().toISOString().substring(0, 10);
    const targetUserId = userId || store.getCurrentUser()?.id;

    // 1. Try syncing to Supabase if table exists
    let dbUpdated = false;
    try {
      const supabaseAdmin = createAdminClient();
      const { error: updateError } = await supabaseAdmin
        .from('scores')
        .update({
          score: numScore,
          date: normDate,
          course_name: courseName || 'Local Course',
        })
        .eq('id', scoreId);

      if (!updateError) {
        dbUpdated = true;
      }
    } catch (dbErr: any) {
      console.warn('Supabase score update notice:', dbErr.message);
    }

    // 2. Mirror into reactive store
    const updated = store.updateScore(scoreId, numScore, normDate, courseName, targetUserId);
    const updatedScores = targetUserId ? store.getUserScores(targetUserId) : [];

    return NextResponse.json({
      success: true,
      score: updated,
      scores: updatedScores,
      dbUpdated,
      message: 'Score updated successfully!',
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to update score' }, { status: 400 });
  }
}

export async function DELETE(req: Request) {
  const { searchParams } = new URL(req.url);
  const scoreId = searchParams.get('id');

  if (!scoreId) {
    return NextResponse.json({ error: 'Score ID is required' }, { status: 400 });
  }

  // 1. Try deleting from Supabase if table exists
  try {
    const supabaseAdmin = createAdminClient();
    await supabaseAdmin.from('scores').delete().eq('id', scoreId);
  } catch (dbErr: any) {
    console.warn('Supabase score delete notice:', dbErr.message);
  }

  // 2. Delete from store
  store.deleteScore(scoreId);
  return NextResponse.json({ success: true, message: 'Score removed successfully' });
}
