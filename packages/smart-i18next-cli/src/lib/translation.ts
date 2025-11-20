import chalk from "chalk";
import { GENERATED_LOCALES_PATH } from "./constants";
import { type I18nextToolkitConfig } from "i18next-cli"
import { ConsoleLogger } from "./logger";
import fetch from "node-fetch";
import * as fs from "node:fs/promises";
import * as path from "node:path";
import { type ILogger } from "./types";
import dotenv from "dotenv";

interface ITranslationsMap {
	[language: string]: {
		[namespace: string]: {
			[key: string]: string;
		}
	}
}

interface INewKey {
	filename: string;
	key: string;
	value: string;
}

interface ITranslatedINewKey extends INewKey {
	translated: string;
}

interface IDeepTranslateResponse {
	data: {
		translations: {
			translatedText: string[]
		}
	}
}

const LANGUAGES_DIR = path.resolve(GENERATED_LOCALES_PATH);
const CHUNK_SIZE = 20;
const API_URL = "https://deep-translate1.p.rapidapi.com/language/translate/v2";
const RAPIDAPI_HOST = "deep-translate1.p.rapidapi.com";

function chunkArray(array: INewKey[], size: number) {
	const result: INewKey[][] = [];
	for (let i = 0; i < array.length; i += size) {
		result.push(array.slice(i, i + size));
	}
	return result;
}


const translationCache = new Map();


async function sendTranslationRequestDeepL(
	text: string,
	targetLang: string,
	sourceLang: string = "en",
	logger: ILogger = new ConsoleLogger()
): Promise<string> {
	const cacheKey = `${sourceLang}::${targetLang}::${text}`;
	if (translationCache.has(cacheKey)) {
		return translationCache.get(cacheKey);
	}

	dotenv.config();

	// ❗️ 1. Get API Key dynamically at runtime
	const apiKey = process.env.RAPIDAPI_KEY || "";

	if (!apiKey) {
		logger.warn(`⚠️ Skipping translation: "RAPIDAPI_KEY" is not set in your .env file.`);
		return text;
	}
	const headers = {
		"Content-Type": "application/json",
		"X-RapidAPI-Key": apiKey,
		"X-RapidAPI-Host": RAPIDAPI_HOST,
	};

	logger.info(`🔁 Translating "${text}" to "${targetLang}"`);

	const response = await fetch(API_URL, {
		method: "POST",
		headers,
		body: JSON.stringify({
			q: text,
			source: sourceLang,
			target: targetLang,
		}),
	});

	if (!response.ok) {
		throw new Error(`DeepL API error (${targetLang}): ${response.status}`);
	}

	const result = await response.json() as IDeepTranslateResponse;
	const translated = result.data.translations.translatedText[0];
	translationCache.set(cacheKey, translated);
	return translated;
}

function isAllDigit(str: string) {
	return /^\d+$/.test(String(str).trim());
}

async function translateChunk(chunk: INewKey[], targetLanguage: string, sourceLanguage: string = "en", logger: ILogger = new ConsoleLogger()): Promise<ITranslatedINewKey[]> {
	const results = [];
	const sameLang = targetLanguage === sourceLanguage;

	for (const item of chunk) {
		if (sameLang || isAllDigit(item.value)) {
			results.push({...item, translated: item.value});
		} else {
			const translated = await sendTranslationRequestDeepL(
				item.value,
				targetLanguage,
				sourceLanguage,
				logger,
			);
			results.push({...item, translated});
		}
	}

	return results;
}

async function writeTranslations(resultMap: ITranslationsMap, logger: ILogger = new ConsoleLogger()) {
	for (const [lang, files] of Object.entries(resultMap)) {
		for (const [filename, translations] of Object.entries(files)) {
			const filePath = path.join(LANGUAGES_DIR, lang, filename);

			let existingContent = {};
			try {
				await fs.access(filePath);
				const content = await fs.readFile(filePath, "utf8");
				existingContent = JSON.parse(content);
			} catch (err) {
				logger.error(`❌ Error while reading a file: ${filePath}, ${err}`);
				existingContent = {};
			}

			const mergedContent = {...existingContent, ...translations};

			await fs.mkdir(path.dirname(filePath), {recursive: true});
			await fs.writeFile(
				filePath,
				`${JSON.stringify(mergedContent, null, 2)}\n`,
				"utf8",
			);
			logger.info(`✅ ${chalk.green(lang)} → ${chalk.cyan(filename)}`);
		}
	}
}


async function getNewKeys(targetLang: string = "en") {
	const newKeys: INewKey[] = [];
	const targetLangFile = path.join(LANGUAGES_DIR, targetLang);

	const files = await fs.readdir(targetLangFile);
	for (const file of files) {
		const filePath = path.join(targetLangFile, file);
		const content = await fs.readFile(filePath, "utf8");
		const json = JSON.parse(content);

		for (const [key, value] of Object.entries(json)) {
			if (value === key) {
				newKeys.push({filename: file, key, value});
			}
		}
	}

	return newKeys;
}

export async function translate(config: I18nextToolkitConfig, requestedLanguage = "all", logger: ILogger = new ConsoleLogger()) {
	logger.info(
		chalk.blue(`🌍 Starting translation generation for ${requestedLanguage}...`),
	);

	const targetLanguages =
		requestedLanguage === "all"
			? config.locales
			: config.locales.includes(requestedLanguage)
				? [requestedLanguage]
				: (() => {
					logger.error(
						chalk.red(
							`❌ Invalid language: "${requestedLanguage}". Allowed: ${config.locales.join(", ")}`,
						),
					);
					return [];
				})();

	if (targetLanguages.length === 0) {
		logger.info(`❌ No target languages found. Update your i18next.config.{js|mjs|ts|json}`);
		return
	}

	logger.info(`🌍 Target languages: ${targetLanguages.join(", ")}`);
	try {
		const primaryLanguage = config.extract.primaryLanguage ?? config.locales[0] ?? "en"

		const resultMap: ITranslationsMap = {};

		for (const lang of targetLanguages) {
			resultMap[lang] = {};
			const newKeys = await getNewKeys(lang);

			// translate only the keys that are equal to it's value
			for (const chunk of chunkArray(newKeys, CHUNK_SIZE)) {
				const translatedChunk = await translateChunk(
					chunk,
					lang,
					primaryLanguage,
					logger,
				);
				for (const {filename, key, translated} of translatedChunk) {
					resultMap[lang][filename] = resultMap[lang][filename] || {};
					resultMap[lang][filename][key] = translated;
				}
			}
		}

		await writeTranslations(resultMap);
		logger.info(chalk.green("✅ Translations successfully generated!"));
	} catch (err) {
		logger.error(chalk.red(`❌ Failed to generate translations: ${err}`));
	}
}
