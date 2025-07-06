// app/login/page.tsx
import LoginButton from '@/components/auth/login-button';
import ZymptekLogo from '@/components/zymptek-logo';
import { getCurrentUser } from '@/lib/auth/session';
import { redirect } from 'next/navigation';

export default async function LoginPage() {
  // If user is already logged in, redirect to home page
  const user = await getCurrentUser();
  if (user) {
    redirect('/');
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 flex items-center justify-center p-4 md:p-6">
      <div className="w-full max-w-5xl grid grid-cols-1 lg:grid-cols-5 overflow-hidden rounded-3xl shadow-[0_20px_80px_-10px_rgba(0,0,0,0.1)] bg-white/90 dark:bg-slate-900/90 backdrop-blur-sm border border-white/20 dark:border-slate-800/20">
        
        {/* Left panel - Information (3/5 width on desktop) */}
        <div className="lg:col-span-3 p-8 md:p-12 lg:p-16 flex flex-col justify-center relative overflow-hidden">
          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-8">
              <div className="w-12 h-12">
                <ZymptekLogo variant="icon-only" className="w-full h-full" />
              </div>
              <h2 className="text-lg font-semibold tracking-tight bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500 bg-clip-text text-transparent">Zymptek</h2>
            </div>
            
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent mb-6">
              Trade Intelligence, Simplified
            </h1>
            
            <p className="text-lg text-slate-600 dark:text-slate-400 mb-8 max-w-md leading-relaxed">
              Access real-time data on HTS codes, tariffs, and international trade regulations through our AI-powered assistant.
            </p>
            
            <div className="space-y-5">
              {[
                { title: "HTS Code Lookup", desc: "Instant access to accurate Harmonized Tariff Schedule codes" },
                { title: "Tariff Calculations", desc: "Up-to-date import duty and tax information" },
                { title: "Regulatory Guidance", desc: "Clear explanations of complex trade regulations" }
              ].map((feature, i) => (
                <div key={i} className="flex items-start gap-3">
                  <div className="mt-1 size-5 flex-shrink-0 rounded-full bg-gradient-to-r from-blue-500/20 to-indigo-500/20 flex items-center justify-center">
                    <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-blue-600 dark:text-blue-400">
                      <path d="M10 3L4.5 8.5L2 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-semibold text-slate-900 dark:text-slate-100">{feature.title}</h3>
                    <p className="text-sm text-slate-600 dark:text-slate-400">{feature.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          {/* Abstract decorative elements */}
          <div className="absolute -bottom-16 -left-16 w-64 h-64 bg-gradient-to-r from-blue-500/10 to-indigo-500/10 rounded-full blur-3xl"></div>
          <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-r from-indigo-500/10 to-purple-500/10 rounded-full blur-3xl"></div>
          <div className="absolute top-1/2 left-1/3 w-32 h-32 bg-gradient-to-r from-purple-500/5 to-blue-500/5 rounded-full blur-2xl"></div>
        </div>
        
        {/* Right panel - Login (2/5 width on desktop) */}
        <div className="lg:col-span-2 bg-slate-50/50 dark:bg-slate-800/50 p-8 md:p-12 flex flex-col justify-center relative backdrop-blur-sm">
          <div className="w-full max-w-sm mx-auto">
            <div className="mb-8">
              <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100">Welcome back</h2>
              <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                Sign in to your account to continue
              </p>
            </div>
            
            <div className="space-y-6">
              <LoginButton />
              
              <div className="text-center text-xs text-slate-500 dark:text-slate-400 mt-8">
                By signing in, you agree to our{' '}
                <a href="#" className="underline hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                  Terms of Service
                </a>{' '}
                and{' '}
                <a href="#" className="underline hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                  Privacy Policy
                </a>
              </div>
            </div>
          </div>
          
          {/* Abstract decorative element */}
          <div className="absolute bottom-0 right-0 w-32 h-32 bg-gradient-to-r from-indigo-500/10 to-purple-500/10 rounded-full blur-3xl"></div>
        </div>
      </div>
    </div>
  );
}