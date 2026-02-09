/**
 * Standardized API Response Format
 * Ensures consistency across all endpoints
 */

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

/**
 * Helper to create success responses
 */
export function successResponse<T>(
  data: T,
  pagination?: Omit<PaginationMeta, 'hasNextPage' | 'hasPrevPage'>
): ApiResponse<T> {
  const paginationMeta = pagination ? {
    ...pagination,
    hasNextPage: pagination.page < pagination.pages,
    hasPrevPage: pagination.page > 1,
  } : undefined;

  return {
    success: true,
    data,
    meta: {
      ...(paginationMeta && { pagination: paginationMeta }),
      timestamp: new Date().toISOString(),
    },
  };
}

/**
 * Helper to create error responses
 */
export function errorResponse(message: string): ApiResponse {
  return {
    success: false,
    error: message,
    meta: {
      timestamp: new Date().toISOString(),
    },
  };
}
