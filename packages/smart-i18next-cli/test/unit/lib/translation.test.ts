import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { translate } from '../../../src/lib/translation';
import * as fs from 'node:fs/promises';
import fetch from 'node-fetch';
import { I18nextToolkitConfig } from 'i18next-cli';
// --- 1. MOCKS SETUP ---

// Mock 'node:fs/promises'
vi.mock('node:fs/promises', () => ({
	default: {
		readdir: vi.fn(),
		readFile: vi.fn(),
		writeFile: vi.fn(),
		access: vi.fn(),
		mkdir: vi.fn(),
	},
	readdir: vi.fn(),
	readFile: vi.fn(),
	writeFile: vi.fn(),
	access: vi.fn(),
	mkdir: vi.fn(),
}));

// Mock 'node-fetch'
vi.mock('node-fetch', () => ({
	default: vi.fn()
}));

// Mock 'paths' module
vi.mock('../../../src/lib/paths', () => ({
	// Force paths to be predictable and POSIX-style
	getPathFromConsumerRoot: vi.fn((...args) => `/app/${args.join('/')}`),
}));

// Mock 'node:path' to behave like POSIX (Linux/Mac) everywhere
vi.mock('node:path', async () => {
	const actual = await vi.importActual('node:path');
	return {...actual, ...require('node:path').posix};
});

// Mock Logger
const mockLogger = {
	info: vi.fn(),
	warn: vi.fn(),
	error: vi.fn(),
};

// Helper to create a mock config
const mockConfig: I18nextToolkitConfig = {
	locales: ['en', 'ru', 'kk'],
	extract: {
		primaryLanguage: 'en',
		input: [],
		output: '' // In your logic, this isn't used directly for path resolution anymore
	}
} as any;

// Helper to create a successful API response
const createMockResponse = (translatedText: string) => ({
	ok: true,
	json: async () => ({
		data: {
			translations: [
				{translatedText: translatedText}
			]
		}
	})
});

