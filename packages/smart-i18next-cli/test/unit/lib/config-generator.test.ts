import { describe, it, expect, vi, beforeEach } from 'vitest';
import { generateConfigs } from '../../../src/lib/config-generator';
import * as fs from 'node:fs/promises';
import { getPathFromConsumerRoot } from '../../../src/lib/paths';

// 1. Mock external modules
vi.mock('node:fs/promises');
vi.mock('../../../src/lib/paths');

// Mock Logger
const mockLogger = {
	info: vi.fn(),
	warn: vi.fn(),
	error: vi.fn(),
};

// Sample Config Data
const mockConfig: any = {
	locales: ['en', 'kk'],
	extract: {
		primaryLanguage: 'en',
		defaultNS: 'common',
	},
};

describe('generateConfigs', () => {
	beforeEach(() => {
		vi.resetAllMocks();
		// Mock the function that returns the path
		(getPathFromConsumerRoot as any).mockReturnValue('/mock/root/src/i18n/generated/config.ts');
	});

	it('Should generate correct content for CORE mode (no cookie)', async () => {
		// Mock fs.access to reject (simulate file not found) to test folder creation logic
		vi.mocked(fs.access).mockRejectedValue(new Error('ENOENT'));

		await generateConfigs(mockConfig, false, mockLogger);

		// 1. Was the folder created?
		expect(fs.mkdir).toHaveBeenCalled();

		// 2. Was the file written?
		expect(fs.writeFile).toHaveBeenCalled();

		// 3. Is the content correct?
		const callArgs = vi.mocked(fs.writeFile).mock.calls[0];
		const filePath = callArgs[0];
		const content = callArgs[1] as string;

		expect(filePath).toBe('/mock/root/src/i18n/generated/config.ts');

		// In CORE mode, COOKIE_NAME should not be present
		expect(content).not.toContain('export const COOKIE_NAME');
		expect(content).toContain('export const languages = ["en","kk"]');
		expect(content).toContain('export const FALLBACK_LANGUAGE: TLanguage = "en"');
	});

	it('Should generate correct content for REACT mode (with cookie)', async () => {
		vi.mocked(fs.access).mockResolvedValue(undefined); // Folder exists

		await generateConfigs(mockConfig, true, mockLogger);

		const content = vi.mocked(fs.writeFile).mock.calls[0][1] as string;

		// In REACT mode, COOKIE_NAME should be present
		// (It gets the COOKIE_NAME constant value from 'constants.ts', e.g., 'NEXT_LANGUAGE')
		expect(content).toContain('export const COOKIE_NAME = "');
	});

	it('Should handle empty config correctly', async () => {
		vi.mocked(fs.access).mockResolvedValue(undefined);

		// Pass an empty config
		await generateConfigs({} as any, false, mockLogger);

		const content = vi.mocked(fs.writeFile).mock.calls[0][1] as string;

		// Should generate with empty arrays without errors
		expect(content).toContain('export const languages = []');
	});
});