declare class DatabaseService {
    private readonly listFields;
    getUserById(userId: string, options?: {
        noCache?: boolean;
    }): Promise<any>;
    getUserByEmail(email: string): Promise<(import("mongoose").Document<unknown, {}, import("../models").IUser> & import("../models").IUser & {
        _id: import("mongoose").Types.ObjectId;
    }) | null>;
    getGameById(gameId: string, options?: {
        populate?: boolean;
        noCache?: boolean;
    }): Promise<any>;
    getGames(query?: Record<string, any>, page?: number, limit?: number, options?: {
        noCache?: boolean;
        sort?: Record<string, 1 | -1>;
    }): Promise<any>;
    getUserGames(creatorId: string, page?: number, limit?: number): Promise<any>;
    invalidateGameCache(gameId: string): void;
    invalidateUserCache(userId: string): void;
    getCacheStats(): {
        size: number;
        memory: number;
    };
}
export declare const db: DatabaseService;
export {};
//# sourceMappingURL=database.service.d.ts.map