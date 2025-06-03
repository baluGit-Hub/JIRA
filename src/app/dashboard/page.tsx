
import { redirect } from 'next/navigation';
import { isAuthenticated, getUserDetails } from '@/lib/authService';
import Header from '@/components/Header';
import BoardCard from '@/components/BoardCard';
import type { BoardWithDetails } from '@/types/jira';
import { NEXT_PUBLIC_APP_URL } from '@/config';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertTriangle } from "lucide-react";

export const dynamic = 'force-dynamic';

async function getBoardsData(): Promise<BoardWithDetails[] | { error: string }> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 15000); // 15 seconds timeout

  try {
    const apiUrl = `${NEXT_PUBLIC_APP_URL}/api/jira/boards`;
    console.log(`Dashboard: Fetching boards from: ${apiUrl}`); 

    const res = await fetch(apiUrl, {
      headers: {
        // Pass along cookies if needed by your /api/jira/boards route for auth
        // For server-side fetch within Route Handlers or Server Components, cookies are often forwarded automatically or can be explicitly passed.
        // The crucial part is that /api/jira/boards must correctly use the session cookie.
        'Cookie': require('next/headers').cookies().toString(),
      },
      cache: 'no-store', // Ensure fresh data
      signal: controller.signal, // Add abort signal
    });
    clearTimeout(timeoutId); // Clear timeout if fetch completes

    if (!res.ok) {
      let errorDetails = `Failed to load boards (status: ${res.status})`;
      try {
        const errorData = await res.json();
        errorDetails = errorData.details || errorData.error || errorDetails;
      } catch (jsonError) {
        errorDetails = `Error processing API response: ${res.statusText || errorDetails}. Check server logs for /api/jira/boards.`;
        console.warn("Response from /api/jira/boards was not JSON or failed to parse:", jsonError, await res.text().catch(() => "Could not read response text."));
      }
      console.error("Error fetching boards from API route (/api/jira/boards):", res.status, errorDetails);
      return { error: errorDetails };
    }
    return res.json();
  } catch (e: any) {
    clearTimeout(timeoutId);
    if (e.name === 'AbortError') {
      console.error("Fetch to /api/jira/boards timed out.");
      return { error: "Request to JIRA services timed out. Please try again. Ensure the application URL in your environment variables is correct." };
    }
    console.error("Network or other error fetching boards:", e);
    const message = e instanceof Error ? e.message : "Unknown error";
    // Add a hint about NEXT_PUBLIC_APP_URL configuration
    return { error: `Failed to connect to JIRA services: ${message}. Please check your network connection and ensure the application URL (currently: ${NEXT_PUBLIC_APP_URL}) is correctly configured in your environment variables.` };
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
              Please try refreshing the page. If the problem persists, check your internet connection, ensure the application URL is correctly configured, or you might need to sign out and sign back in.
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
