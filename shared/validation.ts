/**
 * Validation Rules - Single Source of Truth
 * Shared between frontend and backend to ensure consistency
 */

export const VALIDATION_RULES = {
  // User validation
  username: {
    minLength: 3,
    maxLength: 30,
    pattern: /^[a-z0-9_-]+$/,
    error: 'Username must be 3-30 chars, lowercase letters, numbers, _, or -',
  },
  email: {
    pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    maxLength: 255,
    error: 'Invalid email format',
  },
  password: {
    minLength: 8,
    pattern: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d@$!%*?&]{8,}$/,
    error: 'Password must be 8+ chars with uppercase, lowercase, and number',
  },

  // Game validation
  gameTitle: {
    minLength: 3,
    maxLength: 100,
    error: 'Title must be 3-100 characters',
  },
  gameDescription: {
    maxLength: 1000,
    error: 'Description max 1000 characters',
  },

  // Game settings
  gameSettings: {
    widthMin: 320,
    widthMax: 2560,
    heightMin: 240,
    heightMax: 1440,
    fpsMin: 15,
    fpsMax: 120,
  },

  // Game categories
  categories: ['action', 'puzzle', 'adventure', 'sports', 'other'] as const,

  // Pagination
  pagination: {
    defaultLimit: 12,
    maxLimit: 100,
    minLimit: 1,
  },
} as const;

export type GameCategory = typeof VALIDATION_RULES.categories[number];
