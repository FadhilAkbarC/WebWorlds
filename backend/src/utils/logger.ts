/**
 * Optimized logger for production environments
 * Development: Shows all logs in console
 * Production: Only errors/warns; use external service (Sentry, DataDog) for full logging
 */

type LogLevel = 'debug' | 'info' | 'warn' | 'error';

class Logger {
  private readonly logLevelMap: Record<LogLevel, number> = {
    debug: 0,
    info: 1,
    warn: 2,
    error: 3,
  };

  private readonly currentLevel: LogLevel = (process.env.LOG_LEVEL as LogLevel) || 'info';
  private readonly isDev = process.env.NODE_ENV !== 'production';

  private shouldLog(level: LogLevel): boolean {
    return this.logLevelMap[level] >= this.logLevelMap[this.currentLevel];
  }

  /**
   * Development-only debug logging - disabled in production
   */
  debug(message: string, context?: Record<string, any>): void {
    if (!this.isDev || !this.shouldLog('debug')) return;
    console.log(`[DEBUG] ${message}`, context || '');
  }

  /**
   * Info logging - shown in development only
   */
  info(message: string, context?: Record<string, any>): void {
    if (!this.shouldLog('info')) return;
    if (this.isDev) console.log(`[INFO] ${message}`, context || '');
  }

  /**
   * Warning logs - always visible
   */
  warn(message: string, context?: Record<string, any>): void {
    if (!this.shouldLog('warn')) return;
    console.warn(`[WARN] ${message}`, context || '');
  }

  /**
   * Error logs - always visible
   */
  error(message: string, error?: Error | unknown, context?: Record<string, any>): void {
    if (!this.shouldLog('error')) return;

    const errorInfo = error instanceof Error ? {
      name: error.name,
      message: error.message,
      stack: this.isDev ? error.stack : undefined,
    } : error;

    console.error(`[ERROR] ${message}`, { ...context, error: errorInfo });
  }
}

export const logger = new Logger();
