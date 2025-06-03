'use client';

import { Button } from '@/components/ui/button';
import { LogIn, LogOut, UserCircle } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface AuthButtonProps {
  isLoggedIn: boolean;
  userName?: string;
  userAvatar?: string;
}

export default function AuthButton({ isLoggedIn, userName, userAvatar }: AuthButtonProps) {
  if (isLoggedIn) {
    const initials = userName
      ? userName
          .split(' ')
          .map((n) => n[0])
          .join('')
          .toUpperCase()
      : 'U';

    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="relative h-10 w-10 rounded-full">
            <Avatar className="h-9 w-9">
              {userAvatar && <AvatarImage src={userAvatar} alt={userName || 'User'} />}
              <AvatarFallback className="bg-primary text-primary-foreground">
                {userAvatar ? initials : <UserCircle size={20}/>}
              </AvatarFallback>
            </Avatar>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-56" align="end" forceMount>
          {userName && (
            <>
              <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium leading-none">Signed in as</p>
                  <p className="text-xs leading-none text-muted-foreground">
                    {userName}
                  </p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
            </>
          )}
          <DropdownMenuItem asChild>
            {/* Use a regular <a> tag for logout to ensure full page navigation if needed */}
            <a href="/api/auth/jira/logout" className="flex items-center cursor-pointer w-full">
              <LogOut className="mr-2 h-4 w-4" />
              <span>Log out</span>
            </a>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    );
  }

  return (
    <a href="/api/auth/jira/redirect">
      <Button variant="outline" type="button">
        <LogIn className="mr-2 h-4 w-4" />
        Sign in with JIRA
      </Button>
    </a>
  );
}
