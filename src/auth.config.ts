import type { NextAuthConfig } from "next-auth";

/**
 * Edge-safe Auth.js configuration
 * This file is used by Proxy and must be edge-compatible
 */
export const authConfig = {
  providers: [], // Providers added in auth.ts

  pages: {
    signIn: "/login",
  },

  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;
      const isOnDashboard = nextUrl.pathname.startsWith("/dashboard");
      const isOnOnboarding = nextUrl.pathname.startsWith("/onboarding");

      // Protect dashboard routes
      if (isOnDashboard) {
        if (isLoggedIn) return true;
        return false; // Redirect unauthenticated users to login page
      }

      // Allow onboarding for authenticated users
      if (isOnOnboarding) {
        return isLoggedIn;
      }

      // Allow public routes
      return true;
    },
  },
} satisfies NextAuthConfig;

