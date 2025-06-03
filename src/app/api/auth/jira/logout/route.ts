import { NextResponse } from 'next/server';
import { clearSession } from '@/lib/authService';
import { NEXT_PUBLIC_APP_URL } from '@/config';

export async function GET() {
  await clearSession();
  return NextResponse.redirect(`${NEXT_PUBLIC_APP_URL}/login?message=logged_out`);
}
