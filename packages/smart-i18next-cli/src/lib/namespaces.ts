import { AUTOGENERATION_COMMENT, GENERATED_NAMESPACES_PATH } from "./constants";
import { type I18nextToolkitConfig } from "i18next-cli"
import { ConsoleLogger } from "./logger";
import { minimatch } from "minimatch";
import * as fs from "node:fs/promises";
import * as path from "node:path";
import { getPathFromConsumerRoot } from "./paths";
import { expandGlobs, toArray } from "./patterns";
import { type ILogger } from "./types";


export async function extractNamespaces(logger: ILogger = new ConsoleLogger()) {
	const NAMESPACES_FILE = getPathFromConsumerRoot(GENERATED_NAMESPACES_PATH);

	const dirPath = path.dirname(NAMESPACES_FILE);

	try {
		await fs.access(NAMESPACES_FILE);
	} catch {
		logger.info("⚠️ NAMESPACES file not found. Creating a new one...");
		await fs.mkdir(dirPath, {recursive: true});
		await fs.writeFile(
			NAMESPACES_FILE,
			AUTOGENERATION_COMMENT,
			"utf8",
		);
		return [];
	}

	const content = await fs.readFile(NAMESPACES_FILE, "utf8");

	const match = content.match(
		/export const NAMESPACES = (\[[\s\S]*?\]) as const;/,
	);
	if (!match) {
		logger.warn("⚠️ No NAMESPACES array found in namespaces.ts. Assuming []");
		return [];
	}

	const jsonArrayString = match[1]
	.replace(/,(\s*\])/g, "$1")
	.replace(/'/g, '"');

	try {
		return JSON.parse(jsonArrayString);
	} catch (e) {
		logger.error("❌ Failed to parse NAMESPACES array as JSON.");
		throw e;
	}
}

export function normalizeNamespacePath(filePath: string = "") {
	const srcPath = getPathFromConsumerRoot("src");
	const relative = path.relative(srcPath, filePath);
	const parts = relative.split(path.sep);
	const withoutExt = parts.join(".").replace(/\.(ts|tsx|js|jsx)$/, "");
	return withoutExt;
}

export async function generateNamespaces(config: I18nextToolkitConfig, logger: ILogger = new ConsoleLogger()) {
	const expandedTypes = await expandGlobs(config.extract?.input || [])
	const ignoredTypes = [...toArray(config.extract?.ignore)].filter(Boolean)
	const filteredFiles = expandedTypes.filter(f => !ignoredTypes.some(g => minimatch(f, g, {dot: true})))

	logger.info(`🔎 Scanned ${filteredFiles.length} translation-capable files.`);

	const namespaces = new Set(
		filteredFiles.map(normalizeNamespacePath).filter(Boolean),
	);

	const sorted = Array.from(namespaces).sort();
	const namespaceArrayString =
		"[\n" + sorted.map((ns) => `  "${ns}",`).join("\n") + "\n]";

	const content = `
${AUTOGENERATION_COMMENT}

export const NAMESPACES = ${namespaceArrayString} as const;
`.trim();

	const NAMESPACES_FILE = getPathFromConsumerRoot(GENERATED_NAMESPACES_PATH);

	await fs.mkdir(path.dirname(NAMESPACES_FILE), {recursive: true});
	await fs.writeFile(NAMESPACES_FILE, content, "utf8");

	logger.info(
		`✅ Generated ${NAMESPACES_FILE} with ${sorted.length} namespaces.`,
	);
}
