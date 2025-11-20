import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { copyBaseInitFiles, copyDirectoryRecursive, copyTemplates } from '../../../src/lib/copy';
import * as fsp from 'node:fs/promises';
import { getPathFromConsumerRoot, getPathFromLibraryRoot } from '../../../src/lib/paths';

// 1. Mock fs
vi.mock('node:fs/promises');
// 2. Mock paths lib
vi.mock('../../../src/lib/paths');

// 3. ❗️ NEW: Mock 'path' module to force forward slashes (POSIX behavior)
// This ensures tests pass on Windows, Linux, and Mac identically.
vi.mock('node:path', async () => {
	const actual = await vi.importActual('node:path');
	// Use posix implementation for join/resolve/etc during tests
	return { ...actual, ...require('node:path').posix };
});

// Mock Logger to capture output without cluttering the console
const mockLogger = {
	info: vi.fn(),
	warn: vi.fn(),
	error: vi.fn(),
};

describe('Copy Utilities', () => {
	beforeEach(() => {
		vi.resetAllMocks();

		// Setup default path mocks to return predictable strings
		(getPathFromConsumerRoot as any).mockImplementation((...args: string[]) => `/app/${args.join('/')}`);
		(getPathFromLibraryRoot as any).mockImplementation((...args: string[]) => `/lib/${args.join('/')}`);
	});

	afterEach(() => {
		vi.restoreAllMocks();
	});

	// -------------------------------------------------------------------------
	// Test: copyBaseInitFiles
	// -------------------------------------------------------------------------
	describe('copyBaseInitFiles', () => {
		it('Should skip if source file does not exist in library', async () => {
			// Mock access to fail (source missing)
			vi.mocked(fsp.access).mockRejectedValue(new Error('ENOENT'));

			await copyBaseInitFiles(mockLogger);

			// Should log warning and NOT attempt copy
			expect(mockLogger.warn).toHaveBeenCalledWith(expect.stringContaining('not found in library source'));
			expect(fsp.copyFile).not.toHaveBeenCalled();
		});

		it('Should skip if destination file already exists in consumer project', async () => {
			// Mock access to succeed for both source and dest (dest exists)
			vi.mocked(fsp.access).mockResolvedValue(undefined);

			await copyBaseInitFiles(mockLogger);

			// Should log warning and NOT attempt copy
			expect(mockLogger.warn).toHaveBeenCalledWith(expect.stringContaining('already exists in project'));
			expect(fsp.copyFile).not.toHaveBeenCalled();
		});

		it('Should copy files if source exists and destination does not', async () => {
			// Mock access implementation:
			// - Return success for library paths (source exists)
			// - Return error for app paths (destination doesn't exist yet)
			vi.mocked(fsp.access).mockImplementation(async (p) => {
				if (typeof p === 'string' && p.startsWith('/lib/')) return Promise.resolve();
				return Promise.reject(new Error('ENOENT'));
			});

			await copyBaseInitFiles(mockLogger);

			// Should copy 'i18next.config.ts' and '.demo-env'
			expect(fsp.copyFile).toHaveBeenCalledTimes(2);
			expect(mockLogger.info).toHaveBeenCalledWith(expect.stringContaining('Copied:'));
		});
	});

	// -------------------------------------------------------------------------
	// Test: copyDirectoryRecursive
	// -------------------------------------------------------------------------
	describe('copyDirectoryRecursive', () => {
		it('Should skip if source directory is missing', async () => {
			vi.mocked(fsp.access).mockRejectedValue(new Error('ENOENT'));

			await copyDirectoryRecursive('/lib/src/missing', '/app/src', mockLogger);

			expect(mockLogger.warn).toHaveBeenCalledWith(expect.stringContaining('folder not found'));
			expect(fsp.mkdir).not.toHaveBeenCalled();
		});

		it('Should recursively copy files and directories', async () => {
			// 1. Setup Mocks

			// Mock access:
			// /lib/src -> exists
			// /lib/src/subDir -> exists (recursive check)
			// Anything else -> fails
			vi.mocked(fsp.access).mockImplementation(async (p) => {
				if (p === '/lib/src' || p === '/lib/src/subDir') return Promise.resolve();
				return Promise.reject(new Error('ENOENT'));
			});

			// Mock readdir
			vi.mocked(fsp.readdir).mockImplementation(async (p) => {
				if (p === '/lib/src') {
					return [
						{ name: 'file.txt', isDirectory: () => false },
						{ name: 'subDir', isDirectory: () => true },
					] as any;
				}
				if (p === '/lib/src/subDir') {
					return [
						{ name: 'subFile.txt', isDirectory: () => false }
					] as any;
				}
				return [];
			});

			// 2. Run
			await copyDirectoryRecursive('/lib/src', '/app/dest', mockLogger as any);

			// 3. Assertions
			// Should create root dest dir
			expect(fsp.mkdir).toHaveBeenCalledWith('/app/dest', { recursive: true });

			// Should create subDir
			expect(fsp.mkdir).toHaveBeenCalledWith('/app/dest/subDir', { recursive: true });

			// Should copy root file
			expect(fsp.copyFile).toHaveBeenCalledWith('/lib/src/file.txt', '/app/dest/file.txt');

			// Should copy subDir file
			expect(fsp.copyFile).toHaveBeenCalledWith('/lib/src/subDir/subFile.txt', '/app/dest/subDir/subFile.txt');
		});
	});

	// -------------------------------------------------------------------------
	// Test: copyTemplates
	// -------------------------------------------------------------------------
	describe('copyTemplates', () => {
		it('Should use REACT templates path when isReact is true', async () => {
			// Allow base init to pass
			vi.mocked(fsp.access).mockImplementation(async (p) => {
				if (typeof p === 'string' && p.startsWith('/lib/')) return Promise.resolve();
				return Promise.reject(new Error('ENOENT'));
			});

			// Mock empty readdir to stop recursion immediately for this test
			vi.mocked(fsp.readdir).mockResolvedValue([]);

			await copyTemplates(true, mockLogger);

			// Verify path resolution requested the REACT path
			expect(getPathFromLibraryRoot).toHaveBeenCalledWith("src/templates/react/i18n");
		});

		it('Should use CORE templates path when isReact is false', async () => {
			// Allow base init to pass
			vi.mocked(fsp.access).mockImplementation(async (p) => {
				if (typeof p === 'string' && p.startsWith('/lib/')) return Promise.resolve();
				return Promise.reject(new Error('ENOENT'));
			});

			vi.mocked(fsp.readdir).mockResolvedValue([]);

			await copyTemplates(false, mockLogger);

			// Verify path resolution requested the CORE path
			expect(getPathFromLibraryRoot).toHaveBeenCalledWith("src/templates/core/i18n");
		});
	});
});