import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  // Better Auth handles sessions via cookies automatically
  // No need for manual session refresh like Supabase
  
  // Optional: Add route protection here if needed
  // For now, we'll let all requests through
  // Better Auth will handle authentication at the route/component level
  
  return NextResponse.next({
    request,
  })
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
