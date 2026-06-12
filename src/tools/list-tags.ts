import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { NirvanaClient } from "../nirvana/client.js";
import { TagType, type NirvanaTag } from "../nirvana/types.js";

const TYPE_NAMES: Record<number, string> = {
  [TagType.Tag]: "tag",
  [TagType.Contact]: "contact",
  [TagType.Context]: "context",
};

interface TagItem {
  name: string;
  kind: string;
  email?: string;
  color?: string;
}

function toItem(tag: NirvanaTag): TagItem | null {
  const kind = TYPE_NAMES[Number(tag.type)];
  if (!kind) return null;
  const item: TagItem = { name: tag.key, kind };
  if (typeof tag.email === "string" && tag.email.length > 0) {
    item.email = tag.email;
  }
  if (typeof tag.color === "string" && tag.color.length > 0) {
    item.color = tag.color;
  }
  return item;
}

export function registerListTags(
  server: McpServer,
  client: NirvanaClient,
): void {
  server.registerTool(
    "list_tags",
    {
      title: "List Nirvana Tags",
      description:
        "Returns the user's labels in Nirvana — plain tags and contacts (people the user waits on), with a `kind` field distinguishing them. In current Nirvana, GTD-style contexts (e.g. @phone, @home) are also stored as plain tags. For high-level life domains, use `list_areas` instead.",
      inputSchema: {},
    },
    async () => {
      const data = await client.everything();
      const items = data.results
        .map((r) => r.tag)
        .filter((t): t is NirvanaTag => t != null)
        .filter(
          (t) =>
            Number(t.type) !== TagType.Area && Number(t.deleted ?? 0) === 0,
        )
        .map(toItem)
        .filter((x): x is TagItem => x != null);

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
