#!/usr/bin/env node

import { Command } from 'commander';
import { spawnSync } from 'node:child_process';
import {
	cleanTranslationsCommand,
	generateConfigsCommand,
	generateNamespacesCommand,
	generateTranslationsCommand,
	generateTypesCommand,
	initCommand
} from './commands';
import chalk from 'chalk';
import { getPackageVersion } from "./lib";

const program = new Command();
const I18NEXT_CLI_BIN = 'i18next-cli';

program
.name('smart-i18next-cli')
.description('CLI for smart-i18n toolkit (TS/i18next-cli engine).')
.version(await getPackageVersion());

program.option('-c, --config <path>', 'Path to i18next-cli config file (overrides detection)')
program.option("-v --verbose", "Whether show or hide internal logs", true)


program
.command('init')
.description('Initializes the project with custom smart-i18next-cli templates.')
.option('--react', 'Force initialization for a React/Next.js project.')
.option('--core', 'Force initialization for a Core (non-React) project.')
.action(async (options) => {
	await initCommand({options, opts: program.opts()});
});

program
.command('generate-configs')
.description('Generates the runtime config (config.ts) from i18next.config.ts')
.option('--react', 'Generate config for a React/Next.js project.', false)
.option('--core', 'Generate config for a Core (non-React) project.')
.action(async (options) => {
	await generateConfigsCommand({options, opts: program.opts()});
});

program
.command('generate-namespaces')
.description('Generates namespaces.ts based on 1-to-1 file namespacing')
.action(async (options) => {
	await generateNamespacesCommand({opts: program.opts()});
});

program
.command('generate-translations')
.description('Translates missing keys via RapidAPI (Costly operation).')
.option("-l --language <lang>", "Language to translate", "all")
.action(async (options) => {
	await generateTranslationsCommand({options, opts: program.opts()})
});

program
.command('generate-types')
.description('Generate static types (TNamespace, TAllTranslationKeys)')
.action(async (options) => {
	await generateTypesCommand({opts: program.opts()})
});

program
.command('clean-translations')
.description('Clean unused translation files')
.option("-d --dry", "Dry run")
.option("-p --prune-empty", "Remove empty keys")
.action(async (options) => {
	await cleanTranslationsCommand({options, opts: program.opts()})
});


program.helpOption(false);
program.helpCommand(false);

program
.option('-h, --help', 'Display help for smart-i18next-cli (custom & core commands)')
.command('help')
.description('Display help for smart-i18next-cli (custom & core commands)')
.action(() => {
	displayCustomHelp();
});

program.on('option:help', () => {
	displayCustomHelp();
	process.exit(0);
});

function displayCustomHelp() {
	console.log(chalk.bold("Usage: smart-i18next-cli <command> [options]"));

	console.log(chalk.cyan("\n--- Custom 'Smart' Commands ---"));

	console.log(chalk.green("\n  init [--react | --core]"));
	console.log("    Initializes the project with custom templates.");

	console.log(chalk.green("\n  generate-configs [--react | --core]"));
	console.log("    Generates the runtime config (config.ts) from i18next.config.ts.");

	console.log(chalk.green("\n  generate-namespaces"));
	console.log("    Generates namespaces.ts (1-to-1 file namespacing).");

	console.log(chalk.green("\n  generate-types"));
	console.log("    Generates static types (TNamespace, TAllTranslationKeys).");

	console.log(chalk.green("\n  generate-translations [-l, --language <lang>]"));
	console.log("    Translates missing (key == value) keys via RapidAPI.");

	console.log(chalk.green("\n  clean-translations"));
	console.log("    Clean unused translation files.");

	console.log(chalk.green("\n  help (-h, --help)"));
	console.log("    Displays this help information.");

	console.log(chalk.cyan("\n--- Core 'i18next-cli' Commands (Forwarded) ---"));
	console.log("    (e.g., 'extract', 'sync', 'status', 'lint', 'locize-sync')\n");

	spawnSync(
		I18NEXT_CLI_BIN,
		['--help'],
		{stdio: 'inherit', shell: true, cwd: process.cwd()}
	);
}

program.on('command:*', (operands) => {
	const opts = program.opts();
	const argsToForward = [...operands];
	if (opts.config) {
		argsToForward.push('--config', opts.config);
	}
	console.log(chalk.blue(`Forwarding command to '${I18NEXT_CLI_BIN}':`), operands.join(' '));

	const result = spawnSync(
		I18NEXT_CLI_BIN,
		operands,
		{
			stdio: 'inherit',
			shell: true,
			cwd: process.cwd(),
		}
	);

	if (result.error || result.status !== 0) {
		process.exit(result.status || 1);
	}
});

program.parse(process.argv);