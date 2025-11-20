# @sayyyat/smart-i18next-cli

[@sayyyat/smart-i18next-cli](https://www.npmjs.com/package/%40sayyyat/smart-i18next-cli)

[LICENSE](./LICENSE)

> **The "Smart" Wrapper for i18next-cli.**
> Automates namespacing, type generation, and machine translation for React, Next.js, and TypeScript projects.

`smart-i18next-cli` is a powerful toolkit built on top of the official `i18next-cli`. It supercharges your i18n workflow by enforcing **1-to-1 file-based namespacing**, providing **strict type safety**, and offering **automated machine translation** via RapidAPI.

-----

## 🚀 Why use this? (The "Killer Features")

Standard parsers often require manual namespace management or miss keys in complex TypeScript structures. This CLI solves those problems:

### 1\. 📂 1-to-1 File-Based Namespacing

Forget about managing a massive `common.json` or manually splitting files. This CLI automatically maps your source file path to a namespace.

* `src/app/page.tsx` ➡️ **`app.page`** namespace.
* `src/features/auth/Login.tsx` ➡️ **`features.auth.Login`** namespace.

### 2\. 🧠 Smart AST Injection (No more missing keys)

Standard parsers skip `TFunction` usage if `useTranslation` isn't explicitly called.
Our **Smart Plugin** dynamically injects context during parsing, ensuring 100% extraction accuracy for patterns like:

```typescript
// This works automatically! No manual useTranslation() needed.
export const schema = (t: TFunction<"features.auth">) => { ... }
```

### 3\. 🌍 Automated Machine Translation

A dedicated command finds new keys (where `key === value`) and auto-translates them using **DeepL (via RapidAPI)**. It uses local caching to save API costs and time.

### 4\. 🛡️ Strict Type Generation

Automatically generates `TNamespace` and `TNamespaceTranslationKeys` types, ensuring your `t()` functions are type-safe and tied to the correct namespace.

-----

## 📦 Installation

```bash
pnpm add -D @sayyyat/smart-i18next-cli i18next
# or
npm install --save-dev @sayyyat/smart-i18next-cli i18next
```

-----

## ⚙️ Quick Start Workflow

### 1\. Initialize

Run the init command to scaffold the configuration and helper files. It automatically detects if you are using React/Next.js.

```bash
pnpm smart-i18next-cli init
```

*Creates `i18next.config.ts`, `.demo-env`, and `src/i18n/` templates.*

### 2\. Extraction & Sync (The Main Loop)

Run the `extract` command (forwarded to `i18next-cli`). Our plugin hooks into this process to **automatically**:

1.  Generate `namespaces.ts`
2.  Extract keys into correct 1-to-1 namespaces.
3.  Generate TypeScript types.

<!-- end list -->

```bash
pnpm smart-i18next-cli extract
```

### 3\. Auto-Translate (Optional)

Once extraction is done, generate missing translations for secondary languages.

```bash
# Add RAPIDAPI_KEY to your .env first!
pnpm smart-i18next-cli generate-translations
```

-----

## 🛠️ CLI Commands

### Custom "Smart" Commands

| Command                     | Description                                                                                                                           |
|:----------------------------|:--------------------------------------------------------------------------------------------------------------------------------------|
| **`init`**                  | Initializes project. Copies config templates, `.env` example, and type helpers. Supports `--react` or `--core` flags (auto-detected). |
| **`generate-translations`** | **Killer Feature.** Scans locale files for keys where `value === key` and translates them via RapidAPI. Supports `-l <lang>`.         |
| **`clean-translations`**    | Removes unused translation files and empty folders to keep `locales/` clean. Supports `--dry` and `--prune-empty`.                    |
| **`generate-configs`**      | Regenerates `src/i18n/generated/config.ts` based on `i18next.config.ts`.                                                              |
| **`generate-namespaces`**   | Scans source code and regenerates `src/i18n/generated/namespaces.ts` (Valid Namespace List).                                          |
| **`generate-types`**        | Generates static `TNamespace` and `TAllTranslationKeys` types for TypeScript intellisense.                                            |

### Forwarded `i18next-cli` Commands

All standard commands are forwarded to the underlying `i18next-cli`. The **Smart Plugin** attaches to `extract` to automate the workflow.

* **`extract`**: Runs extraction + Smart Plugins (Config -\> Namespaces -\> Extract -\> Types).
* `status`: Shows translation coverage.
* `lint`: Lints translation files.

-----

## 🧩 Configuration (`i18next.config.ts`)

The `init` command creates a `i18next.config.ts` file. This is your **Single Source of Truth**.

```typescript
import { defineConfig } from 'i18next-cli';
import { SmartI18nPlugin } from '@sayyyat/smart-i18next-cli';

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
      
        // ❗️ Critical for Auto-Translation
        // Ensures new keys are written as "Key": "Key" instead of "Key": ""
		defaultValue: (key,namespace, language, value ) => {
			return value ?? key;
		},
	},
	plugins: [
        // ❗️ Activates 1-to-1 namespacing and type generation hooks
        SmartI18nPlugin()
	]
});
```

-----

## 🤖 How the Logic Works

The library uses a **Plugin + Wrapper** architecture:

1.  **Wrapper (`cli.ts`):** Intercepts commands like `init` and `generate-translations` to run custom logic. Forwards `extract` to `i18next-cli`.
2.  **Plugin (`SmartI18nPlugin`):** Hooks into the `i18next-cli` extraction process.
    * **`setup`**: Generates config and namespace lists.
    * **`onLoad`**: Uses Regex to "fix" code in-memory (e.g., injecting `useTranslation` for `TFunction`) so the parser sees the correct namespaces.
    * **`afterSync`**: Merges translations (preserving unused keys if configured) and triggers Type Generation.

-----

## 📝 License

MIT © [Sayat Raykul](./LICENSE)