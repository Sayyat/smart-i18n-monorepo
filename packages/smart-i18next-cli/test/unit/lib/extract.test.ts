import { beforeEach, describe, expect, it, vi } from 'vitest';
import { mergeTranslations } from '../../../src/lib/extract'; // Adjust path if necessary
import { type I18nextToolkitConfig } from 'i18next-cli';

// 1. Mock Logger
const mockLogger = {
	info: vi.fn(),
	warn: vi.fn(),
	error: vi.fn(),
};

// 2. Helper to create minimal config
const createConfig = (removeUnusedKeys: boolean): I18nextToolkitConfig => ({
	locales: ['en'],
	extract: {
		input: [],
		output: '',
		removeUnusedKeys
	},
} as unknown as I18nextToolkitConfig);

describe('mergeTranslations', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it('Should ADD new keys and set value equal to key (key: key logic)', () => {
		const config = createConfig(true);
		const existing = {};
		// i18next-cli extracts keys with empty values by default
		const newTranslations = {
			"Hello World": "",
			"Submit": ""
		};

		const result = mergeTranslations({
			config,
			existing,
			newTranslations,
			logger: mockLogger
		});

		// Expect keys to be populated with their own names
		expect(result).toEqual({
			"Hello World": "Hello World",
			"Submit": "Submit"
		});
	});

	it('Should PRESERVE existing translations (do not overwrite with key name)', () => {
		const config = createConfig(true);
		const existing = {
			"Hello": "Cześć", // Existing translation
		};
		const newTranslations = {
			"Hello": "", // Scanner found it again
			"New": ""
		};

		const result = mergeTranslations({
			config,
			existing,
			newTranslations,
			logger: mockLogger
		});

		expect(result).toEqual({
			"Hello": "Cześć", // Should NOT be "Hello"
			"New": "New"      // Should be "New"
		});
	});

	it('Should REMOVE unused keys when removeUnusedKeys is TRUE', () => {
		const config = createConfig(true);
		const existing = {
			"Used Key": "Used Translation",
			"Old Key": "Old Translation" // Not in newTranslations
		};
		const newTranslations = {
			"Used Key": ""
		};

		const result = mergeTranslations({
			config,
			existing,
			newTranslations,
			logger: mockLogger
		});

		// "Old Key" should be gone
		expect(result).toEqual({
			"Used Key": "Used Translation"
		});

		// Check Logger
		expect(mockLogger.info).toHaveBeenCalledWith(
			expect.stringContaining("Removed unused key")
		);
	});

	it('Should KEEP unused keys when removeUnusedKeys is FALSE', () => {
		const config = createConfig(false); // <--- FALSE
		const existing = {
			"Used Key": "Used Translation",
			"Old Key": "Old Translation"
		};
		const newTranslations = {
			"Used Key": ""
		};

		const result = mergeTranslations({
			config,
			existing,
			newTranslations,
			logger: mockLogger
		});

		// "Old Key" should remain
		expect(result).toEqual({
			"Used Key": "Used Translation",
			"Old Key": "Old Translation"
		});

		// Check Logger
		expect(mockLogger.info).toHaveBeenCalledWith(
			expect.stringContaining("Keeping unused key")
		);
	});

	it('Should handle complex mix of adding, keeping, and removing', () => {
		const config = createConfig(true);
		const existing = {
			"Kept": "Kept Trans",
			"Removed": "Bye Bye"
		};
		const newTranslations = {
			"Kept": "",
			"New": ""
		};

		const result = mergeTranslations({
			config,
			existing,
			newTranslations,
			logger: mockLogger
		});

		expect(result).toEqual({
			"Kept": "Kept Trans", // Preserved value
			"New": "New"          // Added with key=value
		});
		// "Removed" is gone
		expect(result).not.toHaveProperty("Removed");
	});
});