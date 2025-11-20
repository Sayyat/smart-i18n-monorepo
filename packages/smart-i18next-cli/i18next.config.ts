import { defineConfig } from 'i18next-cli';
import { SmartI18nPlugin } from './src';

export default defineConfig({
	locales: [
		"kk",
		"ru",
		"en",
	],
	extract: {
		input: ["src/**/*.{js,jsx,ts,tsx,vue,svelte}"],
		ignore: "src/i18n/**/*.{js,jsx,ts,tsx}",
		output: "src/i18n/locales/{{language}}/{{namespace}}.json",
		primaryLanguage: "en",
		nsSeparator: false,
		keySeparator: false,
		removeUnusedKeys: true,
		sort: true,
		defaultValue: (key,namespace, language, value ) => {
			return value || key;
		},
	},
	plugins: [
		SmartI18nPlugin()
	]
});