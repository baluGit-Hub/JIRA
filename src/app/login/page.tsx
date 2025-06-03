
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertTriangle, CheckCircle } from 'lucide-react';

interface LoginPageProps {
  searchParams?: {
    error?: string;
    message?: string; // Can be a success message or error details
  };
}

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const error = searchParams?.error;
  const message = searchParams?.message ? decodeURIComponent(searchParams.message) : undefined;

  let errorMessageText = null;
  if (error) {
    switch (error) {
      case 'invalid_state':
        errorMessageText = 'Login failed due to an invalid state. Please try again.';
        break;
      case 'missing_code':
        errorMessageText = 'Login failed because the authorization code was missing. Please try again.';
        break;
      case 'token_exchange_failed':
        errorMessageText = `Failed to connect to JIRA: ${message || 'Please ensure you granted access and try again.'} This could be due to incorrect app configuration or temporary JIRA issues.`;
        break;
      case 'internal_server_error':
        errorMessageText = `An internal server error occurred. ${message || 'Please try again later.'}`;
        break;
      case 'atlassian_error':
        errorMessageText = `JIRA authentication failed. ${message ? `Details: ${message}.` : 'An issue occurred with the JIRA authorization server.'} Please check your JIRA app configuration in the Atlassian Developer Console (callback URL, permissions) and try again.`;
        break;
      default:
        errorMessageText = `An unknown login error occurred (${error}). ${message ? `Details: ${message}.` : ''} Please try again.`;
    }
  }

  let successMessageText = null;
  if (!error && searchParams?.message && searchParams.message === 'logged_out') {
    successMessageText = 'You have been successfully logged out.';
  }
  
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md shadow-xl">
        <CardHeader className="text-center">
          <CardTitle className="text-3xl font-headline text-primary">JIRA Board Glance</CardTitle>
          <CardDescription className="text-muted-foreground">
            Get a quick overview of your JIRA boards.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center space-y-6">
          {errorMessageText && (
            <div className="w-full p-3 rounded-md bg-destructive/10 text-destructive flex items-start gap-2">
              <AlertTriangle className="h-5 w-5 mt-0.5 flex-shrink-0" />
              <p className="text-sm">{errorMessageText}</p>
            </div>
          )}
          {successMessageText && (
             <div className="w-full p-3 rounded-md bg-accent/10 text-accent-foreground flex items-center gap-2" style={{backgroundColor: 'hsl(var(--accent))', color: 'hsl(var(--accent-foreground))'}}>
              <CheckCircle className="h-5 w-5" />
              <p className="text-sm">{successMessageText}</p>
            </div>
          )}
          <a href="/api/auth/jira/redirect" className="w-full">
            <Button size="lg" className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-medium py-3" type="button">
              Sign in with JIRA
            </Button>
          </a>
          <p className="text-xs text-muted-foreground text-center px-4">
            By signing in, you agree to allow JIRA Board Glance to access your JIRA data as per Atlassian's authorization.
          </p>
        </CardContent>
      </Card>
       <footer className="mt-8 text-center text-sm text-muted-foreground">
        <p>&copy; {new Date().getFullYear()} JIRA Board Glance. Not affiliated with Atlassian.</p>
      </footer>
    </div>
  );
}
