import { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";

// Make sure we have a valid secret
const NEXTAUTH_SECRET = process.env.NEXTAUTH_SECRET;
if (!NEXTAUTH_SECRET) {
  throw new Error("NEXTAUTH_SECRET is not set in environment variables");
}

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
    }),
  ],
  secret: NEXTAUTH_SECRET,
  session: {
    strategy: "jwt", // Use JWT for local development
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  callbacks: {
    async session({ session, token }) {
      // Add user ID to the session from JWT token
      if (session.user && token.sub) {
        session.user.id = token.sub;
      }
      return session;
    },
    // Add JWT callback to customize token
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
      }
      return token;
    },
  },
  pages: {
    signIn: '/login',
  },
  // Disable debug mode to prevent printing CSRF and other sensitive information
  debug: false,
}; 