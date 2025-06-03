
export const JIRA_CLIENT_ID = process.env.JIRA_CLIENT_ID!;
export const JIRA_CLIENT_SECRET = process.env.JIRA_CLIENT_SECRET!;
export const JIRA_REDIRECT_URI = process.env.JIRA_REDIRECT_URI!;
export const NEXT_PUBLIC_APP_URL = process.env.NEXT_PUBLIC_APP_URL!;
export const SESSION_SECRET = process.env.SESSION_SECRET!;

const missingVariables: string[] = [];
if (!JIRA_CLIENT_ID) missingVariables.push('JIRA_CLIENT_ID');
if (!JIRA_CLIENT_SECRET) missingVariables.push('JIRA_CLIENT_SECRET');
if (!JIRA_REDIRECT_URI) missingVariables.push('JIRA_REDIRECT_URI');
if (!NEXT_PUBLIC_APP_URL) missingVariables.push('NEXT_PUBLIC_APP_URL');
if (!SESSION_SECRET) missingVariables.push('SESSION_SECRET');

if (missingVariables.length > 0) {
  const message = `Missing required environment variables: ${missingVariables.join(', ')}. Check your .env.local file or environment configuration.`;
  console.error(message);
  // Throw an error in all environments if critical variables are missing.
  // The app cannot function correctly without them.
  throw new Error(message);
}
