
import { NextRequest, NextResponse } from 'next/server';
import { ATLASSIAN_CLIENT_ID, ATLASSIAN_CLIENT_SECRET, ATLASSIAN_REDIRECT_URI, NEXT_PUBLIC_APP_URL } from '@/config';
import { storeTokens, storeUserDetails, clearSession } from '@/lib/authService';
// Renamed imported getCloudId to avoid conflict with local variables if any, and for clarity.
// This 'fetchAndStoreCloudId' is actually the getCloudId function from jiraService that also handles storing.
import { getCloudId as fetchAndStoreCloudId, getJiraUser } from '@/lib/jiraService';
import { cookies } from 'next/headers';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const code = searchParams.get('code');
  const state = searchParams.get('state');
  const error = searchParams.get('error');
  const errorDescription = searchParams.get('error_description');

  const storedState = cookies().get('jira_oauth_state')?.value;
  cookies().delete('jira_oauth_state'); 

  if (error) { 
    console.error(`OAuth error from Atlassian: ${error} - ${errorDescription || 'No description'}`);
    const redirectUrl = new URL(`${NEXT_PUBLIC_APP_URL}/login`);
    redirectUrl.searchParams.set('error', 'atlassian_error');
    redirectUrl.searchParams.set('message', errorDescription || error);
    return NextResponse.redirect(redirectUrl.toString());
  }

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
      const detail = errorData.error_description || errorData.error || 'token_exchange_failed';
      return NextResponse.redirect(`${NEXT_PUBLIC_APP_URL}/login?error=token_exchange_failed&message=${encodeURIComponent(detail)}`);
    }

    const { access_token, refresh_token } = await tokenResponse.json();
    // Store tokens in session for future requests
    await storeTokens(access_token, refresh_token);

    // For immediate calls within this callback, pass the fresh access_token directly
    // This bypasses potential session read-after-write issues with the mock session store
    const cloudId = await fetchAndStoreCloudId(access_token); // Pass token here
    const jiraUser = await getJiraUser(access_token); // Pass token here
    
    // Store user details in session (uses its own session.save())
    await storeUserDetails(jiraUser.accountId, jiraUser.displayName);


    return NextResponse.redirect(`${NEXT_PUBLIC_APP_URL}/dashboard`);

  } catch (e) {
    console.error('OAuth callback error:', e);
    await clearSession();
    const message = e instanceof Error ? e.message : 'Internal server error during callback processing.';
    // If the error is "Not authenticated", it means an issue with token availability for jiraService calls
    const errorCode = (e instanceof Error && e.message === 'Not authenticated') ? 'token_not_available_for_api_calls' : 'internal_server_error';
    return NextResponse.redirect(`${NEXT_PUBLIC_APP_URL}/login?error=${errorCode}&message=${encodeURIComponent(message)}`);
  }
}
