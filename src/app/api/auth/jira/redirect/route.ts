
import { NextResponse } from 'next/server';
import { JIRA_CLIENT_ID, JIRA_REDIRECT_URI } from '@/config';
import { v4 as uuidv4 } from 'uuid'; // For generating a state parameter
import { cookies } from 'next/headers';

export async function GET() {
  const state = uuidv4();
  // Store state in a temporary cookie to verify later
  cookies().set('jira_oauth_state', state, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    maxAge: 60 * 5, // 5 minutes
    path: '/',
    sameSite: 'lax', // Explicitly set SameSite attribute
  });

  const scopes = [
    'read:jira-user', // View user identity
    'read:jira-work', // Read JIRA project and issue data
    'offline_access', // To get a refresh token
    'read:me', // To get user profile information like name and avatar
  ];

  const authorizationUrl = new URL('https://auth.atlassian.com/authorize');
  authorizationUrl.searchParams.append('audience', 'api.atlassian.com');
  authorizationUrl.searchParams.append('client_id', JIRA_CLIENT_ID);
  authorizationUrl.searchParams.append('scope', scopes.join(' '));
  authorizationUrl.searchParams.append('redirect_uri', JIRA_REDIRECT_URI);
  authorizationUrl.searchParams.append('state', state);
  authorizationUrl.searchParams.append('response_type', 'code');
  authorizationUrl.searchParams.append('prompt', 'consent');

  return NextResponse.redirect(authorizationUrl.toString());
}
