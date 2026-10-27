import { Suspense } from "react";
import type { Metadata } from "next";
import { AuthForm } from "@/components/account/auth-form";

export const metadata: Metadata = {
  title: "Sign In",
  description: "Sign in to your WDIS account.",
  robots: { index: false, follow: true },
  alternates: { canonical: "/login" },
};

export default function LoginPage() {
  return (
    <div className="max-w-md mx-auto px-4 py-16">
      <h1 className="text-brutal text-5xl text-black mb-8 text-center">
        SIGN <span className="bg-accent px-3 inline-block border-[5px] border-black -rotate-1">IN</span>
      </h1>
      <Suspense>
        <AuthForm mode="login" />
      </Suspense>
    </div>
  );
}
