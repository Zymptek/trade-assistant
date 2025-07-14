import { getToken } from 'next-auth/jwt'
import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'

// Paths that don't require authentication
const publicPaths = ['/login', '/api/auth']

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

  // Check if path requires authentication
  const pathname = request.nextUrl.pathname
  
  // Check if this is an API route
  const isApiRoute = pathname.startsWith('/api');
  
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

    // Allow access to all authenticated users
    return response
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
}

// Configure middleware to run on all routes except static files
export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|images|.*\\.png$).*)'],
}
