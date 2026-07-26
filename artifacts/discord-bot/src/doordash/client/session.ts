/**
 * In-memory session (adapted from doordash-mcp).
 * Cookies are stored in DB via DoorDashManager instead of on disk.
 */

import { CookieJar } from "./cookies.js";

export interface SessionContext {
  readonly cookieJar: CookieJar;
  isAuthenticated(): boolean;
  getCsrfToken(): string;
}

interface SessionData {
  cookies: ReturnType<CookieJar["toJSON"]>;
  state: Record<string, unknown>;
}

export class DoorDashSession implements SessionContext {
  readonly cookieJar: CookieJar;
  private state: Record<string, unknown> = {};

  constructor(savedData?: SessionData) {
    this.cookieJar = new CookieJar();
    if (savedData) {
      if (savedData.cookies) this.cookieJar.fromJSON(savedData.cookies);
      if (savedData.state) this.state = savedData.state;
    }
  }

  /** Export session to JSON for DB storage. */
  export(): SessionData {
    return {
      cookies: this.cookieJar.toJSON(),
      state: this.state,
    };
  }

  /** Check if we have valid auth cookies. */
  isAuthenticated(): boolean {
    return !!this.cookieJar.get("ddweb_token");
  }

  getConsumerId(): string {
    return (
      this.cookieJar.get("ajs_user_id") ||
      this.cookieJar.get("consumerId") ||
      ""
    );
  }

  getCsrfToken(): string {
    return this.cookieJar.get("csrf_token") || "";
  }

  getState<T = unknown>(key: string): T | undefined {
    return this.state[key] as T | undefined;
  }

  setState(key: string, value: unknown): void {
    this.state[key] = value;
  }

  clear(): void {
    this.cookieJar.clear();
    this.state = {};
  }

  debugCookies(): Record<string, string[]> {
    return this.cookieJar.dump();
  }
}
