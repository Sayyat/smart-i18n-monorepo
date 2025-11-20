import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { generateTypes } from '../../../src/lib/type-generator'; // Adjust path as needed
import * as fs from 'node:fs/promises';
import * as path from 'node:path';
import { type I18nextToolkitConfig } from 'i18next-cli';

// --- MOCKS ---

// 1. Mock FS
vi.mock('node:fs/promises', () => ({
	default: {
		access: vi.fn(),
		readdir: vi.fn(),
		readFile: vi.fn(),
		writeFile: vi.fn(),
		mkdir: vi.fn(),
	},
	access: vi.fn(),
	readdir: vi.fn(),
	readFile: vi.fn(),
	writeFile: vi.fn(),
	mkdir: vi.fn(),
}));

// 2. Mock path helper to return predictable, OS-agnostic paths
vi.mock('../../../src/lib/paths', () => ({
	getPathFromConsumerRoot: vi.fn((...parts) => parts.join('/')),
}));

// 3. Mock Constants (Optional, but ensures stability if constants change)
vi.mock('../../../src/lib/constants', () => ({
	AUTOGENERATION_COMMENT: '// Auto-generated',
	GENERATED_LOCALES_PATH: 'locales',
	GENERATED_TYPES_PATH: 'types.ts'
}));

describe('Type Generator', () => {
	const mockLogger = {
		info: vi.fn(),
		error: vi.fn(),
		warn: vi.fn(),
	};

	const mockConfig: I18nextToolkitConfig = {
		locales: ['en', 'fr'],
		extract: {
			primaryLanguage: 'en',
			input: [],
			output: ''
		}
	} as any;

	beforeEach(() => {
		vi.resetAllMocks();
	});

	afterEach(() => {
		vi.restoreAllMocks();
	});

	it('Should fail gracefully and log error if template directory does not exist', async () => {
		// Simulate folder missing
		vi.mocked(fs.access).mockRejectedValue(new Error('ENOENT'));

		await generateTypes(mockConfig, mockLogger);

		expect(mockLogger.error).toHaveBeenCalledWith(expect.stringContaining('Template folder not found'));
		expect(fs.readdir).not.toHaveBeenCalled();
		expect(fs.writeFile).not.toHaveBeenCalled();
	});

	it('Should generate correct types for flat and nested JSON files', async () => {
		// 1. Setup: Folder exists
		vi.mocked(fs.access).mockResolvedValue(undefined);

		// 2. Setup: Files found in folder
		vi.mocked(fs.readdir).mockResolvedValue(['common.json', 'auth.json', 'ignore.txt'] as any);

		// 3. Setup: File Content (Mocking specific returns based on filename)
		vi.mocked(fs.readFile).mockImplementation(async (filepath) => {
			const p = filepath.toString();
			if (p.includes('common.json')) {
				// Flat structure
				return JSON.stringify({ "save": "Save", "cancel": "Cancel" });
			}
			if (p.includes('auth.json')) {
				// Nested structure (Tests flattenKeys logic)
				return JSON.stringify({
					"login": {
						"title": "Login",
						"form": {
							"email": "Email Address"
						}
					},
					"logout": "Logout"
				});
			}
			return '{}';
		});

		await generateTypes(mockConfig, mockLogger);

		// Assertions
		expect(fs.mkdir).toHaveBeenCalled(); // Should ensure dir exists
		expect(fs.writeFile).toHaveBeenCalledTimes(1);

		const writeCallArgs = vi.mocked(fs.writeFile).mock.calls[0];
		const fileContent = writeCallArgs[1] as string;

		// Check Namespace Type
		expect(fileContent).toContain('export type TNamespace =');
		expect(fileContent).toContain('| "common"');
		expect(fileContent).toContain('| "auth"');

		// Check Namespace Keys (Nested Logic)
		// auth.login.title should exist
		expect(fileContent).toContain('| "login.title"');
		expect(fileContent).toContain('| "login.form.email"');
		expect(fileContent).toContain('| "logout"');

		// Check Global Keys
		expect(fileContent).toContain('export type TAllTranslationKeys =');
		expect(fileContent).toContain('| "auth.login.form.email"');
		expect(fileContent).toContain('| "common.save"');

		// Ensure non-json files were ignored
		expect(fileContent).not.toContain('ignore');
	});

	it('Should handle empty directories by generating "never" types', async () => {
		vi.mocked(fs.access).mockResolvedValue(undefined);
		// Empty folder
		vi.mocked(fs.readdir).mockResolvedValue([] as any);

		await generateTypes(mockConfig, mockLogger);

		const writeCallArgs = vi.mocked(fs.writeFile).mock.calls[0];
		const fileContent = writeCallArgs[1] as string;

		// Expect 'never' type when no namespaces exist
		expect(fileContent).toMatch('export type TNamespace =\n never');
	});

	it('Should handle empty JSON files by generating "never" for that namespace', async () => {
		vi.mocked(fs.access).mockResolvedValue(undefined);
		vi.mocked(fs.readdir).mockResolvedValue(['empty.json'] as any);
		vi.mocked(fs.readFile).mockResolvedValue('{}');

		await generateTypes(mockConfig, mockLogger);

		const writeCallArgs = vi.mocked(fs.writeFile).mock.calls[0];
		const fileContent = writeCallArgs[1] as string;

		// Namespace exists...
		expect(fileContent).toContain('| "empty"');

		// ...but has no keys
		expect(fileContent).toContain('"empty": never;');
	});

	it('Should fallback to first locale if extract.primaryLanguage is missing', async () => {
		const configNoPrimary = {
			locales: ['de', 'en'],
			extract: {}
		} as any;

		vi.mocked(fs.access).mockResolvedValue(undefined);
		vi.mocked(fs.readdir).mockResolvedValue([] as any);

		await generateTypes(configNoPrimary, mockLogger);

		// Should look for 'de' folder because it's the first locale
		// The path mock joins args with '/', so we look for 'locales/de'
		expect(fs.access).toHaveBeenCalledWith(expect.stringContaining('locales/de'));
	});
});