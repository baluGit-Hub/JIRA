import Link from 'next/link';
import AuthButton from './AuthButton';
import { getUserDetails, isAuthenticated } from '@/lib/authService';

export default async function Header() {
  const authenticated = await isAuthenticated();
  const user = authenticated ? await getUserDetails() : null;

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 max-w-screen-2xl items-center justify-between">
        <Link href="/" className="mr-6 flex items-center space-x-2">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6 text-primary">
            <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
            <line x1="3" y1="9" x2="21" y2="9"></line>
            <line x1="9" y1="21" x2="9" y2="9"></line>
          </svg>
          <span className="font-headline text-xl font-bold text-foreground">JIRA Board Glance</span>
        </Link>
        <AuthButton isLoggedIn={authenticated} userName={user?.userName} />
      </div>
    </header>
  );
}