describe('Translation Utility', () => {
	// Save original env to restore later
	const originalEnv = process.env;

	beforeEach(() => {
		vi.resetAllMocks();
		process.env = {...originalEnv, RAPIDAPI_KEY: 'test-key'}; // Set dummy key

		// Default FS Mocks
		vi.mocked(fs.access).mockResolvedValue(undefined); // Success by default
		vi.mocked(fs.readFile).mockResolvedValue('{}'); // Empty JSON by default

		// Critical: readdir must return files when asked for the 'en' or 'kk' folder
		vi.mocked(fs.readdir).mockImplementation(async (p) => {
			const pathStr = p.toString();
			// Check if the path ends with a known locale folder
			if (pathStr.endsWith('/locales/en') || pathStr.endsWith('/locales/kk')) {
				return ['common.json'] as any;
			}
			return [] as any;
		});
	});

	afterEach(() => {
		process.env = originalEnv;
		vi.restoreAllMocks();
	});

	// -------------------------------------------------------------------------
	// Test: Configuration & Validation
	// -------------------------------------------------------------------------

	it('Should exit early and log error if requested language is invalid', async () => {
		await translate(mockConfig, 'fr', mockLogger); // 'fr' is not in locales

		expect(mockLogger.error).toHaveBeenCalledWith(
			expect.stringContaining('Invalid language')
		);
		expect(fs.readdir).not.toHaveBeenCalled();
	});

	it('Should skip translation if RAPIDAPI_KEY is missing', async () => {
		delete process.env.RAPIDAPI_KEY;

		// Setup FS to find one file with one candidate key
		vi.mocked(fs.readdir).mockResolvedValue(['common.json'] as any);
		vi.mocked(fs.readFile).mockResolvedValue(JSON.stringify({"Key": "Key"}));

		await translate(mockConfig, 'kk', mockLogger);

		// Should log warning
		expect(mockLogger.warn).toHaveBeenCalledWith(
			expect.stringContaining('RAPIDAPI_KEY')
		);
		// Should NOT call fetch
		expect(fetch).not.toHaveBeenCalled();

		// Should still write the file (with original text preserved)
		expect(fs.writeFile).toHaveBeenCalledWith(
			expect.stringContaining('common.json'),
			expect.stringContaining('"Key": "Key"'), // Unchanged
			'utf8'
		);
	});

	// -------------------------------------------------------------------------
	// Test: Translation Logic (Killer Feature)
	// -------------------------------------------------------------------------
	//
	it('Should translate keys where value === key', async () => {
		// 1. Setup FS Mocks
		vi.mocked(fs.readdir).mockResolvedValue(['data.json'] as any);
		vi.mocked(fs.readFile).mockImplementation(async (path) => {
			return JSON.stringify({"Hello": "Hello", "Bye": "Сау бол"});
		});

		// 2. FIXED FETCH MOCK
		// matches interface: result.data.translations.translatedText[0]
		vi.mocked(fetch).mockResolvedValue({
			ok: true,
			json: async () => ({
				data: {
					translations: {
						translatedText: ["Сәлем"]
					}
				}
			})
		} as any);

		// 3. Run the function
		await translate(mockConfig, 'kk', mockLogger);

		// 4. Assertions for SUCCESS

		// Verify API was called
		expect(fetch).toHaveBeenCalledTimes(1);

		// Verify NO errors occurred
		expect(mockLogger.error).not.toHaveBeenCalled();

		// Verify successful log
		expect(mockLogger.info).toHaveBeenCalledWith(
			expect.stringContaining("✅ Translations successfully generated!")
		);

		// Verify the file was written with the translation
		expect(fs.writeFile).toHaveBeenCalledWith(
			expect.stringContaining('data.json'), // Ensure path matches
			expect.stringContaining('"Hello": "Сәлем"'), // Ensure translation is applied
			'utf8'
		);
	});

	it('Should NOT translate numeric-only strings', async () => {
		vi.mocked(fs.readdir).mockResolvedValue(['data.json'] as any);
		vi.mocked(fs.readFile).mockResolvedValue(JSON.stringify({
			"123": "123",
			" 456 ": " 456 " // trimmed check
		}));

		await translate(mockConfig, 'kk', mockLogger);

		expect(fetch).not.toHaveBeenCalled(); // Should skip numbers
		// File should be written with originals
		expect(fs.writeFile).toHaveBeenCalled();
	});

	// -------------------------------------------------------------------------
	// Test: Caching
	// -------------------------------------------------------------------------

	it('Should cache translations to avoid duplicate API calls for same text', async () => {
		// Simulate two files having the same untranslated key
		vi.mocked(fs.readdir).mockResolvedValue(['page1.json', 'page2.json'] as any);

		vi.mocked(fs.readFile).mockResolvedValue(JSON.stringify({
			"Welcome": "Welcome",
		}));

		// Mock ONE successful response
		vi.mocked(fetch).mockResolvedValue({
			ok: true,
			json: async () => ({
				data: {
					translations: {
						translatedText: ["Қош келдіңіз"]
					}
				}
			})
		} as any);

		await translate(mockConfig, 'kk', mockLogger);

		// Should call API only ONCE, even though key appears in 2 files
		expect(fetch).toHaveBeenCalledTimes(1);

		// Both files should be written with the translated value
		expect(fs.writeFile).toHaveBeenCalledTimes(2);
		expect(fs.writeFile).toHaveBeenNthCalledWith(1, expect.anything(), expect.stringContaining("Қош келдіңіз"), expect.anything());
		expect(fs.writeFile).toHaveBeenNthCalledWith(2, expect.anything(), expect.stringContaining("Қош келдіңіз"), expect.anything());
	});

	// -------------------------------------------------------------------------
	// Test: Error Handling
	// -------------------------------------------------------------------------
	//
	it('Should handle API errors gracefully (keep original text)', async () => {
		vi.mocked(fs.readdir).mockResolvedValue(['error.json'] as any);
		vi.mocked(fs.readFile).mockResolvedValue(JSON.stringify({"Fail": "Fail"}));

		// Mock API Failure (500 error)
		vi.mocked(fetch).mockResolvedValue({
			ok: false,
			status: 500,
			statusText: 'Server Error',
			text: async () => 'Bad Gateway'
		} as any);

		await translate(mockConfig, 'kk', mockLogger);

		// Should log error
		expect(mockLogger.error).toHaveBeenCalledWith(
			expect.stringContaining('DeepL API error')
		);

		// Should log error
		expect(mockLogger.error).toHaveBeenCalledWith(
			expect.stringContaining('❌ Failed to generate translations')
		);
	});
});