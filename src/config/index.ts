
export const JIRA_CLIENT_ID = process.env.JIRA_CLIENT_ID!;
export const JIRA_CLIENT_SECRET = process.env.JIRA_CLIENT_SECRET!;
export const JIRA_REDIRECT_URI = process.env.JIRA_REDIRECT_URI!;
export const NEXT_PUBLIC_APP_URL = process.env.NEXT_PUBLIC_APP_URL!;
export const SESSION_SECRET = process.env.SESSION_SECRET!;

if (!JIRA_CLIENT_ID || !JIRA_CLIENT_SECRET || !JIRA_REDIRECT_URI || !NEXT_PUBLIC_APP_URL || !SESSION_SECRET) {
  console.error("Missing required environment variables. Check your .env.local file or environment configuration.");
  if (process.env.NODE_ENV === 'production') {
    // In production, it's better to throw an error to prevent the app from running with misconfiguration.
    // In development, a console error might be sufficient to alert the developer.
    throw new Error("Missing required environment variables.");
  }
}
