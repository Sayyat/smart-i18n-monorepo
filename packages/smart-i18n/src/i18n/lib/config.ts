export const languages = ["kk", "ru", "en"] as const;
export type TLanguage = (typeof languages)[number];
export const FALLBACK_LANGUAGE: TLanguage = "en";
export const defaultNS = "translation";
