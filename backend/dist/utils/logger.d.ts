declare class Logger {
    private readonly logLevelMap;
    private readonly currentLevel;
    private readonly isDev;
    private shouldLog;
    debug(message: string, context?: Record<string, any>): void;
    info(message: string, context?: Record<string, any>): void;
    warn(message: string, context?: Record<string, any>): void;
    error(message: string, error?: Error | unknown, context?: Record<string, any>): void;
}
export declare const logger: Logger;
export {};
//# sourceMappingURL=logger.d.ts.map