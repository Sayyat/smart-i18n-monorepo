import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { cleanUnusedFiles } from '../../../src/lib/cleanup';
import * as fs from 'node:fs/promises';
import { glob } from 'glob';
import { extractNamespaces } from '../../../src/lib/namespaces';
import { expandGlobs } from '../../../src/lib/patterns';

// 1. Mock external dependencies
vi.mock('node:fs/promises');
vi.mock('node:fs');
vi.mock('glob');
vi.mock('../../../src/lib/namespaces');
vi.mock('../../../src/lib/patterns');

vi.mock('../../../src/lib/paths', () => ({
	getPathFromConsumerRoot: vi.fn((...args) => `/app/${args.join('/')}`), // Force POSIX paths
}));

vi.mock('node:path', async () => {
	const actual = await vi.importActual('node:path');
	return { ...actual, ...require('node:path').posix };
});

// 2. Mock Logger (Passed explicitly or default ConsoleLogger will be used)
// We will pass a mock object to capture calls.
const mockLogger = {
	info: vi.fn(),
	warn: vi.fn(),
	error: vi.fn(),
};

// 3. Helper to create mock config
const mockConfig: any = {
	extract: { input: ['src'], ignore: [] },
};

vi.mock('../../../src/lib/patterns', () => ({
	expandGlobs: vi.fn(),
	toArray: (v: any) => Array.isArray(v) ? v : (v ? [v] : [])
}));

describe('cleanUnusedFiles', () => {
	beforeEach(() => {
		vi.resetAllMocks();

		vi.spyOn(process, 'cwd').mockReturnValue('/app');
		// Default Mocks Setup
		vi.mocked(extractNamespaces).mockResolvedValue([]); // No generated namespaces by default
		vi.mocked(expandGlobs).mockResolvedValue([]); // No source files by default
		vi.mocked(glob).mockResolvedValue([]); // No locale files by default

		// Mock fs.access to resolve (directory exists)
		vi.mocked(fs.access).mockResolvedValue(undefined);
	});

	afterEach(() => {
		vi.restoreAllMocks();
	});

	it('Should log error if locales directory does not exist', async () => {
		// Simulate missing directory via fs.access rejection
		vi.mocked(fs.access).mockRejectedValue(new Error('ENOENT'));

		await cleanUnusedFiles({
			config: mockConfig,
			dry: false,
			pruneEmpty: false,
			logger: mockLogger,
		});

		expect(mockLogger.error).toHaveBeenCalledWith(
			expect.stringContaining('Locales directory not found')
		);
		// Should verify it continues or returns (based on your implementation, it logs and continues/returns)
		// But definitely should NOT attempt deletion
		expect(fs.rm).not.toHaveBeenCalled();
	});

	it('Should delete unused files that are not found in code or generated namespaces', async () => {
		// 1. Mock Generated Namespaces (Empty)
		vi.mocked(extractNamespaces).mockResolvedValue([]);

		// 2. Mock Code Scanning (No files found)
		vi.mocked(expandGlobs).mockResolvedValue([]);

		// 3. Mock Existing Locale Files
		// We have one file 'unused.json' which is NOT in use
		// glob returns full paths usually
		vi.mocked(glob).mockResolvedValue(['/abs/path/locales/en/unused.json'] as any);

		// 4. Mock readFile (for isJsonEmpty check inside loop)
		vi.mocked(fs.readFile).mockResolvedValue('{"key": "value"}');

		// Run
		await cleanUnusedFiles({
			config: mockConfig,
			dry: false, // Actual deletion
			pruneEmpty: false,
			logger: mockLogger,
		});

		// Assert
		expect(fs.rm).toHaveBeenCalledWith(
			expect.stringContaining('unused.json'),
			{ force: true }
		);
		expect(mockLogger.info).toHaveBeenCalledWith(
			expect.stringContaining('Deleted files: 1')
		);
	});

	it('Should KEEP files that are used in code (via collectNamespacesFromCode)', async () => {
		// 1. Mock Source Code File
		vi.mocked(expandGlobs).mockResolvedValue(['/src/App.tsx']);

		// 2. Mock fs.readFile to return code with usage AND file content
		vi.mocked(fs.readFile).mockImplementation(async (p) => {
			if (p === '/src/App.tsx') return 'useTranslation("app.page")';
			if (p.toString().includes('app.page.json')) return '{"key":"val"}';
			return '';
		});

		// 3. Mock Existing Locale Files
		vi.mocked(glob).mockResolvedValue(['/abs/path/locales/en/app.page.json'] as any);

		// Run
		await cleanUnusedFiles({
			config: mockConfig,
			dry: false,
			pruneEmpty: false,
			logger: mockLogger,
		});

		// Assert
		expect(fs.rm).not.toHaveBeenCalled(); // Should NOT delete app.page.json
		expect(mockLogger.info).toHaveBeenCalledWith(
			expect.stringContaining('Nothing to delete')
		);
	});

	it('Should respect DRY RUN (log but do not delete)', async () => {
		vi.mocked(glob).mockResolvedValue(['/abs/path/locales/en/unused.json'] as any);
		vi.mocked(fs.readFile).mockResolvedValue('{"key": "val"}');

		await cleanUnusedFiles({
			config: mockConfig,
			dry: true, // ❗️ DRY RUN
			pruneEmpty: false,
			logger: mockLogger,
		});

		expect(mockLogger.info).toHaveBeenCalledWith(expect.stringContaining('DRY-RUN'));
		expect(fs.rm).not.toHaveBeenCalled(); // No actual deletion
	});

	it('Should prune EMPTY files if pruneEmpty is true', async () => {
		// 1. Namespace IS used (in generated namespaces)
		vi.mocked(extractNamespaces).mockResolvedValue(['used.ns']);

		// 2. File exists
		vi.mocked(glob).mockResolvedValue(['/abs/path/locales/en/used.ns.json'] as any);

		// 3. BUT file content is empty JSON {}
		vi.mocked(fs.readFile).mockImplementation(async () => '{}');

		await cleanUnusedFiles({
			config: mockConfig,
			dry: false,
			pruneEmpty: true, // ❗️ Prune Empty
			logger: mockLogger,
		});

		// Assert: Should delete because it is empty, even though it is used
		expect(fs.rm).toHaveBeenCalledWith(
			expect.stringContaining('used.ns.json'),
			{ force: true }
		);
	});

	it('Should clean up empty language directories', async () => {
		// Setup Glob to return one file initially
		vi.mocked(glob).mockResolvedValue(['/app/src/i18n/locales/en/unused.json'] as any);

		// Setup readFile to simulate unused file
		vi.mocked(fs.readFile).mockResolvedValue('{"a":"b"}');

		// ❗️ Critical: Mock readdir to simulate empty directory AFTER file deletion
		vi.mocked(fs.readdir).mockImplementation(async (p) => {
			// Normalize path separators just in case, though our path mock should handle it
			const pStr = p.toString().replace(/\\/g, '/');
			if (pStr.includes('/locales/en')) return [] as any;
			return [];
		});

		await cleanUnusedFiles({
			config: mockConfig,
			dry: false,
			pruneEmpty: false,
			logger: mockLogger,
		});

		// 1. File deleted
		expect(fs.rm).toHaveBeenCalled();

		// 2. Directory removed
		expect(fs.rmdir).toHaveBeenCalledWith(
			expect.stringContaining('/locales/en')
		);
	});
});