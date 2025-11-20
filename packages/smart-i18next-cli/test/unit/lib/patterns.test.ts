import { describe, it, expect, vi, beforeEach } from 'vitest';
import { toArray, deriveOutputIgnore, expandGlobs } from '../../../src/lib/patterns';
import { glob } from 'glob';

// 1. Mock 'glob' module to avoid actual file system access
vi.mock('glob');

describe('Patterns Utilities', () => {
	beforeEach(() => {
		vi.resetAllMocks();
	});

	// -------------------------------------------------------------------------
	// Test: toArray
	// -------------------------------------------------------------------------
	describe('toArray', () => {
		it('Should return the array as-is if input is already an array', () => {
			const input = ['a', 'b'];
			const result = toArray(input);
			expect(result).toBe(input); // Should allow strict equality
			expect(result).toEqual(['a', 'b']);
		});

		it('Should wrap a single value into an array', () => {
			const input = 'string';
			const result = toArray(input);
			expect(result).toEqual(['string']);
		});

		it('Should return an empty array if input is null or undefined', () => {
			expect(toArray(null)).toEqual([]);
			expect(toArray(undefined)).toEqual([]);
		});
	});

	// -------------------------------------------------------------------------
	// Test: deriveOutputIgnore
	// -------------------------------------------------------------------------
	describe('deriveOutputIgnore', () => {
		it('Should replace {{placeholders}} with * glob wildcards', () => {
			const outputTemplate = 'src/locales/{{lng}}/{{ns}}.json';
			const result = deriveOutputIgnore(outputTemplate);

			// {{lng}} -> * and {{ns}} -> *
			expect(result).toEqual(['src/locales/*/*.json']);
		});

		it('Should return empty array if output is undefined', () => {
			expect(deriveOutputIgnore(undefined)).toEqual([]);
		});

		it('Should return empty array if output is a function', () => {
			// i18next-cli config allows functions for output path
			const outputFn = (lng: string, ns: string) => `path/${lng}/${ns}.json`;
			// @ts-ignore - testing runtime check
			expect(deriveOutputIgnore(outputFn)).toEqual([]);
		});
	});

	// -------------------------------------------------------------------------
	// Test: expandGlobs
	// -------------------------------------------------------------------------
	describe('expandGlobs', () => {
		it('Should expand a single glob pattern', async () => {
			const mockFiles = ['file1.ts', 'file2.ts'];
			// Mock glob implementation to return specific files
			vi.mocked(glob).mockResolvedValue(mockFiles as any);

			const result = await expandGlobs('src/*.ts');

			expect(glob).toHaveBeenCalledWith('src/*.ts', { nodir: true });
			expect(result).toEqual(mockFiles);
		});

		it('Should handle an array of patterns', async () => {
			// Mock glob to verify it's called for each pattern
			vi.mocked(glob).mockResolvedValue(['file.ts'] as any);

			await expandGlobs(['src/*.ts', 'lib/*.ts']);

			expect(glob).toHaveBeenCalledTimes(2);
		});

		it('Should remove duplicate files from the result', async () => {
			// Simulate two patterns returning overlapping files
			vi.mocked(glob)
			.mockResolvedValueOnce(['common.ts', 'a.ts'] as any) // First call
			.mockResolvedValueOnce(['common.ts', 'b.ts'] as any); // Second call

			const result = await expandGlobs(['pattern1', 'pattern2']);

			// 'common.ts' should only appear once
			expect(result).toHaveLength(3);
			expect(result).toEqual(expect.arrayContaining(['common.ts', 'a.ts', 'b.ts']));
		});

		it('Should handle empty input and return empty array', async () => {
			const result = await expandGlobs([]);
			expect(result).toEqual([]);
			expect(glob).not.toHaveBeenCalled();
		});
	});
});