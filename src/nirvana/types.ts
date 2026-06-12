export const TaskState = {
  Inbox: 0,
  Next: 1,
  Waiting: 2,
  Scheduled: 3,
  Someday: 4,
  Later: 5,
  Trashed: 6,
  Logged: 7,
  Deleted: 8,
  Recurring: 9,
  Reference: 10,
  ActiveProject: 11,
} as const;

export const TaskType = {
  Task: 0,
  Project: 1,
  ReferenceItem: 2,
  ReferenceList: 3,
} as const;

export const TagType = {
  Tag: 0,
  Area: 1,
  Contact: 2,
  Context: 3,
} as const;

export interface NirvanaTask {
  id: string;
  type: number;
  state: number;
  parentid: string;
  name: string;
  note: string;
  tags: string;
  waitingfor: string;
  completed: number;
  cancelled: number;
  seq: number;
  seqp: number;
  seqt: number;
  ps: number;
  etime: number;
  energy: number;
  startdate: string;
  duedate: string;
  recurring: unknown;
  [key: string]: unknown;
}

export interface NirvanaTag {
  key: string;
  type: number;
  [key: string]: unknown;
}

export interface NirvanaUser {
  id: string;
  [key: string]: unknown;
}

export interface EverythingResult {
  task?: NirvanaTask;
  tag?: NirvanaTag;
  user?: NirvanaUser;
  error?: { code: number; message: string };
}

export interface EverythingResponse {
  results: EverythingResult[];
}

export interface LoginResponse {
  results: Array<{
    auth?: { token: string };
    error?: { code: number; message: string };
  }>;
}

export function parseTagString(tags: string): string[] {
  return tags.split(",").filter((t) => t.length > 0);
}

const TYPE_NAMES: Record<number, string> = {
  [TaskType.Task]: "task",
  [TaskType.Project]: "project",
  [TaskType.ReferenceItem]: "reference_item",
  [TaskType.ReferenceList]: "reference_list",
};

export function typeName(n: number): string {
  return TYPE_NAMES[n] ?? `unknown(${n})`;
}

const STATE_NAMES: Record<number, string> = {
  [TaskState.Inbox]: "inbox",
  [TaskState.Next]: "next",
  [TaskState.Waiting]: "waiting",
  [TaskState.Scheduled]: "scheduled",
  [TaskState.Someday]: "someday",
  [TaskState.Later]: "later",
  [TaskState.Trashed]: "trashed",
  [TaskState.Logged]: "logged",
  [TaskState.Deleted]: "deleted",
  [TaskState.Recurring]: "recurring",
  [TaskState.Reference]: "reference",
  [TaskState.ActiveProject]: "active_project",
};

export function stateName(n: number): string {
  return STATE_NAMES[n] ?? `unknown(${n})`;
}
