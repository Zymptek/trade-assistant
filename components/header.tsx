import { getCurrentUser } from '@/lib/auth/session'
import Link from 'next/link'
import React from 'react'
import { LogoutButton } from './auth/logout-button'
import HistoryContainer from './history-container'
import { ModeToggle } from './mode-toggle'
import ZymptekLogo from './zymptek-logo'

export const Header: React.FC = async () => {
  const user = await getCurrentUser()
  
  return (
    <header className="sticky top-0 w-screen px-6 py-4 flex justify-between items-center z-10" suppressHydrationWarning>
              <div>
          <a href="/" className="flex items-center group transition-all duration-200 hover:scale-105">
            <div className="w-14 h-14" suppressHydrationWarning>
              <ZymptekLogo variant="icon-only" className="w-full h-full" />
            </div>
            <span className="ml-4 text-2xl font-bold bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500 bg-clip-text text-transparent group-hover:from-blue-600 group-hover:via-indigo-600 group-hover:to-purple-600 transition-all duration-200">Zymptek</span>
          </a>
        </div>
      <div className="flex gap-1 items-center" suppressHydrationWarning>
        {user && (
          <div className="flex items-center">
            <Link href="/profile" className="text-sm text-muted-foreground mr-3 hover:text-primary transition-colors px-2 py-1 rounded-md hover:bg-accent/50">
              {user.email}
            </Link>
          </div>
        )}
        <ModeToggle />
        {user && <LogoutButton />}
        <HistoryContainer />
      </div>
    </header>
  )
}

export default Header
