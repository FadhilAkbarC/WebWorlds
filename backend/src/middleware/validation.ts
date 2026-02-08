/**
 * Input Validators
 */

export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email) && email.length <= 255;
}

export function validateUsername(username: string): boolean {
  const usernameRegex = /^[a-z0-9_-]{3,30}$/;
  return usernameRegex.test(username);
}

/**
 * Password requirements:
 * - At least 8 characters
 * - At least 1 uppercase letter
 * - At least 1 lowercase letter
 * - At least 1 number
 */
export function validatePassword(password: string): boolean {
  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d@$!%*?&]{8,}$/;
  return passwordRegex.test(password);
}

export function validateTitle(title: string): boolean {
  return title.length >= 3 && title.length <= 100;
}

export function validateDescription(description: string): boolean {
  return description.length <= 1000;
}

export function validateUrl(url: string): boolean {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

/**
 * Game category validation
 */
export const VALID_CATEGORIES = ['action', 'puzzle', 'adventure', 'sports', 'other'] as const;

export function validateCategory(category: any): boolean {
  return VALID_CATEGORIES.includes(category);
}

/**
 * Game settings validation
 */
export function validateGameSettings(settings: any): boolean {
  if (!settings) return false;

  const { width, height, fps } = settings;

  // Width and height: 320x240 to 2560x1440
  if (typeof width !== 'number' || width < 320 || width > 2560) return false;
  if (typeof height !== 'number' || height < 240 || height > 1440) return false;

  // FPS: 15 to 120
  if (typeof fps !== 'number' || fps < 15 || fps > 120) return false;

  return true;
}

/**
 * Batch validators
 */
export const validators = {
  email: validateEmail,
  username: validateUsername,
  password: validatePassword,
  title: validateTitle,
  description: validateDescription,
  url: validateUrl,
  category: validateCategory,
  gameSettings: validateGameSettings,
} as const;

export default validators;
