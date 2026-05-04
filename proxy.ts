// middleware.ts
// Place this at the root of your project (same level as /app)
// Clerk uses this to protect routes and manage session tokens.

import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

// Define routes that are publicly accessible without authentication
const isPublicRoute = createRouteMatcher([
  "/",                    // landing page
  "/sign-in(.*)",         // Clerk sign-in
  "/sign-up(.*)",         // Clerk sign-up
  "/products(.*)",        // product catalog is public
  "/api/webhooks/clerk",  // Clerk webhook MUST be public
]);

export default clerkMiddleware(async (auth, request) => {
  if (!isPublicRoute(request)) {
    await auth.protect();
  }
});

export const config = {
  matcher: [
    // Skip Next.js internals and static files
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    // Always run for API routes
    "/(api|trpc)(.*)",
  ],
};
