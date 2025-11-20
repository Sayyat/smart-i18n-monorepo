import type { ILogger } from './types'

/**
 * Default console-based logger implementation for the i18next toolkit.
 * Provides basic logging functionality with different severity levels.
 *
 * @example
 * ```typescript
 * const logger = new ConsoleLogger("my prefix", true)
 * logger.info('Extraction started')
 * logger.warn('Deprecated configuration option used')
 * logger.error('Failed to parse file')
 * ```
 */
export class ConsoleLogger implements ILogger {
	/**
	 * Logs an informational message to the console.
	 *
	 * @param message - The message to log
	 */

	private readonly verbose: boolean
	private readonly prefix: string

	constructor(verbose: boolean = false, prefix: string = "") {
		this.verbose = verbose;
		this.prefix = prefix;
	}

	info(message: string): void {
		if (this.verbose) {
			console.log(`${this.prefix} ${message}`);
		}
	}

	/**
	 * Logs a warning message to the console.
	 *
	 * @param message - The warning message to log
	 */
	warn(message: string): void {
		if (this.verbose) {
			console.warn(`${this.prefix} ${message}`)
		}
	}

	/**
	 * Logs an error message to the console.
	 *
	 * @param message - The error message to log
	 */
	error(message: string): void {
		if (this.verbose) {
			console.error(`${this.prefix} ${message}`)
		}
	}
}