declare class CacheManager {
    private cache;
    private timers;
    set<T>(key: string, value: T, ttlMs?: number): void;
    get<T>(key: string): T | null;
    delete(key: string): void;
    clear(): void;
    getStats(): {
        size: number;
        memory: number;
    };
}
export declare const cache: CacheManager;
export {};
//# sourceMappingURL=cache.d.ts.map