import { checkIsReactMode, ConsoleLogger, generateConfigs, loadConfig } from "../lib";
import { type IReactOrCoreCommandProps } from "./types";

export async function generateConfigsCommand({
	options,
	opts,
}: IReactOrCoreCommandProps) {
	const logger = new ConsoleLogger(opts.verbose)
	const config = await loadConfig(opts.config, logger);
	if (!config) return;
	const isReact = await checkIsReactMode(options, logger);
	await generateConfigs(config, isReact, logger)
}