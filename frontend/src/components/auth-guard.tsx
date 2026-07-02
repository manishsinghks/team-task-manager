"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { useAuth } from "@/lib/auth";

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !user) {
      router.replace("/login");
    }
  }, [isLoading, user, router]);

  if (isLoading) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-paper text-ink">
        <span className="font-serif text-2xl italic tracking-tight">TaskFlow</span>
        <div className="flex items-center gap-2 font-mono text-xs uppercase tracking-wide text-ink-3">
          <Loader2 className="h-3.5 w-3.5 animate-spin" />
          Loading your workspace…
        </div>
      </div>
    );
  }

  if (!user) return null;

  return <>{children}</>;
}
