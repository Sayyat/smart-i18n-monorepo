import { ConsoleLogger, generateNamespaces, loadConfig } from "../lib";
import { type ICommandProps } from "./types";

export async function generateNamespacesCommand({
	opts,
}: ICommandProps) {
	const logger = new ConsoleLogger(opts.verbose);
	const config = await loadConfig(opts.config, logger)
	if (config === null) return
	await generateNamespaces(config, logger)
}