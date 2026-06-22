const LOG_LEVELS = { error: 0, warn: 1, info: 2, debug: 3 } as const;
type LogLevel = keyof typeof LOG_LEVELS;

const currentLevel: LogLevel = (process.env.LOG_LEVEL as LogLevel) || 'info';

function timestamp(): string {
  return new Date().toISOString();
}

function shouldLog(level: LogLevel): boolean {
  return LOG_LEVELS[level] <= LOG_LEVELS[currentLevel];
}

export const logger = {
  error: (...args: unknown[]) => shouldLog('error') && console.error(`[${timestamp()}] [ERROR]`, ...args),
  warn: (...args: unknown[]) => shouldLog('warn') && console.warn(`[${timestamp()}] [WARN]`, ...args),
  info: (...args: unknown[]) => shouldLog('info') && console.info(`[${timestamp()}] [INFO]`, ...args),
  debug: (...args: unknown[]) => shouldLog('debug') && console.debug(`[${timestamp()}] [DEBUG]`, ...args),
};
