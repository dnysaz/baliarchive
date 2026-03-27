import { withAuth, NextRequestWithAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(req: NextRequestWithAuth) {
    const { pathname } = req.nextUrl;
    const method = req.method;
    const token = req.nextauth.token;

    // Manual API Protection: Returns JSON instead of HTML Redirect
    if (pathname.startsWith("/api/")) {
      // 1. PUBLIC ACTIONS: Allow everyone to 'view' (POST) or 'action' (PATCH)
      const isPublicAction = pathname.endsWith("/view") || pathname.endsWith("/action");
      
      // 2. ADMIN-ONLY CONTENT: GET requests for admin data (like drafts) require a token
      const isAdminGet = method === "GET" && req.nextUrl.searchParams.get("admin") === "true";
      
      // 3. PUBLIC CONTENT: Standard GET for public display is allowed
      const isPublicGet = method === "GET" && !isAdminGet;

      // REJECT: Accessing admin data or Modification methods (POST/PUT/DELETE) without a token
      if ((isAdminGet || (!isPublicGet && !isPublicAction)) && !token) {
        return NextResponse.json(
          { error: "Authentication required for this action" },
          { status: 401 }
        );
      }
    }
    
    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        const { pathname } = req.nextUrl;

        // A. Handled manually in the middleware function above (to return JSON for API)
        if (pathname.startsWith("/api/")) return true;

        // B. Allow access to the admin login page
        if (pathname === "/admin/login") return true;

        // C. All other /admin paths require a token (NextAuth redirects if missing)
        if (pathname.startsWith("/admin")) return !!token;

        return true;
      },
    },
    pages: {
      signIn: "/admin/login",
    },
  }
);

export const config = {
  // Apply middleware only to admin and relevant API routes
  matcher: [
    "/admin/:path*",
    "/api/posts",
    "/api/posts/:path*",
    "/api/locations",
    "/api/locations/:path*",
    "/api/hashtags",
    "/api/hashtags/:path*",
  ],
};
