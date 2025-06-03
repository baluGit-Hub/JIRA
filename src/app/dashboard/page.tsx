import { redirect } from 'next/navigation';
import { isAuthenticated, getUserDetails } from '@/lib/authService';
import Header from '@/components/Header';
import BoardCard from '@/components/BoardCard';
import type { BoardWithDetails } from '@/types/jira';
import { NEXT_PUBLIC_APP_URL } from '@/config';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertTriangle } from "lucide-react";

async function getBoardsData(): Promise<BoardWithDetails[] | { error: string }> {
  try {
    // This fetch needs to be to our own API route, which then calls JIRA
    const res = await fetch(`${NEXT_PUBLIC_APP_URL}/api/jira/boards`, {
      headers: {
        // Pass along cookies if needed by your /api/jira/boards route for auth
        // For server-side fetch within Route Handlers or Server Components, cookies are often forwarded automatically or can be explicitly passed.
        // If running in a browser context, this would be different. But this is a server component.
        // The crucial part is that /api/jira/boards must correctly use the session cookie.
        'Cookie': require('next/headers').cookies().toString(),
      },
      cache: 'no-store', // Ensure fresh data
    });

    if (!res.ok) {
      const errorData = await res.json();
      console.error("Error fetching boards from API route:", res.status, errorData);
      return { error: errorData.details || errorData.error || `Failed to load boards (status: ${res.status})` };
    }
    return res.json();
  } catch (e) {
    console.error("Network or other error fetching boards:", e);
    const message = e instanceof Error ? e.message : "Unknown error";
    return { error: `Failed to connect to JIRA services: ${message}` };
  }
}


export default async function DashboardPage() {
  if (!(await isAuthenticated())) {
    redirect('/login');
  }

  const user = await getUserDetails();
  const boardsData = await getBoardsData();

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Header />
      <main className="flex-1 container mx-auto p-4 md:p-8">
        <h1 className="text-3xl font-headline font-semibold mb-2 text-foreground">
          Welcome, {user?.userName || 'JIRA User'}!
        </h1>
        <p className="text-lg text-muted-foreground mb-8">Here's a glance at your JIRA boards.</p>

        {typeof boardsData === 'object' && 'error' in boardsData ? (
          <Alert variant="destructive" className="mb-6">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Error Loading Boards</AlertTitle>
            <AlertDescription>
              Could not load your JIRA boards. Details: {boardsData.error}
              <br />
              Please try refreshing the page. If the problem persists, you might need to sign out and sign back in.
            </AlertDescription>
          </Alert>
        ) : boardsData.length === 0 ? (
          <p className="text-center text-muted-foreground py-10 text-lg">
            You don't seem to have any JIRA boards accessible, or there was an issue fetching them.
          </p>
        ) : (
          <div className="grid gap-6 md:grid-cols-1 lg:grid-cols-2 xl:grid-cols-2 2xl:grid-cols-3">
            {boardsData.map((board) => (
              <BoardCard key={board.id} board={board} />
            ))}
          </div>
        )}
      </main>
       <footer className="py-8 text-center text-sm text-muted-foreground">
        <p>&copy; {new Date().getFullYear()} JIRA Board Glance. Built with Next.js and love for JIRA.</p>
      </footer>
    </div>
  );
}
