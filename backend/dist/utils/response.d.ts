export interface PaginationMeta {
    page: number;
    limit: number;
    total: number;
    pages: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
}
export interface ApiResponse<T = any> {
    success: boolean;
    data?: T;
    error?: string;
    meta?: {
        pagination?: PaginationMeta;
        timestamp: string;
    };
}
export declare function successResponse<T>(data: T, pagination?: Omit<PaginationMeta, 'hasNextPage' | 'hasPrevPage'>): ApiResponse<T>;
export declare function errorResponse(message: string): ApiResponse;
//# sourceMappingURL=response.d.ts.map