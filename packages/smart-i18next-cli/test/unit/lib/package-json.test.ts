import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import * as fsp from 'node:fs/promises';
import {
	getPackageJson,
	getPackageVersion,
	checkIsReactProject,
	checkIsReactMode
} from '../../../src/lib/package-json';
import { getPathFromConsumerRoot, getPathFromLibraryRoot } from '../../../src/lib/paths';

// 1. Mock external modules
vi.mock('node:fs/promises');
vi.mock('../../../src/lib/paths');

// 2. Mock Logger
const mockLogger = {
	info: vi.fn(),
	warn: vi.fn(),
	error: vi.fn(),
};

describe('Package JSON Utilities', () => {
	beforeEach(() => {
		vi.resetAllMocks();

		// Setup default path mocks
		(getPathFromConsumerRoot as any).mockImplementation((...args: string[]) => `/app/${args.join('/')}`);
		(getPathFromLibraryRoot as any).mockImplementation((...args: string[]) => `/lib/${args.join('/')}`);
	});

	afterEach(() => {
		vi.restoreAllMocks();
	});

	// -------------------------------------------------------------------------
	// Test: getPackageJson
	// -------------------------------------------------------------------------
	describe('getPackageJson', () => {
		it('Should return parsed JSON content if file exists', async () => {
			const mockContent = JSON.stringify({ name: 'test-pkg', version: '1.0.0' });
			vi.mocked(fsp.readFile).mockResolvedValue(mockContent);

			const result = await getPackageJson('/path/to/package.json');
			expect(result).toEqual({ name: 'test-pkg', version: '1.0.0' });
		});

		it('Should return empty object if file read fails (e.g., file not found)', async () => {
			vi.mocked(fsp.readFile).mockRejectedValue(new Error('ENOENT'));

			const result = await getPackageJson('/missing/package.json');
			expect(result).toEqual({});
		});

		it('Should return empty object if JSON is invalid', async () => {
			vi.mocked(fsp.readFile).mockResolvedValue('{ invalid json }');

			const result = await getPackageJson('/path/to/bad.json');
			expect(result).toEqual({});
		});
	});

	// -------------------------------------------------------------------------
	// Test: getPackageVersion
	// -------------------------------------------------------------------------
	describe('getPackageVersion', () => {
		it('Should return version from library package.json', async () => {
			vi.mocked(fsp.readFile).mockResolvedValue(JSON.stringify({ version: '1.2.3' }));

			const version = await getPackageVersion();

			expect(getPathFromLibraryRoot).toHaveBeenCalledWith('package.json');
			expect(version).toBe('1.2.3');
		});
	});

	// -------------------------------------------------------------------------
	// Test: checkIsReactProject
	// -------------------------------------------------------------------------
	describe('checkIsReactProject', () => {
		it('Should return true if "react" is in dependencies', async () => {
			vi.mocked(fsp.readFile).mockResolvedValue(JSON.stringify({
				dependencies: { 'react': '18.0.0' }
			}));

			const isReact = await checkIsReactProject();
			expect(isReact).toBe(true);
		});

		it('Should return true if "next" is in devDependencies', async () => {
			vi.mocked(fsp.readFile).mockResolvedValue(JSON.stringify({
				devDependencies: { 'next': '14.0.0' }
			}));

			const isReact = await checkIsReactProject();
			expect(isReact).toBe(true);
		});

		it('Should return false if neither react nor next are present', async () => {
			vi.mocked(fsp.readFile).mockResolvedValue(JSON.stringify({
				dependencies: { 'express': '4.0.0' }
			}));

			const isReact = await checkIsReactProject();
			expect(isReact).toBe(false);
		});

		it('Should return false if package.json is missing or empty', async () => {
			vi.mocked(fsp.readFile).mockRejectedValue(new Error('ENOENT'));

			const isReact = await checkIsReactProject();
			expect(isReact).toBe(false);
		});
	});

	// -------------------------------------------------------------------------
	// Test: checkIsReactMode
	// -------------------------------------------------------------------------
	describe('checkIsReactMode', () => {
		it('Should force React mode if --react option is true', async () => {
			const result = await checkIsReactMode({ react: true }, mockLogger);

			expect(result).toBe(true);
			expect(mockLogger.info).toHaveBeenCalledWith(expect.stringContaining('React mode forced'));
			// Should NOT check package.json
			expect(fsp.readFile).not.toHaveBeenCalled();
		});

		it('Should force Core mode if --core option is true', async () => {
			const result = await checkIsReactMode({ core: true }, mockLogger);

			expect(result).toBe(false);
			expect(mockLogger.info).toHaveBeenCalledWith(expect.stringContaining('Core mode forced'));
			// Should NOT check package.json
			expect(fsp.readFile).not.toHaveBeenCalled();
		});

		it('Should Auto-Detect React project if no flags are provided', async () => {
			// Mock package.json containing react
			vi.mocked(fsp.readFile).mockResolvedValue(JSON.stringify({ dependencies: { react: '18' } }));

			const result = await checkIsReactMode({}, mockLogger);

			expect(result).toBe(true);
			expect(mockLogger.info).toHaveBeenCalledWith(expect.stringContaining('Analyzing package.json'));
			expect(mockLogger.info).toHaveBeenCalledWith(expect.stringContaining('React/Next.js project detected'));
		});

		it('Should Auto-Detect Core project if no flags and no react found', async () => {
			// Mock package.json WITHOUT react
			vi.mocked(fsp.readFile).mockResolvedValue(JSON.stringify({ dependencies: { vue: '3' } }));

			const result = await checkIsReactMode({}, mockLogger);

			expect(result).toBe(false);
			expect(mockLogger.info).toHaveBeenCalledWith(expect.stringContaining('Analyzing package.json'));
			expect(mockLogger.info).toHaveBeenCalledWith(expect.stringContaining('No React/Next.js detected'));
		});
	});
});