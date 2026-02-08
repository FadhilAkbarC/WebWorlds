/**
 * Application Constants
 */

export const CONSTANTS = {
  // Pagination
  DEFAULT_PAGE: 1,
  DEFAULT_LIMIT: 12,
  MAX_LIMIT: 100,
  MIN_LIMIT: 1,

  // User validation
  USERNAME_MIN_LENGTH: 3,
  USERNAME_MAX_LENGTH: 30,
  EMAIL_MAX_LENGTH: 255,
  PASSWORD_MIN_LENGTH: 8,
  BIO_MAX_LENGTH: 500,

  // Game validation
  GAME_TITLE_MIN_LENGTH: 3,
  GAME_TITLE_MAX_LENGTH: 100,
  GAME_DESCRIPTION_MAX_LENGTH: 1000,
  GAME_WIDTH_MIN: 320,
  GAME_WIDTH_MAX: 2560,
  GAME_HEIGHT_MIN: 240,
  GAME_HEIGHT_MAX: 1440,
  GAME_FPS_MIN: 15,
  GAME_FPS_MAX: 120,

  // Game categories
  GAME_CATEGORIES: ['action', 'puzzle', 'adventure', 'sports', 'other'] as const,

  // HTTP Status Codes
  HTTP_OK: 200,
  HTTP_CREATED: 201,
  HTTP_BAD_REQUEST: 400,
  HTTP_UNAUTHORIZED: 401,
  HTTP_FORBIDDEN: 403,
  HTTP_NOT_FOUND: 404,
  HTTP_CONFLICT: 409,
  HTTP_RATE_LIMITED: 429,
  HTTP_INTERNAL_ERROR: 500,

  // Error messages
  ERRORS: {
    INVALID_EMAIL: 'Invalid email format',
    INVALID_USERNAME: 'Username must be 3-30 chars, lowercase letters, numbers, _, or -',
    INVALID_PASSWORD: 'Password must be 8+ chars with uppercase, lowercase, and number',
    USER_EXISTS: 'Username or email already registered',
    INVALID_CREDENTIALS: 'Invalid credentials',
    NOT_FOUND: 'Resource not found',
    NOT_AUTHORIZED: 'Not authorized to perform this action',
    INVALID_TOKEN: 'Invalid or expired token',
    DATABASE_ERROR: 'Database error',
    VALIDATION_ERROR: 'Validation failed',
    RATE_LIMIT: 'Too many requests',
  },

  // Success messages
  SUCCESS: {
    USER_CREATED: 'User created successfully',
    LOGIN_SUCCESS: 'Login successful',
    GAME_CREATED: 'Game created',
    GAME_UPDATED: 'Game updated',
    GAME_PUBLISHED: 'Game published',
    GAME_LIKED: 'Game liked',
    GAME_UNLIKED: 'Game unliked',
    DELETION_SUCCESS: 'Deleted successfully',
  },
} as const;

export default CONSTANTS;
