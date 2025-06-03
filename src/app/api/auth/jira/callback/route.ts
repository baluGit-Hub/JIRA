
import { NextRequest, NextResponse } from 'next/server';
import { ATLASSIAN_CLIENT_ID, ATLASSIAN_CLIENT_SECRET, ATLASSIAN_REDIRECT_URI, NEXT_PUBLIC_APP_URL } from '@/config';
import { storeTokens, storeCloudId, storeUserDetails, clearSession } from '@/lib/authService';
import { getCloudId as fetchAndStoreCloudId, getJiraUser } from '@/lib/jiraService';
import { cookies } from 'next/headers';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const code = searchParams.get('code');
  const state = searchParams.get('state');
  const error = searchParams.get('error'); // Check for error from Atlassian
  const errorDescription = searchParams.get('error_description'); // Check for error_description

  const storedState = cookies().get('jira_oauth_state')?.value;
  cookies().delete('jira_oauth_state'); // Clean up state cookie

  if (error) { // If Atlassian returned an error
    console.error(`OAuth error from Atlassian: ${error} - ${errorDescription || 'No description'}`);
    // Pass the error and description to the login page
    const redirectUrl = new URL(`${NEXT_PUBLIC_APP_URL}/login`);
    redirectUrl.searchParams.set('error', 'atlassian_error');
    redirectUrl.searchParams.set('message', errorDescription || error);
    return NextResponse.redirect(redirectUrl.toString());
  }

  if (!state || state !== storedState) {
    return NextResponse.redirect(`${NEXT_PUBLIC_APP_URL}/login?error=invalid_state`);
  }

  if (!code) {
    // This case might be hit if there's no error param but also no code from Atlassian.
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
      // Pass a more detailed error message if available
      const detail = errorData.error_description || errorData.error || 'token_exchange_failed';
      return NextResponse.redirect(`${NEXT_PUBLIC_APP_URL}/login?error=token_exchange_failed&message=${encodeURIComponent(detail)}`);
    }

    const { access_token, refresh_token } = await tokenResponse.json();
    await storeTokens(access_token, refresh_token);

    const cloudId = await fetchAndStoreCloudId();
    const jiraUser = await getJiraUser();
    await storeUserDetails(jiraUser.accountId, jiraUser.displayName);


    return NextResponse.redirect(`${NEXT_PUBLIC_APP_URL}/dashboard`);

  } catch (e) {
    console.error('OAuth callback error:', e);
    await clearSession();
    const message = e instanceof Error ? e.message : 'Internal server error during callback processing.';
    return NextResponse.redirect(`${NEXT_PUBLIC_APP_URL}/login?error=internal_server_error&message=${encodeURIComponent(message)}`);
  }
}
