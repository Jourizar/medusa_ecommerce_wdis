"use client";

import { useSession, signIn, signOut } from "next-auth/react";

/**
 * Auth hook wrapping NextAuth session management.
 * Provides user data, auth state, and sign in/out methods.
 */
export function useAuth() {
  const { data: session, status, update } = useSession();

  return {
    user: session?.user ?? null,
    session,
    status, // "loading" | "authenticated" | "unauthenticated"
    isAuthenticated: status === "authenticated",
    isLoading: status === "loading",
    signIn,
    signOut,
    update,
  };
}
