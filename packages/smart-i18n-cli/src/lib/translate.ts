import chalk from "chalk";
import fs from "fs/promises";
import nodeFetch, { Response } from "node-fetch";
import path from "path";

type TLanguage = "kk" | "ru" | "en";
const configs = {
  languages: ["kk", "ru", "en"] as TLanguage[],
  fallbackLng: "en" as TLanguage,
  localesDirectory: "src/i18n/locales",
};

// NOTE: 'dotenv' is only required for local testing, not in final package logic
// but we keep it here for simplicity of the environment setup.
import * as dotenv from "dotenv";
dotenv.config({
  path: ".env.development",
});

// --- Interface Definitions ---
interface TranslationEntry {
  filename: string;
  key: string;
  value: string;
  translated?: string;
}

interface TranslationMap {
  [key: string]: string;
}

interface ResultMap {
  [lang: string]: { [filename: string]: TranslationMap };
}

// --- Configuration ---
const CHUNK_SIZE = 20;
const API_URL = "https://deep-translate1.p.rapidapi.com/language/translation/v2/translate";
const RAPIDAPI_HOST = "deep-translate1.p.rapidapi.com";
const RAPIDAPI_KEY = process.env.RAPIDAPI_KEY || "";
const LANGUAGES_DIR = path.resolve(configs.localesDirectory);

const HEADERS = {
  "Content-Type": "application/json",
  "X-RapidAPI-Key": RAPIDAPI_KEY,
  "X-RapidAPI-Host": RAPIDAPI_HOST,
};

const translationCache = new Map<string, string>();

// --- Utility Functions ---

function chunkArray<T>(array: T[], size: number): T[][] {
  const result: T[][] = [];
  for (let i = 0; i < array.length; i += size) {
    result.push(array.slice(i, i + size));
  }
  return result;
}

function isAllDigit(str: unknown): boolean {
  return /^\d+$/.test(String(str).trim());
}

