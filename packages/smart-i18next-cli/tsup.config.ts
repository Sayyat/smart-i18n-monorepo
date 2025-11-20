// packages/smart-i18next-cli/tsup.config.ts
import { defineConfig } from "tsup";

export default defineConfig({
	entry: ["src/cli.ts", "src/index.ts"],

	format: ["cjs", "esm"],

	shims: true,

	dts: true,
	splitting: true,
	sourcemap: true,
	clean: true,
	external: [
		"chalk",
		"commander",
		"dotenv",
		"glob",
		"jiti",
		"minimatch",
		"node-fetch",
		"i18next",
		"i18next-cli",
	],
});