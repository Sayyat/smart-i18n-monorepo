export const languages = ["kk", "ru", "en"] as const;
export type TLanguage = (typeof languages)[number];
export const FALLBACK_LANGUAGE: TLanguage = "en";
export const defaultNS = "translation";
export const COOKIE_NAME = "NEXT_LANGUAGE";
