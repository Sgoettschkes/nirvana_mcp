import { z } from "zod";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { NirvanaClient } from "../nirvana/client.js";
import {
  TaskState,
  TaskType,
  parseTagString,
  type NirvanaTask,
} from "../nirvana/types.js";

function errorResult(message: string) {
  return {
    isError: true,
    content: [{ type: "text" as const, text: message }],
  };
}

export function registerGetReferenceList(
  server: McpServer,
  client: NirvanaClient,
): void {
  server.registerTool(
    "get_reference_list",
    {
      title: "Get Nirvana Reference List",
      description:
        "Returns a single Reference List and all of its items. Identify by exact `id` (UUID) or exact `name`. Provide exactly one. Use `list_reference_lists` first to discover names.",
      inputSchema: {
        id: z.string().optional(),
        name: z.string().optional(),
      },
    },
    async ({ id, name }) => {
      if (!id && !name) return errorResult("Provide either `id` or `name`.");
      if (id && name)
        return errorResult("Provide only one of `id` or `name`, not both.");

      const data = await client.everything();
      const allTasks = data.results
        .map((r) => r.task)
        .filter((t): t is NirvanaTask => t != null);

      const list = allTasks.find(
        (t) =>
          Number(t.type) === TaskType.ReferenceList &&
          Number(t.state) === TaskState.Reference &&
          ((id && t.id === id) || (name && t.name === name)),
      );

      if (!list) {
        return errorResult(
          id
            ? `No reference list found with id "${id}".`
            : `No reference list found with name "${name}".`,
        );
      }

      const items = allTasks
        .filter(
          (t) =>
            t.parentid === list.id &&
            Number(t.type) === TaskType.ReferenceItem,
        )
        .map((t) => ({
          id: t.id,
          name: t.name,
          note: t.note,
          tags: parseTagString(t.tags ?? ""),
        }));

      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(
              {
                reference_list: {
                  id: list.id,
                  name: list.name,
                  note: list.note,
                  tags: parseTagString(list.tags ?? ""),
                },
                items,
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
