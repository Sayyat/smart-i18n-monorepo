import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import * as fs from 'node:fs';
import {
	findProjectRoot,
	getPathFromConsumerRoot,
	getPathFromLibraryRoot
} from '../../../src/lib/paths';

// 1. Mock 'node:fs' to control file existence checks
vi.mock('node:fs');

// 2. Mock 'node:path' to enforce POSIX style (forward slashes)
// This ensures tests behave the same on Windows and Linux
vi.mock('node:path', async () => {
	const actual = await vi.importActual('node:path');
	return {
		...actual,
		...require('node:path').posix,
		// We must keep the original dirname logic for the real __dirname resolution in library tests,
		// but for the join/resolve logic in functions, we want POSIX.
		join: require('node:path').posix.join,
		dirname: require('node:path').posix.dirname,
		resolve: require('node:path').posix.resolve,
	};
});

describe('Paths Utilities', () => {
	// Save original process.cwd to restore later
	const originalCwd = process.cwd;

	beforeEach(() => {
		vi.resetAllMocks();
	});

	afterEach(() => {
		process.cwd = originalCwd;
	});

	// -------------------------------------------------------------------------
	// Test: findProjectRoot (The Consumer logic)
	// -------------------------------------------------------------------------
	describe('findProjectRoot', () => {
		it('Should return current directory if package.json exists there', () => {
			// Mock cwd to be /app
			vi.spyOn(process, 'cwd').mockReturnValue('/app');

			// Mock fs.existsSync to return true ONLY for /app/package.json
			vi.mocked(fs.existsSync).mockImplementation((p) => {
				return p === '/app/package.json';
			});

			const result = findProjectRoot();
			expect(result).toBe('/app');
		});

		it('Should traverse upwards until it finds package.json', () => {
			// Mock cwd to be deep: /app/src/components/button
			vi.spyOn(process, 'cwd').mockReturnValue('/app/src/components/button');

			// Mock fs.existsSync to return true ONLY for the root /app/package.json
			vi.mocked(fs.existsSync).mockImplementation((p) => {
				return p === '/app/package.json';
			});

			const result = findProjectRoot();

			// It should climb up from button -> components -> src -> app
			expect(result).toBe('/app');
		});

		it('Should throw an error if root of file system is reached without finding package.json', () => {
			vi.spyOn(process, 'cwd').mockReturnValue('/app');

			// Always return false (file never found)
			vi.mocked(fs.existsSync).mockReturnValue(false);

			expect(() => findProjectRoot()).toThrowError(/Could not find a valid project root/);
		});
	});

	// -------------------------------------------------------------------------
	// Test: getPathFromConsumerRoot
	// -------------------------------------------------------------------------
	describe('getPathFromConsumerRoot', () => {
		it('Should join segments relative to the found project root', () => {
			vi.spyOn(process, 'cwd').mockReturnValue('/my-project/src');

			// Assume package.json is at /my-project
			vi.mocked(fs.existsSync).mockImplementation((p) => p === '/my-project/package.json');

			const result = getPathFromConsumerRoot('locales', 'en', 'common.json');

			expect(result).toBe('/my-project/locales/en/common.json');
		});
	});

	// -------------------------------------------------------------------------
	// Test: getPathFromLibraryRoot
	// -------------------------------------------------------------------------
	describe('getPathFromLibraryRoot', () => {
		it('Should resolve paths relative to the library root', () => {
			// Since findLibraryRoot relies on __dirname, which is hard to mock in this specific
			// testing context without transpilation tricks, we will simulate the behavior
			// by ensuring fs.existsSync returns true for a specific mocked structure
			// that represents the library's internal structure.

			// NOTE: We are assuming the test runner (Vitest) creates a valid __dirname environment.
			// We mock fs.existsSync to simply return true so the while(true) loop in
			// findLibraryRoot finds a package.json immediately in the current (mocked) __dirname.

			vi.mocked(fs.existsSync).mockReturnValue(true);

			// We just want to ensure it calls path.join and returns a string
			const result = getPathFromLibraryRoot('templates', 'config.ts');

			expect(typeof result).toBe('string');
			expect(result).toContain('templates/config.ts');
		});
	});
});