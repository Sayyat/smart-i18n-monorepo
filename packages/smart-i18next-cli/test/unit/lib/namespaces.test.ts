import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { extractNamespaces, generateNamespaces, normalizeNamespacePath } from '../../../src/lib/namespaces';
import * as fs from 'node:fs/promises';
import { expandGlobs } from '../../../src/lib/patterns';
import { getPathFromConsumerRoot, getPathFromLibraryRoot } from '../../../src/lib/paths';

// Mock fs
vi.mock('node:fs/promises');
// Mock paths lib
vi.mock('../../../src/lib/paths');

vi.mock('../../../src/lib/patterns', () => ({
	expandGlobs: vi.fn(),
	toArray: (v: any) => Array.isArray(v) ? v : (v ? [v] : [])
}));
// Mock 'path' to ensure POSIX behavior (forward slashes) regardless of OS
vi.mock('node:path', async () => {
	const actual = await vi.importActual('node:path');
	return { ...actual, ...require('node:path').posix };
});

// Mock Logger
const mockLogger = {
	info: vi.fn(),
	warn: vi.fn(),
	error: vi.fn(),
};

// Sample Config
const mockConfig: any = {
	extract: {
		input: ['src/**/*.{ts,tsx}'],
		ignore: ['**/*.test.ts']
	}
};

describe('Namespaces Utilities', () => {
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
	// Test: normalizeNamespacePath
	// -------------------------------------------------------------------------
	describe('normalizeNamespacePath', () => {
		it('Should convert file path to dot-notation namespace', () => {
			// SRC_PATH is mocked to '/app/src'
			const filePath = '/app/src/features/auth/Login.tsx';
			const ns = normalizeNamespacePath(filePath);
			expect(ns).toBe('features.auth.Login');
		});

		it('Should handle root level files', () => {
			const filePath = '/app/src/page.tsx';
			const ns = normalizeNamespacePath(filePath);
			expect(ns).toBe('page');
		});

		it('Should remove various extensions (.ts, .js, etc)', () => {
			expect(normalizeNamespacePath('/app/src/util.ts')).toBe('util');
			expect(normalizeNamespacePath('/app/src/util.js')).toBe('util');
			expect(normalizeNamespacePath('/app/src/util.jsx')).toBe('util');
		});
	});

	// -------------------------------------------------------------------------
	// Test: extractNamespaces
	// -------------------------------------------------------------------------
	describe('extractNamespaces', () => {
		it('Should create a new file if it does not exist', async () => {
			// Mock fs.access to fail (file missing)
			vi.mocked(fs.access).mockRejectedValue(new Error('ENOENT'));

			const result = await extractNamespaces(mockLogger);

			// Should create directory and write default content
			expect(fs.mkdir).toHaveBeenCalled();
			expect(fs.writeFile).toHaveBeenCalledWith(
				expect.stringContaining('namespaces.ts'),
				expect.stringContaining('AUTO-GENERATED'),
				'utf8'
			);
			// Should return empty array
			expect(result).toEqual([]);
		});

		it('Should parse existing namespaces from file content', async () => {
			vi.mocked(fs.access).mockResolvedValue(undefined);

			const mockContent = `
        /* comment */
        export const NAMESPACES = [
          "app.page",
          "features.login"
        ] as const;
      `;
			vi.mocked(fs.readFile).mockResolvedValue(mockContent);

			const result = await extractNamespaces(mockLogger);

			expect(result).toEqual(['app.page', 'features.login']);
		});

		it('Should return empty array if regex does not match', async () => {
			vi.mocked(fs.access).mockResolvedValue(undefined);
			vi.mocked(fs.readFile).mockResolvedValue('invalid content');

			const result = await extractNamespaces(mockLogger);

			expect(mockLogger.warn).toHaveBeenCalled();
			expect(result).toEqual([]);
		});

		it('Should throw error if JSON parsing fails', async () => {
			vi.mocked(fs.access).mockResolvedValue(undefined);

			const mockContent = `export const NAMESPACES = [ invalid_token ] as const;`;

			vi.mocked(fs.readFile).mockResolvedValue(mockContent);

			await expect(extractNamespaces(mockLogger)).rejects.toThrow();
			expect(mockLogger.error).toHaveBeenCalled();
		});
	});

	// -------------------------------------------------------------------------
	// Test: generateNamespaces
	// -------------------------------------------------------------------------
	describe('generateNamespaces', () => {
		it('Should scan files, filter ignored, and write sorted namespaces', async () => {
			// 1. Mock file discovery
			const foundFiles = [
				'/app/src/features/B.tsx', // Should become features.B
				'/app/src/features/A.tsx', // Should become features.A (sorted first)
				'/app/src/ignored.test.ts' // Should be ignored
			];
			vi.mocked(expandGlobs).mockResolvedValue(foundFiles as any);

			// 3. Run
			await generateNamespaces(mockConfig, mockLogger);

			// 4. Verify filtering (minimatch logic inside function)
			// 'ignored.test.ts' should be filtered out based on mockConfig.extract.ignore

			// 5. Verify file writing
			const writeCall = vi.mocked(fs.writeFile).mock.calls[0];
			const content = writeCall[1] as string;

			expect(content).toContain('export const NAMESPACES = [');
			// Check sorting and format
			expect(content).toContain('"features.A",');
			expect(content).toContain('"features.B"');
			// Check ignored file is NOT present
			expect(content).not.toContain('ignored');

			expect(mockLogger.info).toHaveBeenCalledWith(expect.stringContaining('Generated'));
		});

		it('Should handle empty file list', async () => {
			vi.mocked(expandGlobs).mockResolvedValue([]);

			await generateNamespaces(mockConfig, mockLogger);

			const content = vi.mocked(fs.writeFile).mock.calls[0][1] as string;
			expect(content).toContain('export const NAMESPACES = [\n\n] as const;');
		});
	});
});