async function sendTranslationRequestDeepL(
  text: string,
  targetLang: string,
  sourceLang: string // configs.fallbackLanguage-дан келеді
): Promise<string> {
  const cacheKey = `${sourceLang}::${targetLang}::${text}`;
  if (translationCache.has(cacheKey)) {
    return translationCache.get(cacheKey)!;
  }

  console.log(chalk.yellow(`🔁 Translating "${text}" to "${targetLang}"`));

  if (!RAPIDAPI_KEY) {
    console.error(chalk.red("❌ FATAL: RAPIDAPI_KEY is missing. Check your .env file."));
    return text;
  }

  try {
    const response: Response = await nodeFetch(API_URL, {
      method: "POST",
      headers: HEADERS,
      body: JSON.stringify({
        q: text,
        source: sourceLang,
        target: targetLang,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`DeepL API error (${targetLang}): ${response.status} - ${errorText.substring(0, 50)}...`);
    }

    const result: any = await response.json();

    // API жауабының структурасын тексеру (сіздің бастапқы кодыңызға негізделген)
    const translations = result.data?.translations;
    const translated = translations ? translations[0]?.translatedText : text;

    // HTML entity-лерді тазалау (егер API оларды қайтарса)
    const cleaned = translated ? translated.replace(/&amp;/g, '&').trim() : text;

    translationCache.set(cacheKey, cleaned);
    return cleaned;
  } catch (err) {
    console.error(chalk.red(`[RapidAPI] ❌ Failed to translate key. Returning original text.`), (err as Error).message);
    // Қате болса, бастапқы мәтінді (кілтті) қайтарамыз (қолмен аудару үшін)
    return text;
  }
}

async function translateChunk(
  chunk: TranslationEntry[],
  targetLanguage: string,
  sourceLanguage: string
): Promise<TranslationEntry[]> {
  const results: TranslationEntry[] = [];
  const sameLang = targetLanguage === sourceLanguage;

  for (const item of chunk) {
    if (sameLang || isAllDigit(item.value)) {
      results.push({ ...item, translated: item.value });
    } else {
      try {
        const translated = await sendTranslationRequestDeepL(
          item.value,
          targetLanguage,
          sourceLanguage
        );
        results.push({ ...item, translated });
      } catch (e) {
        // Егер API сұранысы қате болса (мысалы, 429), бастапқы мәтінді сақтаймыз
        results.push({ ...item, translated: item.value });
      }
    }
  }

  return results;
}

// --- File I/O Logic ---

async function writeTranslations(resultMap: ResultMap): Promise<void> {
  for (const [lang, files] of Object.entries(resultMap)) {
    for (const [filename, translations] of Object.entries(files)) {
      const filePath = path.join(LANGUAGES_DIR, lang, filename);

      let existingContent: TranslationMap = {};
      try {
        await fs.access(filePath);
        const content = await fs.readFile(filePath, "utf8");
        existingContent = JSON.parse(content);
      } catch (err: any) {
        if (err.code !== "ENOENT") {
          console.error(`❌ Error reading existing file: ${filePath}`, err);
        }
        existingContent = {};
      }

      const mergedContent: TranslationMap = { ...existingContent, ...translations };

      await fs.mkdir(path.dirname(filePath), { recursive: true });
      await fs.writeFile(
        filePath,
        `${JSON.stringify(mergedContent, null, 2)}\n`,
        "utf8"
      );
      console.log(`✔ ${chalk.green(lang)} → ${chalk.cyan(filename)}`);
    }
  }
}


const dirExists = async (dir: string): Promise<boolean> => {
  try {
    await fs.access(dir);
    return true;
  } catch {
    return false;
  }
};

async function getNewKeys(targetLang: string): Promise<TranslationEntry[]> {
  const newKeys: TranslationEntry[] = [];
  // languagesDir: 'src/i18n/locales'
  const targetLangDir = path.join(LANGUAGES_DIR, targetLang);


  if (!(await dirExists(targetLangDir))) {
    // target language directory missing — nothing to translate
    return [];
  }

  const files = await fs.readdir(targetLangDir);
  for (const file of files) {
    if (!file.endsWith('.json')) continue;
    const filePath = path.join(targetLangDir, file);

    try {
      const content = await fs.readFile(filePath, "utf8");
      const json: TranslationMap = JSON.parse(content);

      // ❗️ "key == value" логикасы
      for (const [key, value] of Object.entries(json)) {
        // Аударма әлі жоқ болса немесе мән мен кілт сәйкес келсе (яғни, "Welcome": "Welcome")
        if (value === key) {
          newKeys.push({ filename: file, key, value });
        }
      }
    } catch (e) {
      console.error(chalk.red(`❌ Failed to parse JSON in file: ${filePath}`), e);
    }
  }

  return newKeys;
}

// --- Main Export Function ---

export async function translate(requestedLang: string = "all"): Promise<void> {
  console.log(
    chalk.blue(`🌍 Starting translation generation for ${requestedLang}...`)
  );

  const targetLanguages: TLanguage[] =
    requestedLang === "all"
      ? configs.languages
      : (configs.languages as string[]).includes(requestedLang)
        ? [requestedLang as TLanguage]
        : (() => {
          console.error(
            chalk.red(
              `❌ Invalid language: "${requestedLang}". Allowed: ${configs.languages.join(", ")}`
            )
          );
          return [] as TLanguage[];
        })();

  if (targetLanguages.length === 0) return;

  console.log({ targetLanguages });

  try {
    const resultMap: ResultMap = {};
    const sourceLanguage = configs.fallbackLng;

    for (const lang of targetLanguages) {
      resultMap[lang] = {};
      const newKeys = await getNewKeys(lang);

      // translate only the keys that are equal to it's value
      for (const chunk of chunkArray(newKeys, CHUNK_SIZE)) {
        const translatedChunk = await translateChunk(
          chunk,
          lang,
          sourceLanguage,
        );

        for (const { filename, key, translated } of translatedChunk) {
          resultMap[lang][filename] = resultMap[lang][filename] || {};
          resultMap[lang][filename][key] = translated!;
        }
      }
    }

    await writeTranslations(resultMap);
    console.log(chalk.green("✅ Translations successfully generated!"));

  } catch (err) {
    console.error(chalk.red("❌ Failed to generate translations:"), err);
    throw err; // Сәтсіздік туралы Gulp-қа хабарлау
  }
}