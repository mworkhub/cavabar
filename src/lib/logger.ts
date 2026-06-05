/* Server-side structured logger — outputs JSON to stdout.
   In Vercel, these lines appear in Function Logs and can be
   forwarded to external SIEM via Vercel Log Drains.           */

type Level = "info" | "warn" | "error";

type SecurityEvent =
  | "AUTH_REDIRECT"      // unauthenticated request to protected route
  | "LOGIN_RATE_LIMITED" // IP exceeded login page request limit
  | "LOGIN_SUCCESS"      // successful admin sign-in (via audit)
  | "LOGIN_FAILED"       // failed sign-in attempt (via audit)
  | "HONEYPOT_TRIGGERED" // bot detected via honeypot
  | "SUSPICIOUS_IP";     // general suspicious activity

interface LogEntry {
  level:     Level;
  event:     SecurityEvent | string;
  timestamp: string;
  ip?:       string;
  path?:     string;
  detail?:   string;
  [key: string]: unknown;
}

function emit(entry: LogEntry) {
  const line = JSON.stringify(entry);
  if (entry.level === "error") {
    console.error(line);
  } else if (entry.level === "warn") {
    console.warn(line);
  } else {
    console.log(line);
  }
}

export const logger = {
  auth: {
    /** Unauthenticated request redirected away from protected route */
    blocked(ip: string, path: string) {
      emit({
        level: "warn",
        event: "AUTH_REDIRECT",
        ip,
        path,
        timestamp: new Date().toISOString(),
      });
    },

    /** IP hit the login page rate limit */
    rateLimited(ip: string, count: number) {
      emit({
        level: "warn",
        event: "LOGIN_RATE_LIMITED",
        ip,
        detail: `${count} requests in window`,
        timestamp: new Date().toISOString(),
      });
    },
  },

  security: {
    /** Generic suspicious event */
    suspicious(ip: string, detail: string, extra?: Record<string, unknown>) {
      emit({
        level: "warn",
        event: "SUSPICIOUS_IP",
        ip,
        detail,
        timestamp: new Date().toISOString(),
        ...extra,
      });
    },
  },

  info(event: string, data?: Record<string, unknown>) {
    emit({ level: "info", event, timestamp: new Date().toISOString(), ...data });
  },

  error(event: string, err: unknown, data?: Record<string, unknown>) {
    emit({
      level: "error",
      event,
      timestamp: new Date().toISOString(),
      error: err instanceof Error ? err.message : String(err),
      ...data,
    });
  },
};
