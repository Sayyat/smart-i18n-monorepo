import { checkIsReactMode, ConsoleLogger, copyTemplates } from "../lib";
import { type IReactOrCoreCommandProps } from "./types";

export async function initCommand({
	opts,
	options,
}: IReactOrCoreCommandProps) {
	const logger = new ConsoleLogger(opts.verbose);
	const isReact = await checkIsReactMode(options, logger);
	await copyTemplates(isReact, logger);
	logger.info('\n✅ Initialization complete. Please run "pnpm smart-i18next-cli" to sync files.');
}
