import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Create Account",
  description: "Create your URBN account.",
};

export default function SignupPage() {
  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-display font-bold text-gradient mb-2">
            URBN
          </h1>
          <p className="text-text-muted">Create your account</p>
        </div>

        {/* TODO: Implement signup form with NextAuth */}
        <div className="glass rounded-2xl p-8">
          <p className="text-text-muted text-center">
            Registration coming soon.
          </p>
        </div>
      </div>
    </div>
  );
}
