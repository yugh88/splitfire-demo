export type LogLevel = "debug" | "info" | "warn" | "error";

export interface LogFields {
  [key: string]: unknown;
}

const LEVELS: Record<LogLevel, number> = {
  debug: 10,
  info: 20,
  warn: 30,
  error: 40,
};

const NAMES: LogLevel[] = ["debug", "info", "warn", "error"];

function currentLevel(): LogLevel {
  const fromEnv = process.env.LOG_LEVEL;
  if (fromEnv === "debug" || fromEnv === "warn" || fromEnv === "error") {
    return fromEnv;
  }
  return "info";
}

function write(level: LogLevel, message: string, fields: LogFields = {}): void {
  if (LEVELS[level] < LEVELS[currentLevel()]) {
    return;
  }
  const line = { time: new Date().toISOString(), level, message, ...fields };
  const stream = level === "error" ? process.stderr : process.stdout;
  stream.write(`${JSON.stringify(line)}\n`);
}

export const logger = {
  debug: (message: string, fields?: LogFields) => write("debug", message, fields),
  info: (message: string, fields?: LogFields) => write("info", message, fields),
  warn: (message: string, fields?: LogFields) => write("warn", message, fields),
  error: (message: string, fields?: LogFields) => write("error", message, fields),
};

export function isLogLevel(value: unknown): value is LogLevel {
  return typeof value === "string" && NAMES.includes(value as LogLevel);
}
