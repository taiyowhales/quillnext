import NextAuth from "next-auth";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { db } from "@/server/db";
import { authConfig } from "./auth.config";

/**
 * Main Auth.js entry point
 * Combines edge-safe config with database adapter
 */
export const {
  handlers: { GET, POST },
  auth,
  signIn,
  signOut,
} = NextAuth({
  adapter: PrismaAdapter(db),
  session: { strategy: "jwt" },
  ...authConfig,
  providers: [
    // TODO: Add your providers here
    // Example:
    // Google({
    //   clientId: process.env.GOOGLE_CLIENT_ID,
    //   clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    // }),
    // Email({
    //   server: process.env.EMAIL_SERVER,
    //   from: process.env.EMAIL_FROM,
    // }),
  ],
});

