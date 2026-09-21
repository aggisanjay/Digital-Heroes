import { NextResponse } from 'next/server';

export async function POST() {
  const res = NextResponse.json({
    success: true,
    message: 'Signed out successfully.',
  });

  // Clear auth cookies
  const cookieOptions = {
    path: '/',
    maxAge: 0,
    expires: new Date(0),
  };

  res.cookies.set('dh_user_id', '', cookieOptions);
  res.cookies.set('dh_user_role', '', cookieOptions);
  res.cookies.set('dh_sub_status', '', cookieOptions);
  res.cookies.set('dh_user_email', '', cookieOptions);

  return res;
}
