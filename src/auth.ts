import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { PrismaClient } from "@prisma/client";
import { db } from "@/server/db";
import { authConfig } from "./auth.config";

// Create a separate Prisma client for the adapter (no Accelerate extension)
// Uses same URL as main client but WITHOUT the withAccelerate() extension
// This avoids SSL connection conflicts during auth callbacks
const adapterClient = new PrismaClient({
  accelerateUrl: process.env.DATABASE_URL,
});

/**
 * Main Auth.js entry point
 * Combines edge-safe config with database adapter
 */
const authInstance = NextAuth({
  adapter: PrismaAdapter(adapterClient),
  session: { strategy: "jwt" },
  secret: process.env.AUTH_SECRET || process.env.NEXTAUTH_SECRET,
  debug: false,
  ...authConfig,
  cookies: {
    // Explicitly configure PKCE cookie for production
    pkceCodeVerifier: {
      name: "__Secure-next-auth.pkce.code_verifier",
      options: {
        httpOnly: true,
        sameSite: "lax",
        secure: true, // Required for HTTPS in production
        domain: process.env.NODE_ENV === "production" ? ".quillandcompass.app" : undefined,
        path: "/",
      },
    },
  },
  callbacks: {
    ...authConfig.callbacks,
    async jwt({ token, user, trigger, session }) {
      if (user) {
        token.id = user.id;
        token.organizationId = (user as any).organizationId;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user && token.id) {
        session.user.id = token.id as string;
        (session.user as any).organizationId = token.organizationId as string;
      }
      return session;
    },
  },
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      allowDangerousEmailAccountLinking: true, // Allow linking accounts with same email
    }),
  ],
});

// Export handlers for API routes
export const { handlers, auth, signIn, signOut } = authInstance;

// Also export GET and POST directly for convenience
export const { GET, POST } = handlers;

