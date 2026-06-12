import { createHash, randomUUID } from "node:crypto";
import type {
  EverythingResponse,
  LoginResponse,
} from "./types.js";

const BASE_URL = "https://api.nirvanahq.com/";
const APP_VERSION = "1";

export interface NirvanaClientOptions {
  appId: string;
  authToken: string;
}

export class NirvanaApiError extends Error {
  constructor(
    public readonly code: number,
    message: string,
  ) {
    super(`Nirvana API error ${code}: ${message}`);
    this.name = "NirvanaApiError";
  }
}

function commonParams(appId: string, authToken: string): URLSearchParams {
  return new URLSearchParams({
    api: "rest",
    requestid: randomUUID(),
    clienttime: Math.floor(Date.now() / 1000).toString(),
    appid: appId,
    appversion: APP_VERSION,
    authtoken: authToken,
  });
}

export class NirvanaClient {
  constructor(private readonly options: NirvanaClientOptions) {}

  static async login(
    appId: string,
    username: string,
    password: string,
  ): Promise<string> {
    const params = new URLSearchParams({
      api: "rest",
      requestid: randomUUID(),
      clienttime: Math.floor(Date.now() / 1000).toString(),
      appid: appId,
      appversion: APP_VERSION,
    });
    const passwordHash = createHash("md5").update(password).digest("hex");
    const body = new URLSearchParams({
      method: "auth.new",
      u: username,
      p: passwordHash,
      gmtoffset: (-new Date().getTimezoneOffset() / 60).toString(),
    });
    const res = await fetch(`${BASE_URL}?${params.toString()}`, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: body.toString(),
    });
    if (!res.ok) {
      throw new Error(`Login failed: HTTP ${res.status} ${res.statusText}`);
    }
    const data = (await res.json()) as LoginResponse;
    const first = data.results?.[0];
    if (first?.error) {
      throw new NirvanaApiError(first.error.code, first.error.message);
    }
    const token = first?.auth?.token;
    if (!token) {
      throw new Error(
        `Login returned no token: ${JSON.stringify(data).slice(0, 200)}`,
      );
    }
    return token;
  }

  async everything(since = 0): Promise<EverythingResponse> {
    const params = commonParams(this.options.appId, this.options.authToken);
    params.set("method", "everything");
    params.set("since", since.toString());

    const res = await fetch(`${BASE_URL}?${params.toString()}`, {
      method: "GET",
    });
    if (!res.ok) {
      throw new Error(
        `everything failed: HTTP ${res.status} ${res.statusText}`,
      );
    }
    const data = (await res.json()) as EverythingResponse;
    const firstErr = data.results?.find((r) => r.error)?.error;
    if (firstErr) {
      throw new NirvanaApiError(firstErr.code, firstErr.message);
    }
    return data;
  }
}
