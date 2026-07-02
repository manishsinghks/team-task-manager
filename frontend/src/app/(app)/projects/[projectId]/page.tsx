"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import { useQueryClient, useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { format } from "date-fns";
import { Loader2, Pencil, Plus, Trash2, UserMinus, UserPlus, Users } from "lucide-react";
import { api } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import { useProject } from "@/lib/queries";
import { cn } from "@/lib/utils";
import {
  PRIORITY_ORDER,
  STATUS_ORDER,
  isTaskOverdue,
  priorityMeta,
  statusMeta,
} from "@/lib/task-meta";
import type { Role, Task, TaskPriority, TaskStatus } from "@/lib/types";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select } from "@/components/ui/select";
import { Avatar } from "@/components/ui/avatar";
import { Modal } from "@/components/ui/modal";
import { Stamp } from "@/components/ui/stamp";
import { EmptyState } from "@/components/common/EmptyState";
import { Loading } from "@/components/common/Loading";

const taskFormSchema = z.object({
  title: z.string().min(1).max(200),
  description: z.string().max(5000).optional(),
  dueDate: z.string().optional(), // YYYY-MM-DD
  priority: z.enum(["LOW", "MEDIUM", "HIGH"]),
  status: z.enum(["TODO", "IN_PROGRESS", "DONE"]),
  assigneeId: z.string().optional(), // empty => unassigned
});

type TaskForm = z.infer<typeof taskFormSchema>;

const emptyTaskForm: TaskForm = {
  title: "",
  description: "",
  dueDate: "",
  priority: "MEDIUM",
  status: "TODO",
  assigneeId: "",
};

function toTaskPayload(values: TaskForm) {
  return {
    title: values.title,
    description: values.description?.trim() ? values.description.trim() : undefined,
    dueDate: values.dueDate ? new Date(values.dueDate) : null,
    priority: values.priority,
    status: values.status,
    assigneeId: values.assigneeId ? values.assigneeId : null,
  };
}

