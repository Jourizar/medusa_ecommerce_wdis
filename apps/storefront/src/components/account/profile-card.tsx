"use client";

import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { User, Mail, LogOut } from "lucide-react";

export function ProfileCard() {
  const { user, signOut } = useAuth();

  if (!user) {
    return (
      <div className="glass rounded-2xl p-6 text-center">
        <User className="w-12 h-12 text-text-muted/40 mx-auto mb-3" />
        <p className="text-text-muted">Sign in to view your profile</p>
        <Button asChild className="mt-4">
          <a href="/login">Sign In</a>
        </Button>
      </div>
    );
  }

  return (
    <div className="glass rounded-2xl p-6 space-y-4">
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center">
          <User className="w-6 h-6 text-primary" />
        </div>
        <div>
          <p className="font-medium text-text">{user.name || "User"}</p>
          <p className="text-sm text-text-muted">{user.email}</p>
        </div>
      </div>

      <div className="space-y-2">
        <div className="flex items-center gap-2 text-sm text-text-muted">
          <Mail className="w-4 h-4" />
          <span>{user.email}</span>
        </div>
      </div>

      <Button
        variant="outline"
        size="sm"
        className="w-full"
        onClick={() => signOut({ callbackUrl: "/" })}
      >
        <LogOut className="w-4 h-4 mr-2" />
        Sign Out
      </Button>
    </div>
  );
}
