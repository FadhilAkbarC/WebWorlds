import type { Request, Response, NextFunction } from 'express';
type CacheOptions = {
    ttlMs?: number;
    varyByAuth?: boolean;
    cacheKeyPrefix?: string;
    maxAgeSeconds?: number;
    staleWhileRevalidateSeconds?: number;
    privateCache?: boolean;
};
export declare const cacheResponse: (options?: CacheOptions) => (req: Request, res: Response, next: NextFunction) => void | Response<any, Record<string, any>>;
export {};
//# sourceMappingURL=response-cache.d.ts.map