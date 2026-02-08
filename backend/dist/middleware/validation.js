"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validators = exports.VALID_CATEGORIES = void 0;
exports.validateEmail = validateEmail;
exports.validateUsername = validateUsername;
exports.validatePassword = validatePassword;
exports.validateTitle = validateTitle;
exports.validateDescription = validateDescription;
exports.validateUrl = validateUrl;
exports.validateCategory = validateCategory;
exports.validateGameSettings = validateGameSettings;
function validateEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email) && email.length <= 255;
}
function validateUsername(username) {
    const usernameRegex = /^[a-z0-9_-]{3,30}$/;
    return usernameRegex.test(username);
}
function validatePassword(password) {
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d@$!%*?&]{8,}$/;
    return passwordRegex.test(password);
}
function validateTitle(title) {
    return title.length >= 3 && title.length <= 100;
}
function validateDescription(description) {
    return description.length <= 1000;
}
function validateUrl(url) {
    try {
        new URL(url);
        return true;
    }
    catch {
        return false;
    }
}
exports.VALID_CATEGORIES = ['action', 'puzzle', 'adventure', 'sports', 'other'];
function validateCategory(category) {
    return exports.VALID_CATEGORIES.includes(category);
}
function validateGameSettings(settings) {
    if (!settings)
        return false;
    const { width, height, fps } = settings;
    if (typeof width !== 'number' || width < 320 || width > 2560)
        return false;
    if (typeof height !== 'number' || height < 240 || height > 1440)
        return false;
    if (typeof fps !== 'number' || fps < 15 || fps > 120)
        return false;
    return true;
}
exports.validators = {
    email: validateEmail,
    username: validateUsername,
    password: validatePassword,
    title: validateTitle,
    description: validateDescription,
    url: validateUrl,
    category: validateCategory,
    gameSettings: validateGameSettings,
};
exports.default = exports.validators;
//# sourceMappingURL=validation.js.map