import { Suspense } from "react";
import type { Metadata } from "next";
import { AuthForm } from "@/components/account/auth-form";

export const metadata: Metadata = {
  title: "Create Account",
  description: "Create a WDIS account to track your orders.",
  robots: { index: false, follow: true },
  alternates: { canonical: "/signup" },
};

export default function SignupPage() {
  return (
    <div className="max-w-md mx-auto px-4 py-16">
      <h1 className="text-brutal text-5xl text-black mb-8 text-center">
        JOIN <span className="bg-hotpink px-3 inline-block border-[5px] border-black rotate-1">WDIS</span>
      </h1>
      <Suspense>
        <AuthForm mode="signup" />
      </Suspense>
    </div>
  );
}
