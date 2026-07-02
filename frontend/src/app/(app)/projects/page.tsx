"use client";

import { useState } from "react";
import Link from "next/link";
import { format } from "date-fns";
import { ChevronRight, Loader2, Plus } from "lucide-react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/lib/auth";
import { useProjects } from "@/lib/queries";
import { api } from "@/lib/api";
import type { ApiResponse, Project, Role } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Modal } from "@/components/ui/modal";
import { Ledger, LedgerHead } from "@/components/ui/ledger";
import { Loading } from "@/components/common/Loading";
import { EmptyState } from "@/components/common/EmptyState";

const schema = z.object({
  name: z.string().min(2).max(120),
  description: z.string().max(2000).optional().or(z.literal("")),
});

type FormData = z.infer<typeof schema>;

const COLS = "minmax(0,1fr) 72px 88px 100px 16px";

export default function ProjectsPage() {
  const { user } = useAuth();
  const query = useProjects();
  const queryClient = useQueryClient();
  const [createOpen, setCreateOpen] = useState(false);

  const isAdmin = user?.role === ("ADMIN" as Role);

  const createProject = useMutation({
    mutationFn: async (payload: { name: string; description?: string }) => {
      const res = await api.post<ApiResponse<Project>>("/projects", payload);
      return res.data.data;
    },
    onSuccess: () => {
      toast.success("Project created");
      queryClient.invalidateQueries({ queryKey: ["projects"] });
      setCreateOpen(false);
    },
    onError: (err) => {
      toast.error(err instanceof Error ? err.message : "Failed to create project");
    },
  });

  const form = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { name: "", description: "" },
  });

  const onSubmit = async (values: FormData) => {
    await createProject.mutateAsync({
      name: values.name,
      description: values.description ? values.description : undefined,
    });
    form.reset();
  };

  if (query.isLoading) {
    return <Loading lines={5} />;
  }

  if (query.isError) {
    return (
      <EmptyState
        title="Couldn’t load projects."
        description="Check your API connection and try again."
        action={{ label: "Retry", onClick: () => query.refetch() }}
      />
    );
  }

  const projects = query.data ?? [];

  return (
    <div className="animate-rise space-y-6">
      <div className="flex items-end justify-between gap-4">
        <h1 className="font-serif text-[28px] font-medium leading-tight tracking-tight">
          Projects
        </h1>
        <div className="flex items-center gap-4">
          <span className="font-mono text-xs uppercase tracking-wide text-ink-3">
            {projects.length} {projects.length === 1 ? "project" : "projects"}
          </span>
          {isAdmin ? (
            <Button onClick={() => setCreateOpen(true)}>
              <Plus />
              New project
            </Button>
          ) : null}
        </div>
      </div>

      {projects.length ? (
        <Ledger>
          <LedgerHead cols={COLS} className="hidden md:grid">
            <span>Project</span>
            <span className="text-right">Tasks</span>
            <span className="text-right">Members</span>
            <span className="text-right">Updated</span>
            <span />
          </LedgerHead>
          <ul>
            {projects.map((p) => (
              <li key={p.id} className="border-b border-rule last:border-b-0">
                <Link
                  href={`/projects/${p.id}`}
                  className="group block px-4 py-2.5 transition-colors duration-100 hover:bg-sunken"
                >
                  {/* Desktop: ruled columns · Mobile: two stacked lines */}
                  <span className="hidden md:grid md:items-center md:gap-4" style={{ gridTemplateColumns: COLS }}>
                    <span className="min-w-0">
                      <span className="block truncate text-[13px] font-medium text-ink">
                        {p.name}
                      </span>
                      {p.description ? (
                        <span className="block truncate text-xs text-ink-3">{p.description}</span>
                      ) : null}
                    </span>
                    <span className="text-right font-mono text-xs text-ink-2">
                      {p._count?.tasks ?? 0}
                    </span>
                    <span className="text-right font-mono text-xs text-ink-2">
                      {p._count?.members ?? 0}
                    </span>
                    <span className="text-right font-mono text-xs uppercase text-ink-2">
                      {format(new Date(p.updatedAt), "MMM d")}
                    </span>
                    <ChevronRight className="h-4 w-4 text-ink-3 opacity-0 transition-opacity duration-100 group-hover:opacity-100" />
                  </span>

                  <span className="flex flex-col gap-0.5 md:hidden">
                    <span className="truncate text-[13px] font-medium text-ink">{p.name}</span>
                    <span className="font-mono text-[11px] uppercase tracking-wide text-ink-3">
                      {p._count?.tasks ?? 0} tasks · {p._count?.members ?? 0} members ·{" "}
                      {format(new Date(p.updatedAt), "MMM d")}
                    </span>
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </Ledger>
      ) : (
        <EmptyState
          title="Nothing on the books yet."
          description={
            isAdmin
              ? "Create your first project to start adding tasks."
              : "You haven’t been added to any projects yet."
          }
          action={isAdmin ? { label: "New project", onClick: () => setCreateOpen(true) } : undefined}
        />
      )}

      <Modal open={createOpen} onClose={() => setCreateOpen(false)} title="New project">
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4" noValidate>
          <div className="space-y-1.5">
            <Label htmlFor="name">Project name</Label>
            <Input id="name" placeholder="e.g. Q2 Launch" {...form.register("name")} />
            {form.formState.errors.name ? (
              <p className="font-mono text-xs text-oxide">
                ↳ {form.formState.errors.name.message}
              </p>
            ) : null}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="description">Description (optional)</Label>
            <Textarea
              id="description"
              placeholder="A short summary"
              rows={3}
              {...form.register("description")}
            />
            {form.formState.errors.description ? (
              <p className="font-mono text-xs text-oxide">
                ↳ {form.formState.errors.description.message}
              </p>
            ) : null}
          </div>

          <div className="flex justify-end gap-2 border-t border-rule pt-4">
            <Button type="button" variant="secondary" onClick={() => setCreateOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={createProject.isPending}>
              {createProject.isPending ? <Loader2 className="animate-spin" /> : null}
              {createProject.isPending ? "Creating…" : "Create project"}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
