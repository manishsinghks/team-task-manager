"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ThemeProvider } from "next-themes";
import { useState } from "react";
import { Toaster } from "sonner";
import { AuthProvider } from "@/lib/auth";

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: { staleTime: 30_000, retry: 1 },
        },
      }),
  );

  return (
    <ThemeProvider attribute="class" defaultTheme="light" enableSystem={false}>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          {children}
          <Toaster
            position="bottom-right"
            gap={8}
            toastOptions={{
              style: {
                background: "var(--raised)",
                color: "var(--ink)",
                border: "1px solid var(--rule-2)",
                borderRadius: "6px",
                boxShadow: "0 12px 32px -12px rgb(29 27 22 / 0.35)",
                fontFamily: "var(--font-spline-mono), ui-monospace, monospace",
                fontSize: "13px",
              },
            }}
          />
        </AuthProvider>
      </QueryClientProvider>
    </ThemeProvider>
  );
}
