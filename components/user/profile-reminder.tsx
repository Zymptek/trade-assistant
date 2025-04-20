'use client'

import { UserProfile } from '@/lib/actions/user'
import Link from 'next/link'
import { Button } from '../ui/button'

interface ProfileReminderProps {
  profile: UserProfile | null
  className?: string
}

export function ProfileReminder({ profile, className }: ProfileReminderProps) {
  // If the profile exists and onboarding is completed, don't show anything
  if (profile?.onboardingCompleted) {
    return null
  }

  return (
    <div className={`bg-muted p-4 rounded-lg ${className}`}>
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <h3 className="font-medium">Complete your profile</h3>
          <p className="text-sm text-muted-foreground">
            Please take a moment to complete your profile information to enhance your experience.
          </p>
        </div>
        <Button asChild size="sm">
          <Link href="/profile">Complete Profile</Link>
        </Button>
      </div>
    </div>
  )
} 