import { NextRequest, NextResponse } from 'next/server';
import { ATLASSIAN_CLIENT_ID, ATLASSIAN_CLIENT_SECRET, ATLASSIAN_REDIRECT_URI, NEXT_PUBLIC_APP_URL } from '@/config';
import { storeTokens, storeCloudId, storeUserDetails, clearSession } from '@/lib/authService';
import { getCloudId as fetchAndStoreCloudId, getJiraUser } from '@/lib/jiraService';
import { cookies } from 'next/headers';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const code = searchParams.get('code');
  const state = searchParams.get('state');

  const storedState = cookies().get('jira_oauth_state')?.value;
  cookies().delete('jira_oauth_state'); // Clean up state cookie

  if (!state || state !== storedState) {
    return NextResponse.redirect(`${NEXT_PUBLIC_APP_URL}/login?error=invalid_state`);
  }

  if (!code) {
    return NextResponse.redirect(`${NEXT_PUBLIC_APP_URL}/login?error=missing_code`);
  }

  try {
    const tokenResponse = await fetch('https://auth.atlassian.com/oauth/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        grant_type: 'authorization_code',
        client_id: ATLASSIAN_CLIENT_ID,
        client_secret: ATLASSIAN_CLIENT_SECRET,
        code: code,
        redirect_uri: ATLASSIAN_REDIRECT_URI,
      }),
    });

    if (!tokenResponse.ok) {
      const errorData = await tokenResponse.json();
      console.error('Failed to exchange code for token:', errorData);
      await clearSession();
      return NextResponse.redirect(`${NEXT_PUBLIC_APP_URL}/login?error=token_exchange_failed`);
    }

    const { access_token, refresh_token } = await tokenResponse.json();
    await storeTokens(access_token, refresh_token);

    // Fetch and store cloudId and user details
    // Note: getCloudId from jiraService handles fetching resources and storing the first cloudId.
    // This relies on the token being available in the session, which storeTokens just did.
    const cloudId = await fetchAndStoreCloudId(); // This also stores it in session
    const jiraUser = await getJiraUser();
    await storeUserDetails(jiraUser.accountId, jiraUser.displayName);


    return NextResponse.redirect(`${NEXT_PUBLIC_APP_URL}/dashboard`);

  } catch (error) {
    console.error('OAuth callback error:', error);
    await clearSession();
    return NextResponse.redirect(`${NEXT_PUBLIC_APP_URL}/login?error=internal_server_error`);
  }
}
