"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.successResponse = successResponse;
exports.errorResponse = errorResponse;
function successResponse(data, pagination) {
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
function errorResponse(message) {
    return {
        success: false,
        error: message,
        meta: {
            timestamp: new Date().toISOString(),
        },
    };
}
//# sourceMappingURL=response.js.map