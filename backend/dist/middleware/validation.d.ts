export declare function validateEmail(email: string): boolean;
export declare function validateUsername(username: string): boolean;
export declare function validatePassword(password: string): boolean;
export declare function validateTitle(title: string): boolean;
export declare function validateDescription(description: string): boolean;
export declare function validateUrl(url: string): boolean;
export declare const VALID_CATEGORIES: readonly ["action", "puzzle", "adventure", "sports", "other"];
export declare function validateCategory(category: any): boolean;
export declare function validateGameSettings(settings: any): boolean;
export declare const validators: {
    readonly email: typeof validateEmail;
    readonly username: typeof validateUsername;
    readonly password: typeof validatePassword;
    readonly title: typeof validateTitle;
    readonly description: typeof validateDescription;
    readonly url: typeof validateUrl;
    readonly category: typeof validateCategory;
    readonly gameSettings: typeof validateGameSettings;
};
export default validators;
//# sourceMappingURL=validation.d.ts.map