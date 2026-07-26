/**
 * HTTP client wrapping CycleTLS to spoof Chrome JA3 fingerprint.
 * Adapted from doordash-mcp for multi-account Discord bot use.
 */

import initCycleTLS from "cycletls";
import type { CookieJar } from "./cookies.js";
import type { TrafficLogger } from "../logging/traffic.js";

const CHROME_JA3 =
  "771,4865-4866-4867-49195-49199-49196-49200-52393-52392-49171-49172-156-157-47-53,0-23-65281-10-11-35-16-5-13-18-51-45-43-27-17513-21,29-23-24,0";

const USER_AGENT =
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36";

export interface HttpResponse {
  status: number;
  body: unknown;
  headers: Record<string, string | string[]>;
  json(): unknown;
  text(): string;
}

export interface RequestOptions {
  method?: string;
  headers?: Record<string, string>;
  body?: unknown;
  disableRedirect?: boolean;
  cookieJar?: CookieJar;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type CycleTLSInstance = any;

export class HttpClient {
  private tls: CycleTLSInstance = null;
  private jar: CookieJar;
  private logger?: TrafficLogger;

  constructor(jar: CookieJar, logger?: TrafficLogger) {
    this.jar = jar;
    this.logger = logger;
  }

  async init(): Promise<void> {
    if (!this.tls) {
      this.tls = await initCycleTLS();
    }
  }

  async close(): Promise<void> {
    if (this.tls) {
      await this.tls.exit().catch(() => {});
      this.tls = null;
    }
  }

  async get(url: string, opts: RequestOptions = {}): Promise<HttpResponse> {
    return this.request(url, { ...opts, method: "GET" });
  }

  async post(
    url: string,
    body: unknown,
    opts: RequestOptions = {},
  ): Promise<HttpResponse> {
    return this.request(url, { ...opts, method: "POST", body });
  }

  private async request(
    url: string,
    opts: RequestOptions,
  ): Promise<HttpResponse> {
    if (!this.tls) await this.init();

    const jar = opts.cookieJar ?? this.jar;
    const cookieHeader = jar.getForUrl(url);

    const headers: Record<string, string> = {
      "User-Agent": USER_AGENT,
      Accept:
        "application/json, text/html, */*;q=0.8",
      "Accept-Language": "en-US,en;q=0.9",
      "Accept-Encoding": "gzip, deflate, br",
      ...(opts.headers ?? {}),
    };

    if (cookieHeader) {
      headers["Cookie"] = cookieHeader;
    }

    const method = (opts.method ?? "GET").toLowerCase();
    const requestOpts: Record<string, unknown> = {
      ja3: CHROME_JA3,
      userAgent: USER_AGENT,
      headers,
      disableRedirect: opts.disableRedirect ?? false,
    };

    let bodyStr: string | undefined;
    if (opts.body !== undefined) {
      if (typeof opts.body === "string") {
        bodyStr = opts.body;
        if (!headers["Content-Type"]) {
          headers["Content-Type"] = "application/x-www-form-urlencoded";
        }
      } else {
        bodyStr = JSON.stringify(opts.body);
        if (!headers["Content-Type"]) {
          headers["Content-Type"] = "application/json";
        }
      }
    }
    if (bodyStr) requestOpts.body = bodyStr;

    const start = Date.now();
    const resp = await (this.tls as any)(url, requestOpts, method);
    const duration = Date.now() - start;

    jar.storeCookies(url, resp.headers ?? {});

    let body: unknown = resp.body ?? resp.data ?? "";
    if (Buffer.isBuffer(body)) body = (body as Buffer).toString("utf-8");

    if (this.logger) {
      this.logger.log({
        timestamp: new Date().toISOString(),
        duration_ms: duration,
        request: { method: method.toUpperCase(), url, headers, body: bodyStr },
        response: {
          status: resp.status,
          headers: resp.headers,
          body:
            typeof body === "string" ? body.slice(0, 2000) : body,
        },
      });
    }

    const response: HttpResponse = {
      status: resp.status,
      body,
      headers: resp.headers ?? {},
      json() {
        if (typeof body === "object") return body;
        try {
          return JSON.parse(body as string);
        } catch {
          return null;
        }
      },
      text() {
        return typeof body === "string" ? body : JSON.stringify(body);
      },
    };

    return response;
  }
}
