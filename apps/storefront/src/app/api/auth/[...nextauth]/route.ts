import NextAuth, { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";

const MEDUSA_URL = process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL!;
const JWT_SECRET = process.env.JWT_SECRET || "change-me-in-production";

/**
 * NextAuth configuration.
 * Uses Medusa customer authentication as the credential source.
 * Login flow: POST /store/auth/token → Medusa returns a JWT → we validate and store session.
 */
export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;

        // Authenticate via Medusa
        const res = await fetch(`${MEDUSA_URL}/store/auth/token`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email: credentials.email,
            password: credentials.password,
          }),
        });

        if (!res.ok) return null;

        const { customer } = await res.json();

        return {
          id: customer.id,
          email: customer.email,
          name: `${customer.first_name || ""} ${customer.last_name || ""}`.trim(),
        };
      },
    }),
  ],
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  jwt: {
    secret: JWT_SECRET,
    maxAge: 30 * 24 * 60 * 60,
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.medusaCustomerId = user.id;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as { medusaCustomerId?: string }).medusaCustomerId =
          token.medusaCustomerId as string;
      }
      return session;
    },
  },
  pages: {
    signIn: "/login",
  },
  secret: JWT_SECRET,
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
