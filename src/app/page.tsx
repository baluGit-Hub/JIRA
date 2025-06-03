import { redirect } from 'next/navigation';
import { isAuthenticated } from '@/lib/authService';
import { Loader2 } from 'lucide-react';

export default async function HomePage() {
  // This component runs on the server.
  // We check authentication status and redirect accordingly.
  if (await isAuthenticated()) {
    redirect('/dashboard');
  } else {
    redirect('/login');
  }

  // Fallback content, though redirect should occur before this is rendered.
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="flex flex-col items-center space-y-4">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
        <p className="text-muted-foreground">Loading JIRA Board Glance...</p>
      </div>
    </div>
  );
}
