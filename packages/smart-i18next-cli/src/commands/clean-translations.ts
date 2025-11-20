import { cleanUnusedFiles, ConsoleLogger, loadConfig } from "../lib";
import { type ICommandProps } from "./types";

interface ICleanTranslationsCommandProps extends ICommandProps {
	options: { dry?: boolean, pruneEmpty?: boolean };
}

export async function cleanTranslationsCommand({
	opts,
	options,
}: ICleanTranslationsCommandProps) {
	const logger = new ConsoleLogger(opts.verbose);
	const config = await loadConfig(opts.config, logger)
	if (config === null) return
	await cleanUnusedFiles({config, dry: options.dry === true, pruneEmpty: options.pruneEmpty === true, logger})
}