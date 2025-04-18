// components/auth/logout-button.tsx
'use client';

import { LogOut } from 'lucide-react';
import { signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Button } from '../ui/button';

export function LogoutButton() {
  const router = useRouter();

  const handleLogout = async () => {
    await signOut({ callbackUrl: '/login' });
  };

  return (
    <Button 
      variant="ghost" 
      size="icon"
      className="text-muted-foreground hover:text-foreground"
      title="Sign out"
      onClick={handleLogout}
    >
      <LogOut className="h-4 w-4" />
    </Button>
  );
}