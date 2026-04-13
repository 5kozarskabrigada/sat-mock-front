import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  // Auth is handled in client layouts/pages via JWT in localStorage.
  // This middleware currently only preserves route passthrough behavior.
  
  // Optional: Add route protection here if needed
  // For now, we'll let all requests through
  // Route guards are enforced in app components.
  
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
