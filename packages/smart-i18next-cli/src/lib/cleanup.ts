import chalk from "chalk";
import { GENERATED_LOCALES_PATH, GENERATED_NAMESPACES_PATH } from "./constants";
import { glob } from "glob";
import { type I18nextToolkitConfig } from "i18next-cli"
import { ConsoleLogger } from "./logger";
import { minimatch } from "minimatch";
import { extractNamespaces } from "./namespaces";
import * as fs from "node:fs/promises";
import * as path from "node:path";
import { expandGlobs, toArray } from "./patterns";
import { type ILogger } from "./types";

async function readText(file: string) {
	try {
		return await fs.readFile(file, "utf8");
	} catch {
		return null;
	}
}

async function collectNamespacesFromCode(config: I18nextToolkitConfig) {
	const expandedTypes = await expandGlobs(config.extract?.input || [])
	const ignoredTypes = [...toArray(config.extract?.ignore)].filter(Boolean)
	const filteredFiles = expandedTypes.filter(f => !ignoredTypes.some(g => minimatch(f, g, {dot: true})))

	const used = new Set();

	const add = (ns: string) => {
		used.add(ns);
	};

	const reKeyWithNs = /\b(?:i18n\.)?t\(\s*['"`]([^'"`]+):/g; // t('ns:key') / i18n.t('ns:key')
	const reUseTranslationSingle = /useTranslation\(\s*['"`]([^'"`]+)['"`]\s*\)/g; // useTranslation('ns')
	const reUseTranslationArray = /useTranslation\(\s*\[([^\]]+)\]\s*\)/g; // useTranslation(['ns1','ns2'])
	const reUseTranslationGeneric = /useTranslation\s*<\s*['"`]([^'"`]+)['"`]\s*>\s*\(/g; // useTranslation<'ns'>(...)
	const reTransNsProp = /<Trans[^>]*\sns=(["'`])([^"'`]+)\1/gi; // <Trans ns="ns">

	// Typed and direct forms
	const reTFunctionGeneric = /\bTFunction\s*<\s*['"`]([^'"`]+)['"`]\s*>/g; // TFunction<'ns'>
	const reGetTranslationCall = /\bgetTranslation\(\s*['"`]([^'"`]+)['"`]\s*\)/g; // getTranslation('ns')
	const reGetTranslationGeneric = /\bgetTranslation\s*<\s*['"`]([^'"`]+)['"`]\s*>\s*\(/g; // getTranslation<'ns'>(...)

	for (const f of filteredFiles) {
		const txt = await readText(f);
		if (!txt) continue;

		for (const m of txt.matchAll(reKeyWithNs)) add(m[1]);
		for (const m of txt.matchAll(reUseTranslationSingle)) add(m[1]);

		for (const m of txt.matchAll(reUseTranslationArray)) {
			const arrTxt = m[1];
			for (const m2 of arrTxt.matchAll(/['"`]([^'"`]+)['"`]/g)) add(m2[1]);
		}
		for (const m of txt.matchAll(reUseTranslationGeneric)) add(m[1]);
		for (const m of txt.matchAll(reTransNsProp)) add(m[2]);

		// New:
		for (const m of txt.matchAll(reTFunctionGeneric)) add(m[1]);
		for (const m of txt.matchAll(reGetTranslationCall)) add(m[1]);
		for (const m of txt.matchAll(reGetTranslationGeneric)) add(m[1]);
	}
	return used;
}

async function listLocaleFiles(localesRootAbs: string) {
	// Support nested folders: <locales>/<lang>/**/<ns>.json
	const pattern = path.join(localesRootAbs, "*/**/*.json").replace(/\\/g, "/");
	const files = await glob(pattern, {nodir: true});
	return files.map((file) => {
		const rel = path.relative(localesRootAbs, file);
		const parts = rel.split(path.sep);
		const lang = parts[0];
		const ns = path.basename(file, ".json");
		return {file, lang, ns};
	});
}

async function isJsonEmpty(file: string) {
	try {
		const txt = await fs.readFile(file, "utf8");
		const json = JSON.parse(txt);
		if (Array.isArray(json)) return json.length === 0;
		if (json && typeof json === "object") return Object.keys(json).length === 0;
		return false;
	} catch {
		return false;
	}
}


/**
 * Main cleanup function
 * @param {Object} options
 * @param {boolean} options.dry — preview deletions without removing files
 * @param {boolean} options.dry — preview deletions without removing files
 * @param {boolean} options.pruneEmpty — also remove empty JSON files even if namespace is used
 * @param {boolean} options.verbose — verbose logging
 * @param {boolean} options.logger — verbose logging
 */

interface ICleanUnusedFilesProps {
	config: I18nextToolkitConfig
	dry: boolean
	pruneEmpty: boolean
	logger: ILogger
}

export async function cleanUnusedFiles({
	config,
	dry = false,
	pruneEmpty = false,
	logger = new ConsoleLogger(),
}: ICleanUnusedFilesProps) {

	const localesRootAbs = path.resolve(process.cwd(), GENERATED_LOCALES_PATH);
	const generatedNsFile = path.resolve(process.cwd(), GENERATED_NAMESPACES_PATH);

	try {
		await fs.access(localesRootAbs)
	} catch (err) {
		logger.error(`❌ Locales directory not found: ${chalk.yellow(localesRootAbs)}`);
	}

	logger.info(`🌍 locales: ${chalk.yellow(localesRootAbs)}`,);
	logger.info(`📄 generated namespaces file: ${chalk.yellow(generatedNsFile)}`,);

	const fromGenerated = await extractNamespaces(logger);
	const fromCode = await collectNamespacesFromCode(config);
	const usedNamespaces = new Set([...fromGenerated, ...fromCode]);

	logger.info(`📚 used namespaces: ${chalk.yellow([...usedNamespaces].sort().join(", ") || "(empty)")}`);

	const files = await listLocaleFiles(localesRootAbs);

	const deletions = [];
	const empties = [];

	for (const e of files) {
		if (!usedNamespaces.has(e.ns)) {
			deletions.push(e.file);
		} else if (pruneEmpty && (await isJsonEmpty(e.file))) {
			empties.push(e.file);
		}
	}

	const toDelete = [...new Set([...deletions, ...empties])];

	if (toDelete.length === 0) {
		logger.info(chalk.green("✅ Nothing to delete. All files match the used namespaces."));
		return;
	}

	if (dry) {
		logger.info(chalk.green("🧪 DRY-RUN. Files that would be deleted:"));
		for (const f of toDelete) console.log("  -", chalk.red(path.relative(process.cwd(), f)));
		return;
	}

	for (const f of toDelete) {
		try {
			await fs.rm(f, {force: true});
			logger.info(`deleted ${chalk.red(path.relative(process.cwd(), f))}`);
		} catch (e) {
			console.warn("⚠️ Failed to delete", chalk.yellow(f), (e as Error)?.message);
		}
	}

	// Remove empty language directories
	const langs = new Set(files.map((f) => f.lang));
	for (const lang of langs) {
		const langDir = path.join(localesRootAbs, lang);
		try {
			const rest = await fs.readdir(langDir);
			if (rest.length === 0) {
				await fs.rmdir(langDir);
				logger.info(`⛔ rmdir ${path.relative(process.cwd(), langDir)}`);
			}
		} catch {
			/* ignore */
		}
	}

	logger.info(`🧹 ${chalk.green("Done")}. Deleted files: ${chalk.green(toDelete.length)}`);
}
