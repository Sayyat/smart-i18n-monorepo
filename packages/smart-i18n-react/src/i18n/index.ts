/*
 * Copyright (c) 2025. Sayat Raykul
 */

export {
    NAMESPACES,
    type TNamespace,
    type TNamespaceTranslationKeys,
    type TAllTranslationKeys,
} from "./generated";
export type {TFunction} from "./types/i18n";
export {useTranslation, default as i18n} from "./lib/client";
export {getTranslation, getUserLanguage} from "./lib/server";
export {
    languages,
    FALLBACK_LANGUAGE,
    defaultNS,
    type TLanguage,
} from "./lib/config";
