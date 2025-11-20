import chalk from "chalk";
import { ConsoleLogger } from "./logger";
import { type I18nextToolkitConfig } from "i18next-cli";
import { type ILogger } from "./types";

interface IMergeTranslationsProps {
	config: I18nextToolkitConfig;
	existing: Record<string, string>;
	newTranslations: Record<string, string>;
	logger: ILogger;
}

export function mergeTranslations({
	config,
	existing,
	newTranslations,
	logger = new ConsoleLogger()
}: IMergeTranslationsProps) {

	const newKeysWithDefaults: Record<string, string> = {};
	for (const key in newTranslations) {
		newKeysWithDefaults[key] = key;
	}

	const merged = { ...newKeysWithDefaults, ...existing };

	Object.keys(merged).forEach((key) => {
		if (key in newTranslations) {
			return;
		}
		if (config.extract.removeUnusedKeys) {
			logger.info(
				`❌ ${chalk.cyan("Removed unused key")}: ${chalk.yellow(key)}`,
			);
			delete merged[key];
		} else {
			logger.info(
				`⚠️ ${chalk.cyan("Keeping unused key")}: ${chalk.yellow(key)}`,
			);
		}
	});

	return merged;
}