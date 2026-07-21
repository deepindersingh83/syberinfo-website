/**
 * Minimal structured logger. Emits single-line JSON in production (easy to ship
 * to a log aggregator) and readable lines in development. Swap the `emit` sink
 * for Sentry/Datadog/etc. later without touching call sites.
 */
type Level = "debug" | "info" | "warn" | "error";

function emit(level: Level, msg: string, meta?: Record<string, unknown>) {
  const entry = { level, msg, time: new Date().toISOString(), ...meta };
  const line =
    process.env.NODE_ENV === "production"
      ? JSON.stringify(entry)
      : `[${level}] ${msg}${meta ? " " + JSON.stringify(meta) : ""}`;
  // eslint-disable-next-line no-console
  (console[level === "debug" ? "log" : level] as (...a: unknown[]) => void)(line);
}

export const logger = {
  debug: (msg: string, meta?: Record<string, unknown>) => emit("debug", msg, meta),
  info: (msg: string, meta?: Record<string, unknown>) => emit("info", msg, meta),
  warn: (msg: string, meta?: Record<string, unknown>) => emit("warn", msg, meta),
  error: (msg: string, meta?: Record<string, unknown>) => emit("error", msg, meta),
};
