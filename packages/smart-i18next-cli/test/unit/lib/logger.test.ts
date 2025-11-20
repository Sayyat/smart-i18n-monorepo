import { afterEach, beforeEach, describe, expect, it, type MockInstance, vi } from 'vitest';
import { ConsoleLogger } from "../../../src/lib/logger";

describe('ConsoleLogger', () => {
	// Define variables here, but don't assign the spy yet
	let logSpy: MockInstance;
	let warnSpy: MockInstance;
	let errorSpy: MockInstance;

	beforeEach(() => {
		// 1. Initialize spies FRESH for every test
		logSpy = vi.spyOn(console, 'log').mockImplementation(() => {
		});
		warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {
		});
		errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {
		});
	});

	afterEach(() => {
		// 2. Clean up (restore original console) after every test
		vi.restoreAllMocks();
	});

	describe('When verbose is FALSE (default)', () => {
		it('Should NOT log info messages', () => {
			const logger = new ConsoleLogger(false);
			logger.info('This should be hidden');
			expect(logSpy).not.toHaveBeenCalled();
		});

		it('Should NOT log warning messages', () => {
			const logger = new ConsoleLogger(false);
			logger.warn('This warning is hidden');
			expect(warnSpy).not.toHaveBeenCalled();
		});

		it('Should NOT log error messages', () => {
			const logger = new ConsoleLogger(false);
			logger.error('This error is hidden');
			expect(errorSpy).not.toHaveBeenCalled();
		});
	});

	describe('When verbose is TRUE', () => {
		it('Should log info messages to console.log', () => {
			const logger = new ConsoleLogger(true);
			logger.info('System ready');

			expect(logSpy).toHaveBeenCalledTimes(1);
			expect(logSpy).toHaveBeenCalledWith(expect.stringContaining('System ready'));
		});

		it('Should log warning messages to console.warn', () => {
			const logger = new ConsoleLogger(true);
			logger.warn('Low memory');

			expect(warnSpy).toHaveBeenCalledTimes(1);
			expect(warnSpy).toHaveBeenCalledWith(expect.stringContaining('Low memory'));
		});

		it('Should log error messages to console.error', () => {
			const logger = new ConsoleLogger(true);
			logger.error('Crash detected');

			expect(errorSpy).toHaveBeenCalledTimes(1);
			expect(errorSpy).toHaveBeenCalledWith(expect.stringContaining('Crash detected'));
		});
	});

	describe('Prefix Handling', () => {
		it('Should prepend the prefix to the message', () => {
			const prefix = '[MyCLI]';
			const logger = new ConsoleLogger(true, prefix);

			logger.info('Hello');

			// Check that the spy was called with "Prefix Message" format
			expect(logSpy).toHaveBeenCalledWith(`${prefix} Hello`);
		});

		it('Should handle empty prefix correctly', () => {
			const logger = new ConsoleLogger(true, '');
			logger.info('Hello');
			expect(logSpy).toHaveBeenCalledWith(' Hello');
		});
	});
});