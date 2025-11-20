import { ConsoleLogger, loadConfig, translate } from "../lib";
import { type ICommandProps } from "./types";

interface IGenerateTranslationsCommandProps extends ICommandProps {
	options: {language?: string};
}

export async function generateTranslationsCommand({
	opts,
	options,
}: IGenerateTranslationsCommandProps) {
	const logger = new ConsoleLogger(opts.verbose);
	const config = await loadConfig(opts.config, logger)
	if (config === null) return
	await translate(config, options.language, logger)
}