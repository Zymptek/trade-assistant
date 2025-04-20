import { getToken } from 'next-auth/jwt'
import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'
import { getUserProfile } from './lib/actions/user'

// Paths that don't require authentication
const publicPaths = ['/login', '/api/auth']

// Paths that don't require a completed profile
const noProfileCheckPaths = ['/login', '/profile', '/api/auth', '/_next', '/images', '/favicon.ico']

// API routes that should bypass profile completion check
const apiRoutes = ['/api/chat', '/api/completion', '/api/tools']

// Add a type definition for the user profile near the top of the file
interface UserProfile {
  userId: string;
  onboardingCompleted: string | boolean;
  [key: string]: any; // Allow for other profile fields
}

// Simple session storage to temporarily bypass profile check after profile submission
interface SessionData {
  timestamp: number;
  userId: string;
}

// In-memory cache to improve reliability and reduce Redis dependency
const recentProfileSubmissions = new Map<string, SessionData>();
const profileCache = new Map<string, {data: UserProfile, timestamp: number}>();
const PROFILE_CACHE_TTL = 300000; // 5 minutes (increased for better reliability)
const PROFILE_SUBMISSION_TTL = 30000; // 30 seconds (increased significantly)

// Tracking failed profile lookups to avoid constant redirects
const failedProfileLookups = new Map<string, {count: number, timestamp: number}>();
const FAILED_LOOKUP_TTL = 60000; // 1 minute
const MAX_FAILED_LOOKUPS = 3; // After this many consecutive failures, allow access anyway

// Helper function to check if a profile was recently submitted
function wasProfileRecentlySubmitted(userId: string): boolean {
  const data = recentProfileSubmissions.get(userId);
  if (!data) return false;
  
  // Check if submission was within TTL period
  const isRecent = (Date.now() - data.timestamp) < PROFILE_SUBMISSION_TTL;
  
  if (!isRecent) {
    // Clear expired entry
    recentProfileSubmissions.delete(userId);
  }
  
  return isRecent;
}

// Helper function to track failed lookups and determine if we should allow access anyway
function shouldAllowDespiteMissingProfile(userId: string): boolean {
  const now = Date.now();
  const data = failedProfileLookups.get(userId);
  
  // Clear expired entry
  if (data && (now - data.timestamp > FAILED_LOOKUP_TTL)) {
    failedProfileLookups.delete(userId);
    return false;
  }
  
  // If we've had too many failed lookups in a short period, allow access anyway
  if (data && data.count >= MAX_FAILED_LOOKUPS) {
    console.log(`Allowing access despite missing profile for userId=${userId} after ${data.count} failed lookups`);
    return true;
  }
  
  return false;
}

// Helper function to record a failed lookup
function recordFailedLookup(userId: string) {
  const data = failedProfileLookups.get(userId);
  const now = Date.now();
  
  if (data && (now - data.timestamp < FAILED_LOOKUP_TTL)) {
    // Update existing entry
    failedProfileLookups.set(userId, {
      count: data.count + 1,
      timestamp: now
    });
  } else {
    // Create new entry
    failedProfileLookups.set(userId, {
      count: 1,
      timestamp: now
    });
  }
}

