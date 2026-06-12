import { z } from "zod";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { NirvanaClient } from "../nirvana/client.js";
import {
  TaskState,
  TaskType,
  parseTagString,
  stateName,
  type NirvanaTask,
} from "../nirvana/types.js";

const STATE_ENUM = [
  "inbox",
  "next",
  "waiting",
  "scheduled",
  "someday",
  "later",
  "logged",
  "recurring",
  "active_project",
] as const;

const STATE_NAME_TO_NUMBER: Record<(typeof STATE_ENUM)[number], number> = {
  inbox: TaskState.Inbox,
  next: TaskState.Next,
  waiting: TaskState.Waiting,
  scheduled: TaskState.Scheduled,
  someday: TaskState.Someday,
  later: TaskState.Later,
  logged: TaskState.Logged,
  recurring: TaskState.Recurring,
  active_project: TaskState.ActiveProject,
};

function errorResult(message: string) {
  return {
    isError: true,
    content: [{ type: "text" as const, text: message }],
  };
}

export function registerSearchTasks(
  server: McpServer,
  client: NirvanaClient,
): void {
  server.registerTool(
    "search_tasks",
    {
      title: "Search Nirvana Tasks",
      description:
        "Search the user's Nirvana tasks with any combination of filters. At least one filter is required. Trashed and deleted tasks are always excluded. Completed (logged) tasks are excluded unless `state: \"logged\"` is passed — pair text search with state=\"logged\" to mine the user's history.",
      inputSchema: {
        text: z
          .string()
          .min(1)
          .optional()
          .describe(
            "Case-insensitive substring matched against the task name and note.",
          ),
        tag: z
          .string()
          .min(1)
          .optional()
          .describe(
            "Exact tag name to filter by (case-insensitive). Use list_tags to discover names.",
          ),
        area: z
          .string()
          .min(1)
          .optional()
          .describe(
            "Exact area name to filter by (case-insensitive). Use list_areas to discover names.",
          ),
        state: z
          .enum(STATE_ENUM)
          .optional()
          .describe("Restrict to tasks in this Nirvana state."),
      },
    },
    async ({ text, tag, area, state }) => {
      if (!text && !tag && !area && !state) {
        return errorResult(
          "Provide at least one filter (text, tag, area, or state).",
        );
      }

      const data = await client.everything();
      const allTasks = data.results
        .map((r) => r.task)
        .filter((t): t is NirvanaTask => t != null);

      const textLower = text?.toLowerCase();
      const tagLower = tag?.toLowerCase();
      const areaLower = area?.toLowerCase();
      const stateFilter =
        state !== undefined ? STATE_NAME_TO_NUMBER[state] : undefined;

      const matches = allTasks.filter((t) => {
        if (Number(t.type) !== TaskType.Task) return false;

        const taskState = Number(t.state);
        if (taskState === TaskState.Trashed) return false;
        if (taskState === TaskState.Deleted) return false;
        if (stateFilter !== undefined) {
          if (taskState !== stateFilter) return false;
        } else if (taskState === TaskState.Logged) {
          return false;
        }

        if (textLower !== undefined) {
          const name = (t.name ?? "").toLowerCase();
          const note = (t.note ?? "").toLowerCase();
          if (!name.includes(textLower) && !note.includes(textLower)) {
            return false;
          }
        }

        if (tagLower !== undefined || areaLower !== undefined) {
          const taskTags = parseTagString(t.tags ?? "").map((x) =>
            x.toLowerCase(),
          );
          if (tagLower !== undefined && !taskTags.includes(tagLower)) {
            return false;
          }
          if (areaLower !== undefined && !taskTags.includes(areaLower)) {
            return false;
          }
        }

        return true;
      });

      const items = matches.map((t) => ({
        id: t.id,
        name: t.name,
        note: t.note,
        tags: parseTagString(t.tags ?? ""),
        state: stateName(Number(t.state)),
        completed: Number(t.completed) > 0,
      }));

      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(items, null, 2),
          },
        ],
      };
    },
  );
}
