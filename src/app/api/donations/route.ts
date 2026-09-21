import { NextResponse } from 'next/server';
import { store } from '@/lib/data/mock-db';

export async function GET() {
  const donations = store.getDonations();
  return NextResponse.json({ donations });
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { charityId, amount, donorName, donorEmail, userId } = body;

    if (!charityId || !amount || Number(amount) <= 0) {
      return NextResponse.json({ error: 'Valid charity ID and donation amount are required' }, { status: 400 });
    }

    const donation = store.addDonation(
      charityId,
      Number(amount),
      donorName,
      donorEmail,
      userId
    );

    return NextResponse.json({
      donation,
      message: `Thank you! Your donation of $${Number(amount).toFixed(2)} directly empowers this charity.`,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Donation failed' }, { status: 500 });
  }
}
