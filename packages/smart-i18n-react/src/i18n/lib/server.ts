/*
 * Copyright (c) 2025. Sayat Raykul
 */

/**
 * smart-i18n tolerance mode
 * -------------------------
 * `TNamespace` (from generated/types.ts) is a static union primarily optimized for editor
 * autocomplete and quick TS performance. After refactors (e.g. renaming a screen), it may
 * temporarily contain stale items until the developer runs:
 *   1) `smart-i18n clean-translations`
 *   2) `smart-i18n` (to regenerate namespaces and types)
 *
 * `NAMESPACES` (from generated/namespaces.ts) is the runtime source of truth
 * for currently valid namespaces discovered in the codebase.
 *
 * To keep builds resilient, this module:
 *  - accepts `string` for the runtime `ns` argument;
 *  - validates it against `NAMESPACES` (`isKnownNamespace`);
 *  - if unknown, logs a warning and falls back to a safe namespace (`pickFallbackNamespace`);
 *  - exposes overloaded `getTranslation(...)` so strict typing is preserved
 *    when `ns` is a valid `TNamespace`, and a permissive signature is used otherwise.
 *
 * Result: production never crashes due to stale namespaces, while developers
 * still get strong typing and autocompletion in the happy path.
 */

"use server";

import {createInstance} from "i18next";
import {safeT} from "./safety";
import {NAMESPACES, type TNamespace, type  TNamespaceTranslationKeys} from "../generated";
import {COOKIE_NAME, FALLBACK_LANGUAGE, type TLanguage} from "./config";
import {cookies} from "next/headers";
import fs from "fs/promises";
import path from "path";

export async function getUserLanguage(): Promise<TLanguage> {
    return (
        ((await cookies()).get(COOKIE_NAME)?.value as TLanguage) ||
        FALLBACK_LANGUAGE
    );
}

// Known namespaces at runtime (from generated/namespaces.ts)
type TKnownNamespace = (typeof NAMESPACES)[number];

const isKnownNamespace = (ns: string): ns is TKnownNamespace =>
    (NAMESPACES as readonly string[]).includes(ns);

const pickFallbackNamespace = (): TKnownNamespace =>
    (NAMESPACES.includes("common" as any) ? "common" : NAMESPACES[0]) as TKnownNamespace;

const warnStaleNamespace = (ns: string, chosen: TKnownNamespace) => {
    if (process.env.NODE_ENV !== "production") {
        console.warn(
            `[smart-i18n] Unknown namespace "${ns}". Using "${chosen}" instead. ` +
            `Tip: run "smart-i18n clean-translations" then "smart-i18n" to remove stale files and refresh types.`
        );
    }
};

export async function loadNamespace(
    lng: string,
    ns: string
): Promise<Record<string, any>> {
    const filePath = path.resolve(process.cwd(), "src/i18n/locales", lng, `${ns}.json`);
    try {
        const file = await fs.readFile(filePath, "utf-8");
        return JSON.parse(file);
    } catch {
        return {};
    }
}

async function initI18nextOnce(lng: string, ns: string) {
    const translations = await loadNamespace(lng, ns);
    return createInstance(
        {
            lng,
            fallbackLng: "en",
            ns: [ns],
            defaultNS: ns,
            resources: {
                [lng]: {
                    [ns]: translations,
                },
            },
            returnNull: false,
            returnEmptyString: true,
            returnObjects: false,
            nsSeparator: ".",
            keySeparator: ".",
            load: "languageOnly",
        },
        () => {
        }
    );
}

// Overloads preserve strong typing for valid `TNamespace`,
// and gracefully degrade to a permissive `(key: string) => string` otherwise.
export async function getTranslation<N extends TNamespace>(
    ns: N
): Promise<{
    t: <K extends TNamespaceTranslationKeys[N]>(
        key: K,
        options?: Record<string, unknown>
    ) => string;
}>;
export async function getTranslation(
    ns: string
): Promise<{ t: (key: string, options?: Record<string, unknown>) => string }>;
export async function getTranslation(ns: string) {
    const language = await getUserLanguage();

    let effectiveNs: string = ns;
    if (!isKnownNamespace(ns)) {
        const fallback = pickFallbackNamespace();
        warnStaleNamespace(ns, fallback);
        effectiveNs = fallback;
    }

    const i18nextInstance = await initI18nextOnce(language, effectiveNs);
    const rawT = i18nextInstance.getFixedT(language, effectiveNs);
    const t = safeT(rawT);

    return {t} as any;
}
