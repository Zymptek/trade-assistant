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
      // Add user ID to the session
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
    // Ensure proper redirect after sign in
    async redirect({ url, baseUrl }) {
      // Use NEXTAUTH_URL if available, otherwise use the detected baseUrl
      const actualBaseUrl = process.env.NEXTAUTH_URL || baseUrl;
      
      // If url is relative, make it absolute
      if (url.startsWith('/')) {
        return `${actualBaseUrl}${url}`;
      }
      
      // If url is on same origin, allow it
      if (new URL(url).origin === actualBaseUrl) {
        return url;
      }
      
      // Otherwise, redirect to base
      return actualBaseUrl;
    },
  },
  pages: {
    signIn: '/login',
  },
  // Disable debug mode to prevent printing CSRF and other sensitive information
  debug: false,
}; 