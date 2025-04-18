// app/login/page.tsx
import LoginButton from '@/components/auth/login-button';
import { getCurrentUser } from '@/lib/auth/session';
import Image from 'next/image';
import { redirect } from 'next/navigation';

export default async function LoginPage() {
  // If user is already logged in, redirect to home page
  const user = await getCurrentUser();
  if (user) {
    redirect('/');
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-950 flex items-center justify-center p-4 md:p-6">
      <div className="w-full max-w-5xl grid grid-cols-1 lg:grid-cols-5 overflow-hidden rounded-3xl shadow-[0_20px_80px_-10px_rgba(0,0,0,0.1)] bg-white dark:bg-gray-900">
        
        {/* Left panel - Information (3/5 width on desktop) */}
        <div className="lg:col-span-3 p-8 md:p-12 lg:p-16 flex flex-col justify-center relative overflow-hidden">
          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-8">
              <div className="w-10 h-10 relative">
                <Image 
                  src="/images/zymptek_logo_no_background.png" 
                  alt="Logo" 
                  fill
                  className="object-contain"
                />
              </div>
              <h2 className="text-xl font-semibold tracking-tight">Zymptek</h2>
            </div>
            
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-400 bg-clip-text text-transparent mb-6">
              Trade Intelligence, Simplified
            </h1>
            
            <p className="text-lg text-gray-600 dark:text-gray-400 mb-8 max-w-md">
              Access real-time data on HTS codes, tariffs, and international trade regulations through our AI-powered assistant.
            </p>
            
            <div className="space-y-5">
              {[
                { title: "HTS Code Lookup", desc: "Instant access to accurate Harmonized Tariff Schedule codes" },
                { title: "Tariff Calculations", desc: "Up-to-date import duty and tax information" },
                { title: "Regulatory Guidance", desc: "Clear explanations of complex trade regulations" }
              ].map((feature, i) => (
                <div key={i} className="flex items-start gap-3">
                  <div className="mt-1 size-5 flex-shrink-0 rounded-full bg-primary/10 flex items-center justify-center">
                    <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-primary">
                      <path d="M10 3L4.5 8.5L2 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-medium">{feature.title}</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{feature.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          {/* Abstract decorative elements */}
          <div className="absolute -bottom-16 -left-16 w-64 h-64 bg-primary/5 rounded-full blur-3xl"></div>
          <div className="absolute top-0 right-0 w-40 h-40 bg-blue-500/5 rounded-full blur-3xl"></div>
        </div>
        
        {/* Right panel - Login (2/5 width on desktop) */}
        <div className="lg:col-span-2 bg-gray-50 dark:bg-gray-800/50 p-8 md:p-12 flex flex-col justify-center relative">
          <div className="w-full max-w-sm mx-auto">
            <div className="mb-8">
              <h2 className="text-2xl font-bold tracking-tight">Welcome back</h2>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                Sign in to your account to continue
              </p>
            </div>
            
            <div className="space-y-6">
              <LoginButton />
              
              <div className="text-center text-xs text-gray-500 dark:text-gray-400 mt-8">
                By signing in, you agree to our{' '}
                <a href="#" className="underline hover:text-primary transition-colors">
                  Terms of Service
                </a>{' '}
                and{' '}
                <a href="#" className="underline hover:text-primary transition-colors">
                  Privacy Policy
                </a>
              </div>
            </div>
          </div>
          
          {/* Abstract decorative element */}
          <div className="absolute bottom-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-3xl"></div>
        </div>
      </div>
    </div>
  );
}