import { Toaster } from '@/components/ui/sonner'
import { ProfileForm } from '@/components/user/profile-form'
import { getUserProfile } from '@/lib/actions/user'
import { requireAuth } from '@/lib/auth/session'
import { redirect } from 'next/navigation'

export default async function ProfilePage() {
  // Ensure the user is authenticated
  const user = await requireAuth()
  
  // If no user, redirect to login
  if (!user) {
    redirect('/login')
  }
  
  // Get the user's profile data from Redis
  const profile = await getUserProfile(user.id)
  
  // If the profile exists and onboarding is completed, redirect to home
  // This is optional - remove this if you want users to always be able to edit their profile
  // if (profile?.onboardingCompleted) {
  //   redirect('/')
  // }
  
  return (
    <div className="container mx-auto py-16 px-4">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold mb-8 text-center">Your Profile</h1>
        
        <ProfileForm 
          userId={user.id} 
          initialData={{
            ...profile,
            name: profile?.name || user.name || '',
            email: profile?.email || user.email || ''
          }}
        />
      </div>
      <Toaster />
    </div>
  )
} 