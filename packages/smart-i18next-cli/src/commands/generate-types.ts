import { ConsoleLogger, generateTypes, loadConfig } from "../lib";
import { type ICommandProps } from "./types";

export async function generateTypesCommand({
	opts,
}: ICommandProps) {
	const logger = new ConsoleLogger(opts.verbose);
	const config = await loadConfig(opts.config, logger)
	if (config === null) return
	await generateTypes(config, logger)
}