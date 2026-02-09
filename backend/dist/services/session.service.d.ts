export interface Player {
    userId: string;
    socketId: string;
    playerName: string;
    score: number;
    connected: boolean;
}
export interface GameRoom {
    gameId: string;
    players: Map<string, Player>;
    createdAt: number;
    lastActivity: number;
    maxPlayers?: number;
}
declare class GameSessionManager {
    private rooms;
    private cleanupTimer?;
    initialize(): void;
    getOrCreateRoom(roomId: string, gameId: string, maxPlayers?: number): GameRoom;
    addPlayer(roomId: string, player: Player): boolean;
    removePlayer(roomId: string, socketId: string): boolean;
    getRoom(roomId: string): GameRoom | undefined;
    getPlayers(roomId: string): Player[];
    updatePlayerScore(roomId: string, socketId: string, score: number): void;
    private deleteRoom;
    private cleanupInactiveRooms;
    getStats(): {
        activeRooms: number;
        totalPlayers: number;
        memory: number;
    };
    shutdown(): void;
}
export declare const sessionManager: GameSessionManager;
export {};
//# sourceMappingURL=session.service.d.ts.map