export default function ProjectDashboardPage() {
  const { user } = useAuth();
  const params = useParams<{ projectId?: string | string[] }>();
  const rawProjectId = params.projectId;
  const projectId = Array.isArray(rawProjectId) ? rawProjectId[0] : rawProjectId;

  const projectQuery = useProject(projectId);
  const queryClient = useQueryClient();

  const isAdmin = user?.role === "ADMIN";

  const [statusFilter, setStatusFilter] = useState<TaskStatus | "ALL">("ALL");
  const [priorityFilter, setPriorityFilter] = useState<TaskPriority | "ALL">("ALL");
  const [mobileColumn, setMobileColumn] = useState<TaskStatus>("TODO");

  const [taskModalOpen, setTaskModalOpen] = useState(false);
  const [editingTaskId, setEditingTaskId] = useState<string | null>(null);
  const [taskToDelete, setTaskToDelete] = useState<Task | null>(null);
  const [membersOpen, setMembersOpen] = useState(false);

  const tasks = useMemo(() => projectQuery.data?.tasks ?? [], [projectQuery.data]);
  const members = projectQuery.data?.members ?? [];
  const ownerId = projectQuery.data?.ownerId;

  const filteredTasks = useMemo(() => {
    return tasks
      .filter((t) => (statusFilter === "ALL" ? true : t.status === statusFilter))
      .filter((t) => (priorityFilter === "ALL" ? true : t.priority === priorityFilter));
  }, [tasks, statusFilter, priorityFilter]);

  const tasksByStatus = useMemo(() => {
    const map: Record<TaskStatus, Task[]> = { TODO: [], IN_PROGRESS: [], DONE: [] };
    for (const t of filteredTasks) map[t.status].push(t);
    return map;
  }, [filteredTasks]);

  const stats = useMemo(() => {
    const done = tasks.filter((t) => t.status === "DONE").length;
    return {
      total: tasks.length,
      inProgress: tasks.filter((t) => t.status === "IN_PROGRESS").length,
      done,
      overdue: tasks.filter((t) => isTaskOverdue(t)).length,
      completion: tasks.length ? Math.round((done / tasks.length) * 100) : 0,
    };
  }, [tasks]);

  const form = useForm<TaskForm>({
    resolver: zodResolver(taskFormSchema),
    defaultValues: emptyTaskForm,
  });

  const taskToEdit = useMemo(() => {
    if (!editingTaskId) return null;
    return tasks.find((t) => t.id === editingTaskId) ?? null;
  }, [editingTaskId, tasks]);

  useEffect(() => {
    if (!taskToEdit) return;
    form.reset({
      title: taskToEdit.title,
      description: taskToEdit.description ?? "",
      dueDate: taskToEdit.dueDate ? taskToEdit.dueDate.slice(0, 10) : "",
      priority: taskToEdit.priority,
      status: taskToEdit.status,
      assigneeId: taskToEdit.assigneeId ?? "",
    });
  }, [taskToEdit, form]);

  const closeTaskModal = () => {
    setTaskModalOpen(false);
    setEditingTaskId(null);
    form.reset(emptyTaskForm);
  };

  const updateStatusMutation = useMutation({
    mutationFn: async (payload: { taskId: string; status: TaskStatus }) => {
      return api
        .patch(`/projects/${projectId}/tasks/${payload.taskId}/status`, {
          status: payload.status,
        })
        .then((r) => r.data.data as Task);
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["project", projectId] }),
    onError: (err) =>
      toast.error(err instanceof Error ? err.message : "Failed to update status"),
  });

  const saveTaskMutation = useMutation({
    mutationFn: async (payload: { mode: "create" | "edit"; values: TaskForm }) => {
      if (!projectId) throw new Error("Missing project id");
      const body = toTaskPayload(payload.values);
      if (payload.mode === "create") {
        return api.post(`/projects/${projectId}/tasks`, body).then((r) => r.data.data as Task);
      }
      if (!editingTaskId) throw new Error("Missing task id");
      return api
        .patch(`/projects/${projectId}/tasks/${editingTaskId}`, body)
        .then((r) => r.data.data as Task);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["project", projectId] });
      toast.success(editingTaskId ? "Task updated" : "Task created");
      closeTaskModal();
    },
    onError: (err) => toast.error(err instanceof Error ? err.message : "Failed to save task"),
  });

  const deleteTaskMutation = useMutation({
    mutationFn: async (taskId: string) => {
      if (!projectId) return;
      await api.delete(`/projects/${projectId}/tasks/${taskId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["project", projectId] });
      toast.success("Task deleted");
      setTaskToDelete(null);
    },
    onError: (err) => toast.error(err instanceof Error ? err.message : "Failed to delete task"),
  });

  function canUpdateStatus(task: Task) {
    if (!user) return false;
    return isAdmin || task.assigneeId === user.id;
  }

  const [memberEmail, setMemberEmail] = useState("");
  const [memberRole, setMemberRole] = useState<Role>("MEMBER");

  const addMemberMutation = useMutation({
    mutationFn: async () => {
      if (!projectId) return;
      return api.post(`/projects/${projectId}/members`, {
        email: memberEmail,
        role: memberRole,
      });
    },
    onSuccess: () => {
      setMemberEmail("");
      queryClient.invalidateQueries({ queryKey: ["project", projectId] });
      toast.success("Member added");
    },
    onError: (err) => toast.error(err instanceof Error ? err.message : "Failed to add member"),
  });

  const removeMemberMutation = useMutation({
    mutationFn: async (userId: string) => {
      if (!projectId) return;
      return api.delete(`/projects/${projectId}/members/${userId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["project", projectId] });
      toast.success("Member removed");
    },
    onError: (err) => toast.error(err instanceof Error ? err.message : "Failed to remove member"),
  });

  if (projectQuery.isLoading) {
    return <Loading lines={7} />;
  }

  if (projectQuery.isError || !projectQuery.data || !projectId) {
    return (
      <EmptyState
        title="Couldn’t load the project."
        description="Check your API connection and try again."
        action={{ label: "Retry", onClick: () => projectQuery.refetch() }}
      />
    );
  }

  return (
    <div className="animate-rise space-y-6">
      {/* Header — the board is the stage; everything else is one compact block */}
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div className="min-w-0">
          <h1 className="truncate font-serif text-[28px] font-medium leading-tight tracking-tight">
            {projectQuery.data.name}
          </h1>
          {projectQuery.data.description ? (
            <p className="mt-1 max-w-2xl text-[13px] text-ink-2">
              {projectQuery.data.description}
            </p>
          ) : null}
          <p className="mt-2 font-mono text-xs uppercase tracking-wide text-ink-2">
            {stats.total} tasks · {stats.inProgress} active · {stats.completion}% done
            {stats.overdue > 0 ? (
              <span className="text-oxide"> · ▲ {stats.overdue} overdue</span>
            ) : null}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Select
            containerClassName="w-36"
            className="h-7 text-xs"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as TaskStatus | "ALL")}
            aria-label="Filter by status"
          >
            <option value="ALL">All statuses</option>
            {STATUS_ORDER.map((s) => (
              <option key={s} value={s}>
                {statusMeta[s].label}
              </option>
            ))}
          </Select>

          <Select
            containerClassName="w-36"
            className="h-7 text-xs"
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value as TaskPriority | "ALL")}
            aria-label="Filter by priority"
          >
            <option value="ALL">All priorities</option>
            {PRIORITY_ORDER.map((p) => (
              <option key={p} value={p}>
                {priorityMeta[p].label}
              </option>
            ))}
          </Select>

          <Button variant="ghost" size="sm" onClick={() => setMembersOpen(true)}>
            <Users />
            Members ({members.length})
          </Button>

          {isAdmin ? (
            <Button
              size="sm"
              onClick={() => {
                setEditingTaskId(null);
                form.reset(emptyTaskForm);
                setTaskModalOpen(true);
              }}
            >
              <Plus />
              New task
            </Button>
          ) : null}
        </div>
      </div>

      {/* Mobile: segmented status control instead of stacked columns */}
      <div className="grid grid-cols-3 border border-rule bg-raised md:hidden" role="tablist">
        {STATUS_ORDER.map((s) => {
          const active = mobileColumn === s;
          return (
            <button
              key={s}
              role="tab"
              aria-selected={active}
              onClick={() => setMobileColumn(s)}
              className={cn(
                "flex h-9 items-center justify-center gap-1.5 border-r border-rule font-mono text-[11px] uppercase tracking-wide last:border-r-0",
                active ? "bg-accent-wash text-ink" : "text-ink-2",
              )}
            >
              <span className={statusMeta[s].text} aria-hidden>
                {statusMeta[s].glyph}
              </span>
              {statusMeta[s].label}
              <span className="text-ink-3">{tasksByStatus[s].length}</span>
            </button>
          );
        })}
      </div>

      {/* Full-width board */}
      <div className="grid gap-4 md:grid-cols-3">
        {STATUS_ORDER.map((s) => {
          if (statusFilter !== "ALL" && statusFilter !== s) return null;
          const meta = statusMeta[s];
          const colTasks = tasksByStatus[s];
          return (
            <section
              key={s}
              aria-label={`${meta.label}, ${colTasks.length} tasks`}
              className={cn(
                "flex-col border border-rule bg-raised",
                mobileColumn === s ? "flex" : "hidden md:flex",
              )}
            >
              <header className="flex h-9 items-center gap-2 border-b border-rule-2 bg-sunken px-3">
                <span className={cn("font-mono text-xs", meta.text)} aria-hidden>
                  {meta.glyph}
                </span>
                <span className="text-[11px] font-semibold uppercase tracking-[0.08em] text-ink-2">
                  {meta.label}
                </span>
                <span className="ml-auto font-mono text-xs text-ink-3">{colTasks.length}</span>
              </header>

              <div className="flex-1">
                {colTasks.length ? (
                  <ul>
                    {colTasks.map((t) => {
                      const overdue = isTaskOverdue(t);
                      const canUpdate = canUpdateStatus(t);
                      const pMeta = priorityMeta[t.priority];
                      return (
                        <li
                          key={t.id}
                          className="group border-b border-rule px-3 py-2.5 transition-colors duration-100 last:border-b-0 hover:bg-sunken"
                        >
                          <div className="flex items-start justify-between gap-2">
                            <p className="min-w-0 text-[13px] font-medium leading-snug">
                              {t.title}
                            </p>
                            {isAdmin ? (
                              <span className="flex shrink-0 gap-0.5 opacity-0 transition-opacity duration-100 focus-within:opacity-100 group-hover:opacity-100">
                                <Button
                                  size="iconSm"
                                  variant="ghost"
                                  onClick={() => {
                                    setEditingTaskId(t.id);
                                    setTaskModalOpen(true);
                                  }}
                                  aria-label={`Edit ${t.title}`}
                                >
                                  <Pencil />
                                </Button>
                                <Button
                                  size="iconSm"
                                  variant="ghost"
                                  className="hover:bg-oxide-wash hover:text-oxide"
                                  onClick={() => setTaskToDelete(t)}
                                  aria-label={`Delete ${t.title}`}
                                >
                                  <Trash2 />
                                </Button>
                              </span>
                            ) : null}
                          </div>

                          {t.description ? (
                            <p className="mt-0.5 line-clamp-2 text-xs text-ink-3">
                              {t.description}
                            </p>
                          ) : null}

                          <div className="mt-2 flex items-center justify-between gap-2">
                            <span className="flex min-w-0 items-center gap-2.5 font-mono text-[11px] uppercase tracking-wide text-ink-2">
                              <span className={pMeta.text} title={`${pMeta.label} priority`}>
                                ⚑ {pMeta.letter}
                              </span>
                              <span className={cn(overdue && "font-medium text-oxide")}>
                                {overdue ? "▲ " : ""}
                                {t.dueDate
                                  ? format(new Date(t.dueDate), "MMM d").toUpperCase()
                                  : "—"}
                              </span>
                              {t.assignee ? (
                                <span className="flex min-w-0 items-center gap-1 normal-case">
                                  <Avatar name={t.assignee.name} className="h-4 w-4 text-[7px]" />
                                  <span className="truncate">
                                    {t.assignee.name.split(" ")[0]}
                                  </span>
                                </span>
                              ) : null}
                            </span>

                            {canUpdate ? (
                              <Select
                                containerClassName="w-[104px] shrink-0"
                                className="h-7 pl-2 pr-6 text-[11px]"
                                value={t.status}
                                onChange={(e) => {
                                  updateStatusMutation.mutate({
                                    taskId: t.id,
                                    status: e.target.value as TaskStatus,
                                  });
                                }}
                                disabled={updateStatusMutation.isPending}
                                aria-label={`Status of ${t.title}`}
                              >
                                {STATUS_ORDER.map((st) => (
                                  <option key={st} value={st}>
                                    {statusMeta[st].label}
                                  </option>
                                ))}
                              </Select>
                            ) : null}
                          </div>
                        </li>
                      );
                    })}
                  </ul>
                ) : (
                  <p className="py-10 text-center font-mono text-[11px] uppercase tracking-wide text-ink-3">
                    No tasks
                  </p>
                )}
              </div>
            </section>
          );
        })}
      </div>

      {/* Create / edit task */}
      <Modal
        open={taskModalOpen}
        onClose={closeTaskModal}
        title={editingTaskId ? "Edit task" : "New task"}
      >
        <form
          className="space-y-4"
          noValidate
          onSubmit={form.handleSubmit((values) => {
            saveTaskMutation.mutate({ mode: editingTaskId ? "edit" : "create", values });
          })}
        >
          <div className="space-y-1.5">
            <Label htmlFor="title">Title</Label>
            <Input id="title" placeholder="What needs doing?" {...form.register("title")} />
            {form.formState.errors.title ? (
              <p className="font-mono text-xs text-oxide">
                ↳ {form.formState.errors.title.message}
              </p>
            ) : null}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              placeholder="Add context (optional)"
              rows={3}
              {...form.register("description")}
            />
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="dueDate">Due date</Label>
              <Input id="dueDate" type="date" {...form.register("dueDate")} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="assigneeId">Assigned to</Label>
              <Select id="assigneeId" {...form.register("assigneeId")}>
                <option value="">Unassigned</option>
                {members.map((m) => (
                  <option key={m.user.id} value={m.user.id}>
                    {m.user.name}
                  </option>
                ))}
              </Select>
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="priority">Priority</Label>
              <Select id="priority" {...form.register("priority")}>
                {PRIORITY_ORDER.map((p) => (
                  <option key={p} value={p}>
                    {priorityMeta[p].label}
                  </option>
                ))}
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="status">Status</Label>
              <Select id="status" {...form.register("status")}>
                {STATUS_ORDER.map((st) => (
                  <option key={st} value={st}>
                    {statusMeta[st].label}
                  </option>
                ))}
              </Select>
            </div>
          </div>

          <div className="flex justify-end gap-2 border-t border-rule pt-4">
            <Button type="button" variant="secondary" onClick={closeTaskModal}>
              Cancel
            </Button>
            <Button type="submit" disabled={saveTaskMutation.isPending}>
              {saveTaskMutation.isPending ? <Loader2 className="animate-spin" /> : null}
              {editingTaskId ? "Save changes" : "Create task"}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Confirm delete — never one-click destroy */}
      <Modal
        open={taskToDelete !== null}
        onClose={() => setTaskToDelete(null)}
        title="Delete task"
      >
        <p className="text-[13px] text-ink-2">
          This permanently removes{" "}
          <span className="font-mono text-xs text-ink">“{taskToDelete?.title}”</span> and can’t
          be undone.
        </p>
        <div className="mt-5 flex justify-end gap-2 border-t border-rule pt-4">
          <Button type="button" variant="secondary" onClick={() => setTaskToDelete(null)}>
            Cancel
          </Button>
          <Button
            type="button"
            variant="destructive"
            disabled={deleteTaskMutation.isPending}
            onClick={() => taskToDelete && deleteTaskMutation.mutate(taskToDelete.id)}
          >
            {deleteTaskMutation.isPending ? <Loader2 className="animate-spin" /> : null}
            Delete task
          </Button>
        </div>
      </Modal>

      {/* Members */}
      <Modal open={membersOpen} onClose={() => setMembersOpen(false)} title="Project members">
        <ul className="max-h-72 overflow-y-auto border border-rule">
          {members.map((m) => (
            <li
              key={m.id}
              className="flex items-center gap-3 border-b border-rule px-3 py-2 last:border-b-0"
            >
              <Avatar name={m.user.name} />
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <span className="truncate text-[13px] font-medium">{m.user.name}</span>
                  {m.user.id === ownerId ? <Stamp tone="accent">Owner</Stamp> : null}
                </div>
                <div className="truncate font-mono text-[11px] text-ink-3">{m.user.email}</div>
              </div>
              <span className="font-mono text-[11px] uppercase tracking-wide text-ink-2">
                {m.role}
              </span>
              {isAdmin && m.user.id !== user?.id ? (
                <Button
                  size="iconSm"
                  variant="ghost"
                  className="shrink-0 hover:bg-oxide-wash hover:text-oxide"
                  disabled={m.user.id === ownerId || removeMemberMutation.isPending}
                  onClick={() => removeMemberMutation.mutate(m.user.id)}
                  aria-label={`Remove ${m.user.name}`}
                  title={
                    m.user.id === ownerId ? "The owner can’t be removed" : `Remove ${m.user.name}`
                  }
                >
                  <UserMinus />
                </Button>
              ) : null}
            </li>
          ))}
        </ul>

        {isAdmin ? (
          <div className="mt-4 space-y-3 border-t border-rule pt-4">
            <div className="space-y-1.5">
              <Label htmlFor="memberEmail">Add member by email</Label>
              <div className="flex gap-2">
                <Input
                  id="memberEmail"
                  type="email"
                  placeholder="member@company.com"
                  value={memberEmail}
                  onChange={(e) => setMemberEmail(e.target.value)}
                />
                <Select
                  containerClassName="w-28 shrink-0"
                  value={memberRole}
                  onChange={(e) => setMemberRole(e.target.value as Role)}
                  aria-label="Member role"
                >
                  <option value="MEMBER">Member</option>
                  <option value="ADMIN">Admin</option>
                </Select>
              </div>
            </div>

            <Button
              className="w-full"
              variant="secondary"
              disabled={!memberEmail.trim() || addMemberMutation.isPending}
              onClick={() => addMemberMutation.mutate()}
            >
              {addMemberMutation.isPending ? <Loader2 className="animate-spin" /> : <UserPlus />}
              {addMemberMutation.isPending ? "Adding…" : "Add member"}
            </Button>
          </div>
        ) : null}
      </Modal>
    </div>
  );
}
