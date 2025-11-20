import * as fs from "node:fs/promises";
import * as path from "node:path";
import chalk from "chalk";
import { AUTOGENERATION_COMMENT, GENERATED_LOCALES_PATH, GENERATED_TYPES_PATH } from "./constants";
import { type I18nextToolkitConfig } from "i18next-cli";
import { getPathFromConsumerRoot } from "./paths";
import { type ILogger } from "./types";
import { ConsoleLogger } from "./logger";

/**
 * Flattens a nested JSON object into dot-separated keys (e.g., 'object.key.value').
 */
function flattenKeys(obj: Record<string, any>, prefix: string = ""): string[] {
	const keys: string[] = [];
	for (const key in obj) {
		if (typeof obj[key] === "object" && obj[key] !== null) {
			keys.push(
				...flattenKeys(obj[key] as Record<string, any>, `${prefix}${key}.`),
			);
		} else {
			keys.push(`${prefix}${key}`);
		}
	}
	return keys;
}

/**
 * Scans the 'locales' folder (template directory) and generates the 'generated/types.ts' file.
 */
export async function generateTypes(
	config: I18nextToolkitConfig,
	logger: ILogger = new ConsoleLogger(),
) {
	const primaryLanguage =
		config.extract.primaryLanguage ?? config.locales[0] ?? "en";

	const TEMPLATE_DIR = getPathFromConsumerRoot(
		GENERATED_LOCALES_PATH, // ❗️ from 'constants.ts'
		primaryLanguage,
	);
	const OUTPUT_FILE = getPathFromConsumerRoot(GENERATED_TYPES_PATH); // ❗️ from 'constants.ts'

	try {
		await fs.access(TEMPLATE_DIR);
	} catch {
		logger.error(chalk.red("❌ Template folder not found:"));
		logger.error(chalk.yellow(`→ ${TEMPLATE_DIR}`));
		logger.error(
			chalk.gray("💡 Run the command: ") +
			chalk.cyan("pnpm smart-i18next-cli extract"),
		);
		return;
	}

	logger.info(chalk.blue("📦 Generating translation types..."));

	const files = await fs.readdir(TEMPLATE_DIR);

	const namespaces: Record<string, string[]> = {};
	const allKeys: string[] = [];

	for (const file of files) {
		if (!file.endsWith(".json")) continue;
		const namespace = file.replace(/\.json$/, "");
		const content = await fs.readFile(path.join(TEMPLATE_DIR, file), "utf8");

		const json: Record<string, any> = JSON.parse(content);
		const keys: string[] = flattenKeys(json);

		namespaces[namespace] = keys;
		allKeys.push(...keys.map((key) => `${namespace}.${key}`));
	}

	const lines: string[] = [
		AUTOGENERATION_COMMENT,
		"",
		"export type TNamespace =",
		Object.keys(namespaces).length > 0
			? Object.keys(namespaces)
			.map((ns: string) => `  | "${ns}"`)
			.join("\n")
			: " never", // ❗️ 5. If no namespaces are found, use the 'never' type
		"",
		"export type TNamespaceTranslationKeys = {",
		...Object.entries(namespaces).map(
			([ns, keys]: [string, string[]]) =>
				`  "${ns}": ${
					keys.length > 0
						? `\n    | ${keys.map((k: string) => `"${k}"`).join("\n    | ")}`
						: "never"
				};`,
		),
		"};",
		"",
		`export type TAllTranslationKeys = ${
			allKeys.length > 0
				? "\n  | " + allKeys.map((k: string) => `"${k}"`).join("\n  | ")
				: "never" // ❗️ 5. If no keys are found, use the 'never' type
		};`,
		"",
	];

	await fs.mkdir(path.dirname(OUTPUT_FILE), {recursive: true});
	await fs.writeFile(OUTPUT_FILE, lines.join("\n"), "utf8");

	logger.info(chalk.green(`✅ Generated: ${OUTPUT_FILE}`));
}