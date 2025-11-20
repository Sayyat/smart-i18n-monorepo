import { defineConfig } from 'i18next-cli';
import { SmartI18nPlugin } from './src';

export default defineConfig({
	locales: [
		"kk",
		"ru",
		"en",
	],
	extract: {
		input: "src/**/*.{js,jsx,ts,tsx}",
		ignore: "src/i18n/**/*.{js,jsx,ts,tsx}",
		output: "src/i18n/locales/{{language}}/{{namespace}}.json",
		primaryLanguage: "en",
		nsSeparator: false,
		keySeparator: false,
		removeUnusedKeys: true,
		defaultValue: (key,namespace, language, value ) => {
			console.log({key,namespace, language, value})
			return key;
		},
		sort: true,
	},
	types: {
		input: "src/i18n/locales/{{language}}/{{namespace}}.json",
		output: "src/i18n/types/{{language}}/{{namespace}}.ts"
	},
	plugins: [
		SmartI18nPlugin()
	]
});