/** No-op traffic logger for Discord bot (don't write files per request). */

export interface TrafficEntry {
  timestamp: string;
  duration_ms: number;
  request: { method: string; url: string; headers?: unknown; body?: unknown };
  response: { status: number; headers?: unknown; body?: unknown };
}

export class TrafficLogger {
  log(_entry: TrafficEntry): void {
    // silent in bot context
  }

  getSessionDir(): string {
    return "/dev/null";
  }
}
