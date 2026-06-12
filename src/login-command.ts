import { createInterface } from "node:readline/promises";
import { stdin, stdout, stderr, exit } from "node:process";
import { NirvanaClient, NirvanaApiError } from "./nirvana/client.js";

const PACKAGE_NAME = "@sgoettschkes/nirvana-mcp";

const CTRL_C = "\x03";
const CTRL_D = "\x04";
const BACKSPACE = "\x7f";
const BS = "\b";
const LF = "\n";
const CR = "\r";

async function promptVisible(question: string): Promise<string> {
  const rl = createInterface({ input: stdin, output: stderr });
  try {
    return (await rl.question(question)).trim();
  } finally {
    rl.close();
  }
}

function promptHidden(question: string): Promise<string> {
  return new Promise((resolve) => {
    stderr.write(question);
    stdin.setRawMode(true);
    stdin.resume();
    stdin.setEncoding("utf8");
    let value = "";
    const finish = () => {
      stdin.setRawMode(false);
      stdin.pause();
      stdin.removeListener("data", onData);
      stderr.write("\n");
    };
    const onData = (input: string) => {
      for (const ch of input) {
        if (ch === LF || ch === CR || ch === CTRL_D) {
          finish();
          resolve(value);
          return;
        }
        if (ch === CTRL_C) {
          finish();
          exit(130);
        }
        if (ch === BACKSPACE || ch === BS) {
          if (value.length > 0) {
            value = value.slice(0, -1);
            stderr.write("\b \b");
          }
          continue;
        }
        if (ch.charCodeAt(0) < 0x20) {
          continue;
        }
        value += ch;
        stderr.write("*");
      }
    };
    stdin.on("data", onData);
  });
}

export async function runLogin(): Promise<void> {
  const appId = process.env.NIRVANA_APP_ID ?? "nirvana-mcp";

  let username = process.env.NIRVANA_USERNAME;
  let password = process.env.NIRVANA_PASSWORD;
  const interactive = stdin.isTTY === true;

  if (!username) {
    if (!interactive) {
      stderr.write(
        "Missing username. Either run in a terminal or set NIRVANA_USERNAME.\n",
      );
      exit(1);
    }
    username = await promptVisible("Nirvana username: ");
  }

  if (!password) {
    if (!interactive) {
      stderr.write(
        "Missing password. Either run in a terminal or set NIRVANA_PASSWORD.\n",
      );
      exit(1);
    }
    password = await promptHidden("Nirvana password: ");
  }

  if (!username || !password) {
    stderr.write("Username and password are required.\n");
    exit(1);
  }

  let token: string;
  try {
    token = await NirvanaClient.login(appId, username, password);
  } catch (err) {
    if (err instanceof NirvanaApiError) {
      stderr.write(`${err.message}\n`);
    } else {
      stderr.write(`Login failed: ${(err as Error).message}\n`);
    }
    exit(1);
  }

  stdout.write(`${token}\n`);

  stderr.write(
    [
      "",
      "Token acquired. To install nirvana-mcp into Claude Code, run:",
      "",
      `  claude mcp add nirvana \\`,
      `    --env NIRVANA_AUTH_TOKEN=${token} \\`,
      `    -- npx -y ${PACKAGE_NAME}`,
      "",
    ].join("\n"),
  );
}
