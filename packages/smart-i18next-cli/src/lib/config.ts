import { type  I18nextToolkitConfig } from 'i18next-cli';
import { createJiti } from 'jiti'
import { ConsoleLogger } from './logger'
import { access } from 'node:fs/promises'
import { resolve } from 'node:path'
import { pathToFileURL } from 'node:url'
import { type ILogger } from "./types";

/**
 * List of supported configuration file names in order of precedence
 */
const CONFIG_FILES = [
	'i18next.config.ts',
	'i18next.config.js',
	'i18next.config.mjs',
	'i18next.config.cjs',
]

/**
 * Helper function to find the first existing config file in the current working directory.
 * Searches for files in the order defined by CONFIG_FILES.
 *
 * @returns Promise that resolves to the full path of the found config file, or null if none found
 */
async function findConfigFile(configPath?: string): Promise<string | null> {
	if (configPath) {
		// Allow relative or absolute path provided by the user
		const resolved = resolve(process.cwd(), configPath)
		try {
			await access(resolved)
			return resolved
		} catch {
			return null
		}
	}

	for (const file of CONFIG_FILES) {
		const fullPath = resolve(process.cwd(), file)
		try {
			await access(fullPath)
			return fullPath
		} catch {
			// File doesn't exist, continue to the next one
		}
	}
	return null
}

/**
 * Loads and validates the i18next toolkit configuration from the project root or a provided path.
 *
 * @param configPath - Optional explicit path to a config file (relative to cwd or absolute)
 * @param logger - Optional logger instance
 */
export async function loadConfig(configPath?: string, logger: ILogger = new ConsoleLogger()): Promise<I18nextToolkitConfig | null> {
	const configPathFound = await findConfigFile(configPath)

	if (!configPathFound) {
		if (configPath) {
			logger.error(`❗Error: Config file not found at "${configPath}"`)
		}
		logger.info(`ℹ️ Config file not found. Run \`smart-i18next-cli init\` to generate i18next.config.ts`)
		return null
	}

	try {
		let config: any

		// Use jiti for TypeScript files, native import for JavaScript
		if (configPathFound.endsWith('.ts')) {
			const jiti = createJiti(process.cwd(), {
				interopDefault: false,
			})

			const configModule = await jiti.import(configPathFound, {default: true}) as any;
			config = configModule.default || configModule;
		} else {
			const configUrl = pathToFileURL(configPathFound).href
			const configModule = await import(`${configUrl}?t=${Date.now()}`)
			config = configModule.default
		}

		if (!config || Object.keys(config).length === 0) {
			logger.error(`❗Error: No default export found in ${configPathFound}`)
			return null
		}

		// Set default sync options
		config.extract ||= {}
		config.extract.primaryLanguage ||= config.locales[0] || 'en'
		config.extract.secondaryLanguages ||= config.locales.filter((l: string) => l !== config.extract.primaryLanguage)

		return config
	} catch (error) {
		logger.error(`❗Error loading configuration from ${configPathFound}`)
		logger.error(error)
		return null
	}
}
