import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(req) {
    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token }) => !!token,
    },
  }
);

export const config = {
  matcher: [
    /*
     * Match all request paths EXCEPT:
     * - /login (auth page)
     * - /api/auth/* (NextAuth routes)
     * - /_next/static (Next.js static files)
     * - /_next/image (Next.js image optimization)
     * - /favicon.ico
     * - /public files (images, etc.)
     */
    "/((?!login|api/auth|_next/static|_next/image|favicon.ico|.*\\.(?:png|jpg|jpeg|gif|webp|svg|ico)).*)",
  ],
};
