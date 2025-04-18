import { getCurrentUser } from '@/lib/auth/session'
import Image from 'next/image'
import React from 'react'
import { LogoutButton } from './auth/logout-button'
import HistoryContainer from './history-container'
import { ModeToggle } from './mode-toggle'

export const Header: React.FC = async () => {
  const user = await getCurrentUser()
  
  return (
    <header className="fixed w-full p-2 flex justify-between items-center z-10 backdrop-blur lg:backdrop-blur-none bg-background/80 lg:bg-transparent">
      <div>
        <a href="/" className="flex items-center">
          <Image 
            src="/images/zymptek_logo_no_background.png" 
            alt="Zymptek Logo" 
            width={40} 
            height={40} 
            className="object-contain"
          />
          <span className="ml-2 text-2xl font-bold text-muted-foreground">Zymptek</span>
        </a>
      </div>
      <div className="flex gap-0.5 items-center">
        {user && <span className="text-sm text-muted-foreground mr-2">{user.email}</span>}
        <ModeToggle />
        {user && <LogoutButton />}
        <HistoryContainer />
      </div>
    </header>
  )
}

export default Header
