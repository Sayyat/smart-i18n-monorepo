import { describe, expect, it } from 'vitest';
import { ConsoleLogger, SmartI18nextPlugin } from '../../src';

const plugin = SmartI18nextPlugin(new ConsoleLogger(false));

describe('SmartI18nPlugin Logic', () => {
	it('Should add "ns" prop to Trans component if missing', async () => {
		const code = `<Trans i18nKey="hello">Hello</Trans>`;
		const result = await plugin.onLoad!(code, 'src/app/page.tsx');

		expect(result).toContain('<Trans ns="app.page" i18nKey="hello">');
	});

	it('Should update "ns" prop of Trans component with correct filename based namespace', async () => {
		const code = `<Trans i18nKey="hello" ns="wrong namespace">Hello</Trans>`;
		const result = await plugin.onLoad!(code, 'src/features/feature1/components/Feature1Component.tsx');

		expect(result).toContain('<Trans i18nKey="hello" ns="features.feature1.components.Feature1Component">');
	});
});