export async function middleware(request: NextRequest) {
  // Get protocol and host for constructing URLs
  const protocol = 
    request.headers.get('x-forwarded-proto') || request.nextUrl.protocol
  const host =
    request.headers.get('x-forwarded-host') || request.headers.get('host') || ''
  const baseUrl = `${protocol}${protocol.endsWith(':') ? '//' : '://'}${host}`

  // Add request information to response headers (useful for debugging)
  const response = NextResponse.next()
  response.headers.set('x-url', request.url)
  response.headers.set('x-host', host)
  response.headers.set('x-protocol', protocol)
  response.headers.set('x-base-url', baseUrl)

  // Check if the request is coming from profile submission
  const fromProfileSubmission = request.headers.get('referer')?.includes('/profile');
  
  // Check if path requires authentication
  const pathname = request.nextUrl.pathname
  
  // Check if this is an API route
  const isApiRoute = pathname.startsWith('/api');
  
  // Handle API routes specially to avoid HTML redirects
  const isChatApiRoute = apiRoutes.some(route => pathname.startsWith(route));
  
  try {
    // Get JWT token from request with secure cookie
    const token = await getToken({ 
      req: request, 
      secret: process.env.NEXTAUTH_SECRET,
      secureCookie: process.env.NODE_ENV === 'production',
    })
    
    // Handle login page separately to ensure consistent behavior
    if (pathname === '/login') {
      // If authenticated and on login page, redirect to home
      if (token) {
        return NextResponse.redirect(new URL('/', baseUrl))
      }
      // Otherwise allow access to login page
      return response
    }
    
    // For other paths, check if they're public or need auth
    const isPublicPath = publicPaths.some(path => pathname.startsWith(path))
    
    if (!isPublicPath && !token) {
      // For API routes, return 401 Unauthorized
      if (isApiRoute) {
        return new NextResponse(
          JSON.stringify({ error: 'Authentication required' }),
          { status: 401, headers: { 'Content-Type': 'application/json' } }
        )
      }
      
      // For regular routes, redirect to login
      const loginUrl = new URL('/login', baseUrl)
      loginUrl.searchParams.set('callbackUrl', request.url)
      return NextResponse.redirect(loginUrl)
    }

    // Skip profile check for paths that don't require it or for chat API routes
    const skipProfileCheck = noProfileCheckPaths.some(path => pathname.startsWith(path)) || isChatApiRoute;
    if (skipProfileCheck || !token) {
      return response
    }

    // Check if user has completed profile
    const userId = token.sub
    if (!userId) {
      return response
    }

    // If this request is navigating from profile page, give a grace period
    // This helps with race conditions between profile submission and middleware checks
    if (fromProfileSubmission) {
      console.log(`Request coming from profile submission for userId=${userId}, bypassing profile check temporarily`);
      recentProfileSubmissions.set(userId, { timestamp: Date.now(), userId });
      return response;
    }
    
    // Check if there was a recent profile submission
    if (wasProfileRecentlySubmitted(userId)) {
      console.log(`Recent profile submission detected for userId=${userId}, bypassing profile check`);
      return response;
    }
    
    // Check if we should allow access despite missing profile (due to repeated failures)
    if (shouldAllowDespiteMissingProfile(userId)) {
      response.headers.set('x-profile-check', 'bypass-after-failures');
      return response;
    }

    // Check cached profile first
    const cachedProfile = profileCache.get(userId);
    if (cachedProfile && (Date.now() - cachedProfile.timestamp < PROFILE_CACHE_TTL)) {
      console.log(`Using cached profile for userId=${userId}`);
      
      // Convert onboardingCompleted to boolean if it's a string
      const onboardingCompleted = 
        typeof cachedProfile.data.onboardingCompleted === 'string' 
          ? cachedProfile.data.onboardingCompleted === 'true'
          : !!cachedProfile.data.onboardingCompleted;
      
      response.headers.set('x-profile-source', 'cache');
      response.headers.set('x-onboarding-completed', String(onboardingCompleted));
      
      if (!onboardingCompleted) {
        console.log(`Redirecting to profile: Cached profile shows onboarding not completed for user ${userId}`);
        const profileUrl = new URL('/profile', baseUrl);
        return NextResponse.redirect(profileUrl);
      }
      
      return response;
    }
    
    // Get user profile with retries
    let profile = null;
    let attempts = 0;
    const maxAttempts = 5;
    
    // Update the fetchWithTimeout function to specify return type
    const fetchWithTimeout = async (timeoutMs = 1000): Promise<UserProfile | null> => {
      return Promise.race([
        getUserProfile(userId) as Promise<UserProfile | null>,
        new Promise<null>((_, reject) => 
          setTimeout(() => reject(new Error('Redis operation timed out')), timeoutMs)
        )
      ]);
    };
    
    while (!profile && attempts < maxAttempts) {
      try {
        // Use increasing timeouts for each attempt
        const timeout = 1000 + (attempts * 500); // 1s, 1.5s, 2s, 2.5s, 3s
        profile = await fetchWithTimeout(timeout);
        
        if (profile) {
          console.log(`Profile found on attempt ${attempts+1} for userId=${userId}`);
          // Cache the successful profile fetch
          profileCache.set(userId, {data: profile, timestamp: Date.now()});
          break;
        }
        
        attempts++;
        console.log(`Profile fetch attempt ${attempts} for userId=${userId}: Not found`);
        
        if (attempts < maxAttempts) {
          // Use exponential backoff for retries
          const delay = 500 * Math.pow(1.5, attempts-1); // 500ms, 750ms, 1125ms, 1688ms
          await new Promise(resolve => setTimeout(resolve, delay));
        }
      } catch (error) {
        attempts++;
        console.error(`Error fetching profile on attempt ${attempts}:`, error);
        
        if (attempts < maxAttempts) {
          // Use exponential backoff with jitter for retries
          const baseDelay = 500 * Math.pow(1.5, attempts-1);
          const jitter = Math.random() * 200; // Add up to 200ms of random jitter
          await new Promise(resolve => setTimeout(resolve, baseDelay + jitter));
        }
      }
    }
    
    // Add debug headers
    response.headers.set('x-profile-check', profile ? 'found' : 'not-found');
    response.headers.set('x-profile-attempts', attempts.toString());
    response.headers.set('x-profile-source', 'fetch');
    
    if (profile) {
      response.headers.set('x-onboarding-status', String(profile.onboardingCompleted));
    }
    
    // If profile doesn't exist after retries
    if (!profile) {
      // Record this failed lookup
      recordFailedLookup(userId);
      
      // One last attempt with a longer timeout
      try {
        console.log(`Making final attempt to fetch profile for userId=${userId} with extended timeout`);
        profile = await Promise.race([
          getUserProfile(userId) as Promise<UserProfile | null>,
          new Promise<null>((_, reject) => setTimeout(() => reject(new Error('Final fetch timed out')), 5000))
        ]);
        
        if (profile) {
          console.log(`Profile found on final attempt for userId=${userId}`);
          // Cache the successful profile fetch
          profileCache.set(userId, {data: profile, timestamp: Date.now()});
        }
      } catch (error) {
        console.error(`Error on final profile fetch attempt:`, error);
      }
      
      // If still no profile, check again if we should bypass due to repeated failures
      if (!profile) {
        if (shouldAllowDespiteMissingProfile(userId)) {
          response.headers.set('x-profile-check', 'bypass-after-final-failure');
          return response;
        }
        
        console.log(`Redirecting to profile: No profile found for user ${userId} after ${attempts+1} attempts`);
        const profileUrl = new URL('/profile', baseUrl);
        return NextResponse.redirect(profileUrl);
      }
    }
    
    // Convert onboardingCompleted to boolean if it's a string
    const onboardingCompleted = 
      typeof profile.onboardingCompleted === 'string' 
        ? profile.onboardingCompleted === 'true'
        : !!profile.onboardingCompleted;
    
    response.headers.set('x-onboarding-completed', String(onboardingCompleted));

    // If onboarding isn't completed, redirect to profile page
    if (!onboardingCompleted) {
      console.log(`Redirecting to profile: Onboarding not completed for user ${userId}`);
      const profileUrl = new URL('/profile', baseUrl);
      return NextResponse.redirect(profileUrl);
    }
  } catch (error) {
    console.error('Middleware error:', error);
    // If there's an error verifying the token, handle differently for API routes
    if (isApiRoute) {
      return new NextResponse(
        JSON.stringify({ error: 'Authentication error' }),
        { status: 401, headers: { 'Content-Type': 'application/json' } }
      );
    }
    // For regular routes, redirect to login
    return NextResponse.redirect(new URL('/login', baseUrl));
  }

  return response;
}

// Configure middleware to run on all routes except static files
export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|images|.*\\.png$).*)'],
}
