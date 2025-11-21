import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import * as path from 'path';
import * as fs from 'fs/promises';
import { execa } from 'execa';

const TEST_DIR = path.join(__dirname, 'fixtures', 'temp-playground');
const FIXTURES_DIR = path.join(__dirname, 'fixtures', 'example-app');
const CLI_BIN = path.resolve(__dirname, '../dist/cli.mjs');

async function runCLI(args: string[]) {
	console.log(`👉 Running command: smart-i18next-cli ${args.join(' ')}`);

	const result = await execa('node', [CLI_BIN, ...args, '--config', 'i18next.config.ts'], {
		cwd: TEST_DIR,
		env: {
			FORCE_COLOR: '1',
			CI: 'true'
		},
	});

	console.log(result.stdout);
	return result;
}

async function readJson(subPath: string) {
	try {
		const content = await fs.readFile(path.join(TEST_DIR, subPath), 'utf8');
		return JSON.parse(content);
	} catch {
		return null;
	}
}

describe('smart-i18next-cli Integration Tests', () => {

	beforeAll(async () => {
		await fs.rm(TEST_DIR, {recursive: true, force: true});

		await fs.cp(FIXTURES_DIR, TEST_DIR, {recursive: true});
	});

	afterAll(async () => {
		await fs.rm(TEST_DIR, {recursive: true, force: true});
	});

	it('Should run full extraction pipeline correctly', async () => {
		await runCLI(['generate-namespaces']);
		await runCLI(['extract']);


		// Feature 1: 1-to-1 Namespace
		const profileJson = await readJson('src/i18n/locales/en/features.profile.UserProfile.json');
		expect(profileJson['Profile Page Title']).toBe('Profile Page Title');

		// Feature 2: TFunction
		const validationJson = await readJson('src/i18n/locales/en/shared.utils.validation.json');
		expect(validationJson['Validation Error']).toBe('Validation Error');

		// Feature 3: <Trans>
		const transJson = await readJson('src/i18n/locales/en/features.profile.TransExample.json');
		expect(transJson['Hello Trans']).toBe('Hello');

		// Feature 4: Reuse
		const loginJson = await readJson('src/i18n/locales/en/features.auth.Login.json');
		expect(loginJson['Submit Button']).toBe('Submit Button');
	});
});