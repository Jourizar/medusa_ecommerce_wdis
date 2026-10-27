import { cookies } from "next/headers";
import type { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { getToken } from "next-auth/jwt";
import { getMedusaUrl, getPublishableKey } from "@/lib/medusa/client";

/**
 * Customer auth, backed by Medusa v2's emailpass provider.
 *
 * The Medusa customer JWT lives only inside the encrypted NextAuth cookie —
 * it is never put on the client-visible session. Server code reads it with
 * getMedusaToken() and calls the Store API on the customer's behalf.
 *
 * NEXTAUTH_SECRET encrypts that cookie; NextAuth refuses to run in
 * production without it.
 */

/** Exchange email + password for a Medusa customer token, or null. */
export async function medusaLogin(
  email: string,
  password: string
): Promise<string | null> {
  const res = await fetch(`${getMedusaUrl()}/auth/customer/emailpass`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
    cache: "no-store",
  });
  if (!res.ok) return null;
  const { token } = (await res.json()) as { token?: string };
  return token ?? null;
}

interface MedusaCustomer {
  id: string;
  email: string;
  first_name: string | null;
  last_name: string | null;
}

/** Fetch the customer a token belongs to, or null if the token is invalid. */
export async function getCustomerForToken(
  token: string
): Promise<MedusaCustomer | null> {
  const res = await fetch(`${getMedusaUrl()}/store/customers/me`, {
    headers: {
      Authorization: `Bearer ${token}`,
      "x-publishable-api-key": getPublishableKey(),
    },
    cache: "no-store",
  });
  if (!res.ok) return null;
  const { customer } = (await res.json()) as { customer: MedusaCustomer };
  return customer;
}

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

        const token = await medusaLogin(credentials.email, credentials.password);
        if (!token) return null;

        const customer = await getCustomerForToken(token);
        if (!customer) return null;

        return {
          id: customer.id,
          email: customer.email,
          name: [customer.first_name, customer.last_name]
            .filter(Boolean)
            .join(" "),
          medusaToken: token,
        };
      },
    }),
  ],
  session: {
    strategy: "jwt",
    // Matches the Medusa jwtExpiresIn in medusa-config.ts.
    maxAge: 30 * 24 * 60 * 60,
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.medusaCustomerId = user.id;
        token.medusaToken = (user as { medusaToken?: string }).medusaToken;
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
  secret: process.env.NEXTAUTH_SECRET,
};

/**
 * Read the signed-in customer's Medusa token in a server component or
 * route handler. Returns null for guests.
 */
export async function getMedusaToken(): Promise<string | null> {
  const jwt = await getToken({
    // getToken only needs the cookie store; Next's cookies() matches the
    // getAll() shape it looks for.
    req: { cookies: await cookies(), headers: {} } as never,
    secret: process.env.NEXTAUTH_SECRET,
  });
  return (jwt?.medusaToken as string | undefined) ?? null;
}
