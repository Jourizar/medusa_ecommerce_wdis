"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { signIn } from "next-auth/react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface AuthFormProps {
  mode: "login" | "signup";
}

/**
 * Shared sign-in / sign-up form. Sign-up creates the Medusa customer via
 * /api/auth/register, then signs in with the same credentials so the user
 * lands back where they came from in one step.
 */
export function AuthForm({ mode }: AuthFormProps) {
  const router = useRouter();
  const params = useSearchParams();
  const callbackUrl = safeCallback(params.get("callbackUrl"));

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);

    try {
      if (mode === "signup") {
        const res = await fetch("/api/auth/register", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email,
            password,
            first_name: firstName,
            last_name: lastName,
          }),
        });
        if (!res.ok) {
          const { error } = await res.json().catch(() => ({ error: null }));
          setError(error ?? "Could not create your account.");
          return;
        }
      }

      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      if (!result || result.error) {
        setError("Wrong email or password.");
        return;
      }

      // Landing on the account page shows a welcome banner; other callbacks
      // (e.g. checkout) are left alone so the shopper isn't pulled away.
      router.push(
        callbackUrl === "/account"
          ? `/account?welcome=${mode === "signup" ? "new" : "back"}`
          : callbackUrl
      );
      router.refresh();
    } finally {
      setBusy(false);
    }
  }

  const isSignup = mode === "signup";
  const otherHref = `${isSignup ? "/login" : "/signup"}${
    callbackUrl !== "/account" ? `?callbackUrl=${encodeURIComponent(callbackUrl)}` : ""
  }`;

  return (
    <form
      onSubmit={onSubmit}
      className="bg-cream border-[5px] border-black shadow-[6px_6px_0_0_#000] p-6 md:p-8 space-y-4"
    >
      {isSignup && (
        <div className="grid grid-cols-2 gap-4">
          <Input
            label="First name"
            id="first_name"
            autoComplete="given-name"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
          />
          <Input
            label="Last name"
            id="last_name"
            autoComplete="family-name"
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
          />
        </div>
      )}

      <Input
        label="Email"
        id="email"
        type="email"
        autoComplete="email"
        required
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />
      <Input
        label="Password"
        id="password"
        type="password"
        autoComplete={isSignup ? "new-password" : "current-password"}
        minLength={isSignup ? 8 : undefined}
        required
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />

      {error && (
        <p
          role="alert"
          className="bg-hotpink border-[3px] border-black p-3 text-sm font-bold uppercase tracking-wide"
        >
          {error}
        </p>
      )}

      <Button type="submit" size="lg" loading={busy} className="w-full">
        {isSignup ? "Create account" : "Sign in"}
      </Button>

      <p className="text-xs font-bold uppercase tracking-wider text-center">
        {isSignup ? "Already have an account? " : "New here? "}
        <Link href={otherHref} className="underline decoration-2 underline-offset-4">
          {isSignup ? "Sign in" : "Create an account"}
        </Link>
      </p>
      <p className="text-xs font-bold uppercase tracking-wider text-center text-muted">
        No account needed to check out —{" "}
        <Link href="/cart" className="underline decoration-2 underline-offset-4">
          continue as guest
        </Link>
      </p>
    </form>
  );
}

/** Only allow same-site relative redirects. */
function safeCallback(value: string | null): string {
  if (value && value.startsWith("/") && !value.startsWith("//")) return value;
  return "/account";
}
