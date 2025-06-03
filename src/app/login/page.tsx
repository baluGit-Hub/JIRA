import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import Link from 'next/link';
import { AlertTriangle, CheckCircle } from 'lucide-react';

interface LoginPageProps {
  searchParams?: {
    error?: string;
    message?: string;
  };
}

export default function LoginPage({ searchParams }: LoginPageProps) {
  const error = searchParams?.error;
  const message = searchParams?.message;

  let errorMessage = null;
  if (error) {
    switch (error) {
      case 'invalid_state':
        errorMessage = 'Login failed due to an invalid state. Please try again.';
        break;
      case 'missing_code':
        errorMessage = 'Login failed because the authorization code was missing. Please try again.';
        break;
      case 'token_exchange_failed':
        errorMessage = 'Failed to connect to JIRA. Please ensure you granted access and try again.';
        break;
      case 'internal_server_error':
        errorMessage = 'An internal server error occurred. Please try again later.';
        break;
      default:
        errorMessage = 'An unknown login error occurred. Please try again.';
    }
  }

  let successMessage = null;
  if (message === 'logged_out') {
    successMessage = 'You have been successfully logged out.';
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
          {errorMessage && (
            <div className="w-full p-3 rounded-md bg-destructive/10 text-destructive flex items-center gap-2">
              <AlertTriangle className="h-5 w-5" />
              <p className="text-sm">{errorMessage}</p>
            </div>
          )}
          {successMessage && (
             <div className="w-full p-3 rounded-md bg-accent/10 text-accent-foreground flex items-center gap-2" style={{backgroundColor: 'hsl(var(--accent))', color: 'hsl(var(--accent-foreground))'}}>
              <CheckCircle className="h-5 w-5" />
              <p className="text-sm">{successMessage}</p>
            </div>
          )}
          <Link href="/api/auth/jira/redirect" passHref legacyBehavior>
            <Button size="lg" className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-medium py-3">
              Sign in with JIRA
            </Button>
          </Link>
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
