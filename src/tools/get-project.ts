import { z } from "zod";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { NirvanaClient } from "../nirvana/client.js";
import {
  TaskState,
  TaskType,
  parseTagString,
  type NirvanaTask,
} from "../nirvana/types.js";

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
  [TaskState.ActiveProject]: "active_project",
};

const stateName = (s: number): string => STATE_NAMES[s] ?? `unknown(${s})`;

function errorResult(message: string) {
  return {
    isError: true,
    content: [{ type: "text" as const, text: message }],
  };
}

export function registerGetProject(
  server: McpServer,
  client: NirvanaClient,
): void {
  server.registerTool(
    "get_project",
    {
      title: "Get Nirvana Project",
      description:
        "Returns a single project and all of its direct child items (tasks and sub-projects). Identify the project by its exact `id` (UUID) or its exact `name`. Provide exactly one. Use `list_projects` first to discover names.",
      inputSchema: {
        id: z.string().optional(),
        name: z.string().optional(),
      },
    },
    async ({ id, name }) => {
      if (!id && !name) {
        return errorResult("Provide either `id` or `name`.");
      }
      if (id && name) {
        return errorResult("Provide only one of `id` or `name`, not both.");
      }

      const data = await client.everything();
      const allTasks = data.results
        .map((r) => r.task)
        .filter((t): t is NirvanaTask => t != null);

      const project = allTasks.find(
        (t) =>
          Number(t.type) === TaskType.Project &&
          ((id && t.id === id) || (name && t.name === name)),
      );

      if (!project) {
        return errorResult(
          id
            ? `No project found with id "${id}".`
            : `No project found with name "${name}".`,
        );
      }

      const children = allTasks
        .filter((t) => t.parentid === project.id)
        .map((t) => ({
          id: t.id,
          name: t.name,
          note: t.note,
          tags: parseTagString(t.tags ?? ""),
          type: Number(t.type) === TaskType.Project ? "project" : "task",
          state: stateName(Number(t.state)),
          completed: Number(t.completed) > 0,
        }));

      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(
              {
                project: {
                  id: project.id,
                  name: project.name,
                  note: project.note,
                  tags: parseTagString(project.tags ?? ""),
                  mode: Number(project.ps) === 1 ? "sequential" : "parallel",
                },
                children,
              },
              null,
              2,
            ),
          },
        ],
      };
    },
  );
}
