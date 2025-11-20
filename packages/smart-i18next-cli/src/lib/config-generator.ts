import { AUTOGENERATION_COMMENT, COOKIE_NAME, GENERATED_CONFIG_PATH } from "./constants";
import { type I18nextToolkitConfig } from "i18next-cli"
import { ConsoleLogger } from "./logger";
import * as fs from "node:fs/promises";
import * as path from "node:path";
import { getPathFromConsumerRoot } from "./paths";
import { ILogger } from "./types";

export async function generateConfigs(config: I18nextToolkitConfig, isReact: boolean = false, logger: ILogger = new ConsoleLogger()) {
	const extract = config.extract ?? {}
	const outputPath = getPathFromConsumerRoot(GENERATED_CONFIG_PATH);
	const cookieRow = isReact ? `export const COOKIE_NAME = "${COOKIE_NAME}";` : ""
	const content = `
${AUTOGENERATION_COMMENT}

export const languages = ${JSON.stringify(config?.locales ?? [])} as const;
export type TLanguage = (typeof languages)[number];
export const FALLBACK_LANGUAGE: TLanguage = "${extract?.primaryLanguage}";
export const defaultNS = "${extract?.defaultNS}";
${cookieRow}
`.trim();

	const dir = path.dirname(outputPath);
	try {
		await fs.access(dir);
	} catch {
		await fs.mkdir(dir, {recursive: true});
	}

	await fs.writeFile(outputPath, content, "utf8");
	logger.info(`✅ smart-i18next-cli runtime config generated at: ${outputPath}`);
}