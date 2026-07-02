"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { FolderKanban, LayoutDashboard, LogOut, Menu, Moon, Sun, X } from "lucide-react";
import { useTheme } from "next-themes";
import { cn } from "@/lib/utils";
import { useAuth } from "@/lib/auth";
import { useProject } from "@/lib/queries";
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";

const nav = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/projects", label: "Projects", icon: FolderKanban },
];

function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
      aria-label="Toggle theme"
    >
      {mounted && resolvedTheme === "dark" ? <Sun /> : <Moon />}
    </Button>
  );
}

/** Mono breadcrumb: the top bar's one job is location, not repeating the h1. */
function Breadcrumb() {
  const pathname = usePathname();
  const segments = pathname.split("/").filter(Boolean);
  const projectId = segments[0] === "projects" && segments[1] ? segments[1] : undefined;
  const projectQuery = useProject(projectId);

  const crumbs: { label: string; href?: string }[] = [];
  if (segments[0] === "dashboard") crumbs.push({ label: "Dashboard" });
  if (segments[0] === "projects") {
    crumbs.push(projectId ? { label: "Projects", href: "/projects" } : { label: "Projects" });
    if (projectId) crumbs.push({ label: projectQuery.data?.name ?? "…" });
  }

  return (
    <nav aria-label="Breadcrumb" className="min-w-0 flex-1">
      <ol className="flex min-w-0 items-center gap-2 font-mono text-xs uppercase tracking-wide text-ink-3">
        {crumbs.map((crumb, i) => (
          <li key={i} className="flex min-w-0 items-center gap-2">
            {i > 0 ? <span aria-hidden>/</span> : null}
            {crumb.href ? (
              <Link href={crumb.href} className="hover:text-ink hover:underline">
                {crumb.label}
              </Link>
            ) : (
              <span className="truncate text-ink-2" aria-current="page">
                {crumb.label}
              </span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}

function SidebarContent({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();
  const { user, logout } = useAuth();

  return (
    <div className="flex h-full flex-col">
      <div className="border-b border-rule px-5 py-4">
        <Link href="/dashboard" onClick={onNavigate} className="inline-block">
          <span className="font-serif text-lg italic tracking-tight text-ink">TaskFlow</span>
        </Link>
      </div>

      <nav className="flex-1 px-2 py-4">
        <p className="px-3 pb-2 text-[11px] font-semibold uppercase tracking-[0.08em] text-ink-3">
          Workspace
        </p>
        {nav.map(({ href, label, icon: Icon }) => {
          const active = pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              onClick={onNavigate}
              className={cn(
                "relative flex h-9 items-center gap-2.5 px-3 text-[13px] font-medium transition-colors duration-100",
                active
                  ? "bg-accent-wash text-ink"
                  : "text-ink-2 hover:bg-sunken hover:text-ink",
              )}
            >
              <span
                className={cn(
                  "absolute inset-y-0 left-0 w-0.5 bg-accent",
                  active ? "opacity-100" : "opacity-0",
                )}
              />
              <Icon className="h-4 w-4" />
              {label}
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-rule p-3">
        <div className="flex items-center gap-2.5 px-1">
          <Avatar name={user?.name ?? "?"} />
          <div className="min-w-0 flex-1">
            <p className="truncate text-[13px] font-medium text-ink">{user?.name}</p>
            <p className="truncate font-mono text-[10px] uppercase tracking-wide text-ink-3">
              {user?.role ?? ""}
            </p>
          </div>
          <Button variant="ghost" size="iconSm" onClick={logout} aria-label="Log out">
            <LogOut />
          </Button>
        </div>
      </div>
    </div>
  );
}

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => setMobileOpen(false), [pathname]);

  return (
    <div className="min-h-screen bg-paper text-ink">
      {/* Desktop sidebar — same surface as the page, one hairline */}
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-[220px] border-r border-rule bg-paper md:block">
        <SidebarContent />
      </aside>

      {/* Mobile slide-over */}
      {mobileOpen ? (
        <div className="fixed inset-0 z-50 md:hidden">
          <div className="absolute inset-0 bg-flip/45" onClick={() => setMobileOpen(false)} />
          <div className="absolute inset-y-0 left-0 w-[260px] animate-rise border-r border-rule-2 bg-paper shadow-overlay">
            <Button
              variant="ghost"
              size="iconSm"
              className="absolute right-2 top-3.5 z-10"
              onClick={() => setMobileOpen(false)}
              aria-label="Close menu"
            >
              <X />
            </Button>
            <SidebarContent onNavigate={() => setMobileOpen(false)} />
          </div>
        </div>
      ) : null}

      <main className="md:pl-[220px]">
        <header className="sticky top-0 z-30 border-b border-rule bg-paper">
          <div className="flex h-12 items-center gap-3 px-4 md:px-6">
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden"
              onClick={() => setMobileOpen(true)}
              aria-label="Open menu"
            >
              <Menu className="h-5 w-5" />
            </Button>
            <Breadcrumb />
            <ThemeToggle />
          </div>
        </header>
        <div className="mx-auto max-w-[1120px] px-4 py-6 md:px-6 md:py-8">{children}</div>
      </main>
    </div>
  );
}
