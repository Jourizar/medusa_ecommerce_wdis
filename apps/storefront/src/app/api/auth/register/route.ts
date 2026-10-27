import { NextRequest, NextResponse } from "next/server";
import { getMedusaUrl, getPublishableKey } from "@/lib/medusa/client";

/**
 * Create a Medusa customer account.
 * Medusa v2 does this in two calls: register an auth identity (returns a
 * registration token), then create the customer with that token. The client
 * signs in through NextAuth afterwards.
 */
export async function POST(req: NextRequest) {
  const { email, password, first_name, last_name } = (await req
    .json()
    .catch(() => ({}))) as Record<string, string | undefined>;

  if (!email || !password || password.length < 8) {
    return NextResponse.json(
      { error: "Enter an email and a password of at least 8 characters." },
      { status: 400 }
    );
  }

  const registerRes = await fetch(
    `${getMedusaUrl()}/auth/customer/emailpass/register`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
      cache: "no-store",
    }
  );

  if (!registerRes.ok) {
    const { message } = await registerRes.json().catch(() => ({ message: "" }));
    const exists = /exist/i.test(message ?? "");
    return NextResponse.json(
      {
        error: exists
          ? "An account with this email already exists. Sign in instead."
          : "Could not create your account. Please try again.",
      },
      { status: exists ? 409 : 400 }
    );
  }

  const { token } = (await registerRes.json()) as { token: string };

  const customerRes = await fetch(`${getMedusaUrl()}/store/customers`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
      "x-publishable-api-key": getPublishableKey(),
    },
    body: JSON.stringify({ email, first_name, last_name }),
    cache: "no-store",
  });

  if (!customerRes.ok) {
    return NextResponse.json(
      { error: "Could not create your account. Please try again." },
      { status: 400 }
    );
  }

  return NextResponse.json({ ok: true }, { status: 201 });
}
