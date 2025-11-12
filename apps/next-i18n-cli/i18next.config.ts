import { defineConfig } from 'i18next-cli';

export default defineConfig({
  locales: [
    "kk",
    "ru",
    "en",
  ],
  extract: {
    input: "src/**/*.{js,jsx,ts,tsx}",
    output: "src/i18n/locales/{{language}}/{{namespace}}.json",
    primaryLanguage: "en",
    defaultNS: "translation",
    nsSeparator: false,
    keySeparator: false,
    removeUnusedKeys: true,
  },
  types: {
    input: "src/i18n/locales/{{language}}/{{namespace}}.json",
    output: "src/i18n/types/{{language}}/{{namespace}}.ts"
  },
  plugins: [
    
  ]
});