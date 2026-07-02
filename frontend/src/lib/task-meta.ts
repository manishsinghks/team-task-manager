import type { Task, TaskPriority, TaskStatus } from "./types";

export const STATUS_ORDER: TaskStatus[] = ["TODO", "IN_PROGRESS", "DONE"];
export const PRIORITY_ORDER: TaskPriority[] = ["LOW", "MEDIUM", "HIGH"];

export interface StatusMeta {
  label: string;
  /** Print glyph — status is always glyph + label + hue, never hue alone */
  glyph: string;
  /** Text-safe hue */
  text: string;
  /** Fill for thin bars */
  bar: string;
  /** Wash background for stamps */
  tone: "neutral" | "active" | "done" | "danger";
}

export const statusMeta: Record<TaskStatus, StatusMeta> = {
  TODO: {
    label: "To Do",
    glyph: "○",
    text: "text-graphite",
    bar: "bg-graphite",
    tone: "neutral",
  },
  IN_PROGRESS: {
    label: "In Progress",
    glyph: "●",
    text: "text-ochre",
    bar: "bg-ochre",
    tone: "active",
  },
  DONE: {
    label: "Done",
    glyph: "■",
    text: "text-moss",
    bar: "bg-moss",
    tone: "done",
  },
};

export interface PriorityMeta {
  label: string;
  /** Single mono letter shown next to the flag glyph */
  letter: string;
  text: string;
}

export const priorityMeta: Record<TaskPriority, PriorityMeta> = {
  LOW: { label: "Low", letter: "L", text: "text-graphite" },
  MEDIUM: { label: "Medium", letter: "M", text: "text-ochre" },
  HIGH: { label: "High", letter: "H", text: "text-oxide" },
};

export function isTaskOverdue(task: Pick<Task, "dueDate" | "status">) {
  if (!task.dueDate) return false;
  if (task.status === "DONE") return false;
  return new Date(task.dueDate).getTime() < Date.now();
}

export function initials(name: string) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}
