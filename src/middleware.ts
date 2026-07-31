import { withAuth } from "next-auth/middleware"

export default withAuth({
  pages: {
    signIn: "/login",
  },
})

export const config = {
  matcher: [
    /*
     * Protect everything EXCEPT:
     * - /login (auth page)
     * - /api/auth (next-auth endpoints)
     * - /_next (Next.js internals)
     * - /favicon.ico, images, etc.
     */
    "/((?!login|api/auth|_next/static|_next/image|favicon.ico).*)",
  ],
}
