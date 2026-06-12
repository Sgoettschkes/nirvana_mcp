import { NirvanaClient } from "../src/nirvana/client.js";

const appId = process.env.NIRVANA_APP_ID;
const username = process.env.NIRVANA_USERNAME;
const password = process.env.NIRVANA_PASSWORD;

if (!appId || !username || !password) {
  process.stderr.write(
    "Set NIRVANA_APP_ID, NIRVANA_USERNAME and NIRVANA_PASSWORD in .env, then run again.\n",
  );
  process.exit(1);
}

const token = await NirvanaClient.login(appId, username, password);

process.stdout.write(`\nNIRVANA_AUTH_TOKEN=${token}\n\n`);
process.stderr.write(
  "Add the line above to .env, remove NIRVANA_USERNAME and NIRVANA_PASSWORD, then run the server.\n",
);
