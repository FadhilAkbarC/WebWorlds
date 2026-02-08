export declare const config: {
    readonly NODE_ENV: "development" | "production" | "test";
    readonly PORT: number;
    readonly HOST: string;
    readonly MONGODB_URI: string;
    readonly JWT_SECRET: string;
    readonly JWT_EXPIRY: string;
    readonly CORS_ORIGIN: string;
    readonly RATE_LIMIT_WINDOW_MS: number;
    readonly RATE_LIMIT_MAX_REQUESTS: number;
    readonly LOG_LEVEL: "debug" | "info" | "warn" | "error";
    readonly IS_PRODUCTION: boolean;
};
export declare function validateConfig(): void;
export default config;
//# sourceMappingURL=env.d.ts.map