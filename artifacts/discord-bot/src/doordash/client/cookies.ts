/**
 * Cookie jar — adapted from doordash-mcp for in-memory multi-account use.
 */

export interface Cookie {
  name: string;
  value: string;
  domain: string;
  path: string;
  expires?: Date;
  httpOnly: boolean;
  secure: boolean;
  sameSite?: string;
}

export class CookieJar {
  private store = new Map<string, Map<string, Cookie>>();

  get(name: string): string {
    for (const cookies of this.store.values()) {
      const cookie = cookies.get(name);
      if (cookie && !this.isExpired(cookie)) {
        return cookie.value;
      }
    }
    return "";
  }

  storeCookies(url: string, headers: Record<string, string | string[]>): void {
    const rawSetCookie = headers["set-cookie"] ?? headers["Set-Cookie"];
    if (!rawSetCookie) return;

    const cookieStrings = this.normalizeSetCookieHeader(rawSetCookie);
    const domain = this.extractDomain(url);

    for (const raw of cookieStrings) {
      const cookie = this.parse(raw, domain);
      if (!cookie) continue;

      const cookieDomain = cookie.domain || domain;
      if (!this.store.has(cookieDomain)) {
        this.store.set(cookieDomain, new Map());
      }
      this.store.get(cookieDomain)!.set(cookie.name, cookie);
    }
  }

  getForUrl(url: string): string {
    const domain = this.extractDomain(url);
    const parts: string[] = [];

    for (const [cookieDomain, cookies] of this.store) {
      if (domain.endsWith(cookieDomain) || cookieDomain.endsWith(domain)) {
        for (const cookie of cookies.values()) {
          if (!this.isExpired(cookie)) {
            parts.push(`${cookie.name}=${cookie.value}`);
          }
        }
      }
    }

    return parts.join("; ");
  }

  clear(): void {
    this.store.clear();
  }

  toJSON(): Record<string, Cookie[]> {
    const result: Record<string, Cookie[]> = {};
    for (const [domain, cookies] of this.store) {
      result[domain] = [...cookies.values()];
    }
    return result;
  }

  fromJSON(data: Record<string, Cookie[]>): void {
    this.store.clear();
    for (const [domain, cookies] of Object.entries(data)) {
      const map = new Map<string, Cookie>();
      for (const cookie of cookies) {
        map.set(cookie.name, cookie);
      }
      this.store.set(domain, map);
    }
  }

  dump(): Record<string, string[]> {
    const result: Record<string, string[]> = {};
    for (const [domain, cookies] of this.store) {
      result[domain] = [...cookies.keys()];
    }
    return result;
  }

  private isExpired(cookie: Cookie): boolean {
    if (!cookie.expires) return false;
    return new Date(cookie.expires) < new Date();
  }

  private extractDomain(url: string): string {
    try {
      const u = new URL(url);
      return u.hostname;
    } catch {
      return url;
    }
  }

  private parse(raw: string, defaultDomain: string): Cookie | null {
    const parts = raw.split(";").map((p) => p.trim());
    const [nameVal, ...attributes] = parts;
    if (!nameVal) return null;

    const eqIdx = nameVal.indexOf("=");
    if (eqIdx === -1) return null;

    const name = nameVal.slice(0, eqIdx).trim();
    const value = nameVal.slice(eqIdx + 1).trim();

    let domain = defaultDomain;
    let path = "/";
    let expires: Date | undefined;
    let httpOnly = false;
    let secure = false;
    let sameSite: string | undefined;

    for (const attr of attributes) {
      const lower = attr.toLowerCase();
      if (lower.startsWith("domain=")) {
        domain = attr.slice(7).replace(/^\./, "");
      } else if (lower.startsWith("path=")) {
        path = attr.slice(5);
      } else if (lower.startsWith("expires=")) {
        const d = new Date(attr.slice(8));
        if (!isNaN(d.getTime())) expires = d;
      } else if (lower.startsWith("max-age=")) {
        const secs = parseInt(attr.slice(8));
        if (!isNaN(secs)) {
          expires = new Date(Date.now() + secs * 1000);
        }
      } else if (lower === "httponly") {
        httpOnly = true;
      } else if (lower === "secure") {
        secure = true;
      } else if (lower.startsWith("samesite=")) {
        sameSite = attr.slice(9);
      }
    }

    return { name, value, domain, path, expires, httpOnly, secure, sameSite };
  }

  private normalizeSetCookieHeader(raw: string | string[] | unknown): string[] {
    if (Array.isArray(raw)) {
      return raw.flatMap((s) => {
        if (typeof s !== "string") return [];
        return this.splitSetCookieString(s);
      });
    }
    if (typeof raw === "string") {
      return this.splitSetCookieString(raw);
    }
    return [];
  }

  private splitSetCookieString(s: string): string[] {
    return s.split(/,(?=\s*[a-zA-Z_][a-zA-Z0-9_-]*=)/);
  }
}
