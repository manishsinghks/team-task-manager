"use client";

import { useMemo } from "react";
import Link from "next/link";
import { format, isToday, isYesterday } from "date-fns";
import { cn } from "@/lib/utils";
import { Panel, PanelHeader, PanelBody } from "@/components/ui/panel";
import { Avatar } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { Loading } from "@/components/common/Loading";
import { EmptyState } from "@/components/common/EmptyState";
import { useAuth } from "@/lib/auth";
import { useDashboard } from "@/lib/queries";
import { STATUS_ORDER, statusMeta } from "@/lib/task-meta";
import type { ActivityItem, TaskStatus } from "@/lib/types";

function greeting() {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 18) return "Good afternoon";
  return "Good evening";
}

function dayLabel(date: Date) {
  if (isToday(date)) return "Today";
  if (isYesterday(date)) return "Yesterday";
  return format(date, "MMM d");
}

function groupByDay(items: ActivityItem[]) {
  const groups: { label: string; items: ActivityItem[] }[] = [];
  for (const item of items) {
    const label = dayLabel(new Date(item.createdAt));
    const last = groups[groups.length - 1];
    if (last && last.label === label) last.items.push(item);
    else groups.push({ label, items: [item] });
  }
  return groups;
}

export default function DashboardPage() {
  const { user } = useAuth();
  const dashboardQuery = useDashboard();

  const totals = dashboardQuery.data;

  const statusRows = useMemo(() => {
    const items = totals?.tasksByStatus ?? [];
    const byStatus = new Map(items.map((s) => [s.status, s.count]));
    return STATUS_ORDER.map((s) => ({ status: s, count: byStatus.get(s) ?? 0 }));
  }, [totals]);

  if (dashboardQuery.isLoading) {
    return <Loading lines={6} />;
  }

  if (dashboardQuery.isError || !dashboardQuery.data) {
    return (
      <EmptyState
        title="Couldn’t load the dashboard."
        description="Check your API connection and try again."
        action={{ label: "Retry", onClick: () => dashboardQuery.refetch() }}
      />
    );
  }

  const data = dashboardQuery.data;
  const totalTasks = data.totalTasks;
  const doneCount = data.tasksByStatus.find((t) => t.status === "DONE")?.count ?? 0;
  const inProgressCount = data.tasksByStatus.find((t) => t.status === "IN_PROGRESS")?.count ?? 0;
  const completion = totalTasks ? Math.round((doneCount / totalTasks) * 100) : 0;
  const maxUserCount = Math.max(1, ...(data.tasksPerUser ?? []).map((t) => t.count));
  const activityGroups = groupByDay(data.recentActivity ?? []);

  const strip = [
    { label: "Total tasks", value: totalTasks },
    { label: "In progress", value: inProgressCount },
    { label: `Done · ${completion}%`, value: doneCount },
    { label: "Overdue", value: data.overdueCount, danger: data.overdueCount > 0 },
  ];

  return (
    <div className="animate-rise space-y-8">
      <div className="flex items-baseline justify-between gap-4">
        <h1 className="font-serif text-[28px] font-medium leading-tight tracking-tight">
          {greeting()}, {user?.name?.split(" ")[0] ?? "there"}
        </h1>
        <span className="hidden font-mono text-xs uppercase tracking-wide text-ink-3 sm:block">
          {format(new Date(), "EEE, MMM d")}
        </span>
      </div>

      {/* Stat strip — four segments, one sentence */}
      <Panel className="grid grid-cols-2 md:grid-cols-4">
        {strip.map((s, i) => (
          <div
            key={s.label}
            className={cn(
              "px-4 py-3",
              i > 0 && "border-l border-rule",
              i >= 2 && "border-t border-rule md:border-t-0",
              i === 2 && "border-l-0 md:border-l",
            )}
          >
            <div className="text-[11px] font-semibold uppercase tracking-[0.08em] text-ink-2">
              {s.label}
            </div>
            <div
              className={cn(
                "mt-0.5 font-mono text-[22px] font-medium leading-tight tabular-nums",
                s.danger ? "text-oxide" : "text-ink",
              )}
            >
              {s.danger ? "▲ " : ""}
              {s.value}
            </div>
          </div>
        ))}
      </Panel>

      <div className="grid gap-6 lg:grid-cols-[1fr_1.2fr]">
        {/* Board health — status distribution + workload in one frame */}
        <Panel className="h-fit">
          <PanelHeader
            title="Board health"
            aside={
              <span className="font-mono text-xs text-ink-3">
                {totalTasks} {totalTasks === 1 ? "task" : "tasks"}
              </span>
            }
          />
          <PanelBody className="space-y-3">
            {statusRows.map((s) => {
              const meta = statusMeta[s.status as TaskStatus];
              const share = totalTasks ? Math.round((s.count / totalTasks) * 100) : 0;
              return (
                <div key={s.status} className="space-y-1">
                  <div className="flex items-center justify-between text-[13px]">
                    <span className="flex items-center gap-2 font-medium">
                      <span className={cn("font-mono", meta.text)} aria-hidden>
                        {meta.glyph}
                      </span>
                      {meta.label}
                    </span>
                    <span className="font-mono text-xs text-ink-2">
                      {s.count} · {share}%
                    </span>
                  </div>
                  <Progress value={share} barClassName={meta.bar} />
                </div>
              );
            })}
          </PanelBody>
          <PanelBody className="space-y-2.5 border-t border-rule">
            <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-ink-3">
              Workload
            </p>
            {(data.tasksPerUser ?? []).length ? (
              (data.tasksPerUser ?? []).map((t) => (
                <div key={t.userId ?? "unassigned"} className="flex items-center gap-2.5">
                  <Avatar name={t.userName} className="h-6 w-6 text-[9px]" />
                  <span className="min-w-0 flex-1 truncate text-[13px]">{t.userName}</span>
                  <Progress
                    value={(t.count / maxUserCount) * 100}
                    className="w-20 shrink-0"
                    barClassName="bg-ink-3"
                  />
                  <span className="w-6 text-right font-mono text-xs text-ink-2">{t.count}</span>
                </div>
              ))
            ) : (
              <p className="text-[13px] text-ink-3">No tasks assigned yet.</p>
            )}
          </PanelBody>
        </Panel>

        {/* Activity ledger — day groups, comparable mono times */}
        <Panel className="h-fit">
          <PanelHeader title="Recent activity" />
          {activityGroups.length ? (
            <div>
              {activityGroups.map((group) => (
                <div key={group.label}>
                  <div className="border-b border-rule bg-sunken px-4 py-1.5 text-[11px] font-semibold uppercase tracking-[0.08em] text-ink-3">
                    {group.label}
                  </div>
                  {group.items.map((a) => (
                    <div
                      key={a.id}
                      className="flex items-center gap-3 border-b border-rule px-4 py-2.5 last:border-b-0"
                    >
                      <span className="w-11 shrink-0 font-mono text-xs text-ink-3">
                        {format(new Date(a.createdAt), "HH:mm")}
                      </span>
                      <span className="min-w-0 flex-1 truncate text-[13px]">
                        <span className="font-medium">{a.user.name}</span>{" "}
                        <span className="text-ink-2">
                          {a.action.replaceAll("_", " ").toLowerCase()}
                        </span>
                      </span>
                      {a.project ? (
                        <Link
                          href={`/projects/${a.project.id}`}
                          className="hidden shrink-0 font-mono text-xs text-ink-2 hover:text-ink hover:underline sm:block"
                        >
                          {a.project.name}
                        </Link>
                      ) : null}
                    </div>
                  ))}
                </div>
              ))}
            </div>
          ) : (
            <EmptyState
              framed={false}
              title="No activity yet."
              description="When your team creates tasks, updates will appear here."
            />
          )}
        </Panel>
      </div>
    </div>
  );
}
