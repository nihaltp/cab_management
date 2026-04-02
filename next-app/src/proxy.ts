import { type NextRequest } from 'next/server'
import { createClient } from '@/utils/supabase/middleware'

export async function proxy(request: NextRequest) {
  // This createClient call will securely refresh the user's Supabase auth session
  // if their token has expired but they still have a valid refresh token cookie.
  const response = createClient(request)
  return response
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * Feel free to modify this pattern to include more paths.
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
