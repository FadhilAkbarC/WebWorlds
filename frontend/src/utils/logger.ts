/**
 * Client-side logger utility
 * Simple logging that respects environment
 */

type LogLevel = 'debug' | 'info' | 'warn' | 'error';

class ClientLogger {
  private isDev = process.env.NODE_ENV === 'development';

  debug(message: string, context?: Record<string, any>): void {
    if (!this.isDev) return;
    console.log(`[DEBUG] ${message}`, context || '');
  }

  info(message: string, context?: Record<string, any>): void {
    if (this.isDev) console.log(`[INFO] ${message}`, context || '');
  }

  warn(message: string, context?: Record<string, any>): void {
    console.warn(`[WARN] ${message}`, context || '');
  }

  error(message: string, error?: Error | unknown): void {
    console.error(`[ERROR] ${message}`, error);
  }
}

export const logger = new ClientLogger();
