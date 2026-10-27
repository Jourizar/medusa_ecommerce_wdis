"use client";

import { signOut } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { User, LogOut } from "lucide-react";

export function ProfileCard({ name, email }: { name: string; email: string }) {
  return (
    <div className="bg-cream border-[5px] border-black shadow-[6px_6px_0_0_#77269A] p-6 space-y-4">
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 border-[3px] border-black bg-accent flex items-center justify-center">
          <User className="w-6 h-6" strokeWidth={3} />
        </div>
        <div className="min-w-0">
          <p className="font-black uppercase tracking-wider truncate">{name || "Welcome"}</p>
          <p className="text-sm font-bold truncate">{email}</p>
        </div>
      </div>
      <Button
        variant="outline"
        size="sm"
        className="w-full"
        onClick={() => signOut({ callbackUrl: "/" })}
      >
        <LogOut className="w-4 h-4 mr-2" />
        Sign out
      </Button>
    </div>
  );
}
