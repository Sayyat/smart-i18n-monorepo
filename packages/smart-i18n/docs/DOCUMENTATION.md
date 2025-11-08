# **Smart-i18n**

## **Automation Scripts Documentation**

## **Overview**

The Smart-i18n system is a comprehensive internationalization (i18n) toolkit that streamlines translation management in large-scale js/ts applications. It automates namespace generation, key extraction, translation updates, and TypeScript typing — all powered by a Gulp-based workflow.

-----

## 💾 Installation

Install this package as a development dependency:

```bash
# pnpm
pnpm add @sayyyat/smart-i18n -D

# yarn
yarn add @sayyyat/smart-i18n -D

# npm
npm install @sayyyat/smart-i18n --save-dev
```

---

## **Configuration**

## **i18next.config.json**

This is the configuration file used by the **smart-i18n** system to define how translations should be managed. It will be created in consumer project automatically via `smart-i18n init` command.


```json
{
  // Path to your i18n configuration file
  "configFilePath": "src/i18n/lib/config.ts",

  // Directory where all translation files are stored
  "localesDirectory": "src/i18n/locales",

  // Path for generated namespaces
  "generatedNamespacesPath": "src/i18n/generated/namespaces.ts",

  // Path for generated TypeScript types
  "generatedTypesPath": "src/i18n/generated/types.ts",

  // Whether to preserve or remove unused keys
  "keepUnusedKeys": true,

  // Patterns for files to include in the translation process
  "includePatterns": [
    "src/app/**/*.{jsx,tsx}",
    "src/core/components/**/*.{js,jsx,ts,tsx}",
    "src/core/hooks/**/*.{js,jsx,ts,tsx}",
    "src/shared/components/**/*.{js,jsx,ts,tsx}",
    "src/shared/hooks/**/*.{js,jsx,ts,tsx}",
    "src/shared/services/api.{js,ts}", // look this file to specify dynamic backend error codes
    "src/features/*/components/**/*.{js,jsx,ts,tsx}",
    "src/features/*/hooks/**/*.{js,jsx,ts,tsx}",
    "src/features/*/lib/zod.{js,ts}"
  ],

  // Patterns for files to exclude from the translation process
  "excludePatterns": [
    "src/**/*.d.ts",   // Exclude TypeScript definition files
    "**/node_modules/**", // Exclude dependencies in node_modules
    "src/i18n/**",  // Exclude existing i18n files (we're handling these separately)
    "src/app/api/**", // Exclude API files
    "src/shared/components/ui/**", // Exclude UI component files
    "src/shared/hooks/**", // Exclude shared hooks
    "src/shared/data/**" // Exclude data files
  ]
}
```

---

### **Key Explanations for the Config File**:

* **`configFilePath`**: The path to the TypeScript configuration file that defines language settings and other
  i18n-related configuration parameters.
* **`localesDirectory`**: The directory where translation files (in various languages) will be stored. Each language
  will have its own folder inside this directory.
* **`generatedNamespacesPath`**: The path where the generated namespace definitions are stored. This helps group
  translation keys under specific namespaces.
* **`generatedTypesPath`**: The path where TypeScript types for translation keys are generated. This helps ensure type
  safety when accessing translation keys in the codebase.
* **`keepUnusedKeys`**: A flag to indicate whether to keep unused translation keys in the files. When set to `true`,
  even keys that are no longer used in the code will remain in the translation files.
* **`includePatterns`**: These are the patterns that tell the system where to look for files containing translation
  keys. The system will scan these files and extract the necessary translation data.
* **`excludePatterns`**: These patterns define which files should be excluded from translation scanning. For example,
  `src/**/*.d.ts` excludes TypeScript definition files, which do not contain translations.

  
### ⚠️ Note on Running Inside `smart-i18n`

> The Gulp tasks are **not executable inside the `smart-i18n` library itself**.
> They are designed to be installed and executed **from within a consumer project** (e.g., Next.js, React, or Vue projects).
>
> In your consumer project, install `smart-i18n` and run commands like:

```bash
  yarn smart-i18n generate-templates
  # or
  npx smart-i18n generate-types
```

> The library will detect your project root and apply all operations based on your own `i18next.config.json`.

-----

## **Key Features**

### 1. **Automatic Namespace and Key Generation**

* The system automatically generates namespaces and translation keys by scanning the source code, ensuring easy
  maintenance and scalability without manually defining each translation key.

### 2. **Translation File Management**

* **Translation Files**: Stores translations for each language in JSON files (e.g.,
  `src/i18n/locales/{language}/{namespace}.json`).
* **Automatic Merging**: New translation keys are automatically merged with existing ones, preserving previously added translations.
* **Configurable Cleanup**: By default, unused keys are removed during scanning. To retain explicitly declared but unused keys — such as backend error messages — set `"keepUnusedKeys": true` in the config.

### 3. **Dynamic Translation Generation**

![Deep Translate API](../public/assets/deep-translate.png)

* Missing translations are detected and fetched using the *
  *[Deep Translate API](https://rapidapi.com/gatzuma/api/deep-translate1)** from **[RapidAPI](https://rapidapi.com/)**.
  This ensures that even new translations are automatically populated without manual intervention.

### 4. **TypeScript Integration**

* The system integrates TypeScript to provide type safety for translations. The generated types ensure that only valid
  keys are used in the codebase, preventing errors and increasing code reliability.

---

## **CLI Commands**

### 1. **`smart-i18n` (default task)**

* Runs the following tasks **in order**:

    * `generate-namespaces`: Scans the codebase and generates namespace definitions.
    * `generate-templates`: Extracts translation keys and updates the translation files.
    * `generate-types`: Generates TypeScript types for translations.

### 2. **`smart-i18n generate-namespaces`**

* Scans the codebase for translation keys and generates namespace definitions.
* **Output**: `src/i18n/generated/namespaces.ts`

### 3. **`smart-i18n generate-templates`**

* Extracts translation keys from source files and creates or updates translation files for all languages.
* **Output**: `src/i18n/locales/{{lng}}/{{ns}}.json`

* **Features**:

    * Avoids data loss by preserving old translations.
    * Ensures the safe addition of new translations without removing existing ones.

### 4. **`smart-i18n generate-types`**

* Generates TypeScript types for your translations.
* **Output**: `src/i18n/generated/types.ts`

### 5. **`smart-i18n generate-translations [-l, --lang <language>]`**

* Translates only the missing keys using the Deep Translate API from RapidAPI.
* **Parameters**:

    * `-l, --lang`: Specifies the language to translate (Default: all).
* **Example**:

    * `smart-i18n generate-translations -l kk` - Translates only the Kazakh language.
    * `smart-i18n generate-translations` - Translates all languages.


### 6. **`smart-i18n watch`**

* Automatically runs the following tasks when source files or translation files change:

    * `generate-namespaces`
    * `generate-templates`
    * `generate-types`
* Watches for changes in:

    * Source files (e.g., JSX/TSX files in the codebase).
    * Translation files in `src/i18n/locales`.

### 7. **`smart-i18n help`**

* Displays the available tasks and their descriptions.

---

> 💡 **Tip**: It's recommended to run `smart-i18n` (default task) before each deployment to ensure that your namespaces, templates, and types are fully synced.

## **Workflow**

1. **Namespace Generation**: Run `smart-i18n generate-namespaces` to scan your codebase and update namespace definitions.
2. **Key Extraction**: Run `smart-i18n generate-templates` to extract new translation keys from your codebase.
3. **Type Generation**: Run `smart-i18n generate-types` to generate TypeScript types for the translations.
4. **Translation**: Run `smart-i18n generate-translations` to automatically translate missing keys.
5. **Watching**: Use `smart-i18n watch` to monitor file changes and regenerate namespaces, templates, and types automatically.


# Gulp Scripts File Structure

## Overview

The **Gulp** scripts in the **smart-i18n** project automate various tasks related to translations, including key extraction, namespace generation, type generation, and translation fetching from external services like **RapidAPI**.

This file structure is organized into **`lib/`** for reusable utilities and **`tasks/`** for the individual Gulp tasks. The files inside **`lib/`** contain the core logic used by the tasks, while the **`tasks/`** folder contains the actual tasks that will be executed via Gulp.

---

## File Structure

```plaintext
smart-i18n/
├── lib/
│   ├── config.js                   // Script to parse i18next.config.json and share default configs
│   ├── copy.js                     // Copy related helper functions
│   ├── flush.js                    // Custom logic for flushing or resetting translation keys
│   ├── i18n.js                     // Exports async getI18n function for initializing i18next
│   ├── init.js                     // Project initialization
│   ├── language.js                 // Parses src/i18n/lib/config.ts for languages and fallback language
│   ├── namespaces.js               // Generates namespaces based on translation keys
│   ├── paths.js                    // Exports utility functions like getConsumerRoot and getPathFromConsumerRoot
│   ├── transform.js                // Custom transform logic used by i18next-scanner for processing keys
│   ├── translation.js              // Handles automated translation fetching from RapidAPI
│   └── type.js                     // Handles type generation logic for translation keys
├── src/                            // Optional test folder for local development
├── tasks/
│   ├── generate-namespaces.js      // Gulp task to generate namespaces based on translation keys
│   ├── generate-templates.js       // Task to extract translation keys and update language files
│   ├── generate-translations.js    // Task to fetch translations for missing keys from RapidAPI
│   ├── generate-types.js           // Gulp task to generate TypeScript types for translations
│   ├── help.js                     // Gulp task to display available tasks and their descriptions
│   ├── init.js                     // Gulp task to init the project. Adds i18next.config.json and .demo-env
│   └── watch.js                    // Gulp task to watch for file changes and re-run tasks automatically
├── .demo-env                       // Demo .env
├── gulpfile.js                     // Main Gulp configuration file that imports and runs tasks
├── i18next.config.json             // Custom i18next configuration used by Gulp scripts
└── package.json                    // Defines project dependencies, including Gulp-related packages
```

---

## Explanation of Files

### /lib/

Reusable logic shared between all Gulp tasks:

- **config.js** — Loads and parses `i18next.config.json`.
- **flush.js** — Custom logic to clear/reset translations.
- **i18n.js** — Initializes i18next instance for internal use.
- **language.js** — Parses TS config to detect supported languages and fallback.
- **namespaces.js** — Scans files and generates namespaces from translation keys.
- **paths.js** — Locates consumer root or internal root, and resolves paths accordingly.
- **transform.js** — Custom transform for i18next-scanner to parse translation keys.
- **translation.js** — Handles external translation API (e.g., Deep Translate via RapidAPI).
- **type.js** — Generates TypeScript types from translation files.

### /tasks/

Each file is a self-contained Gulp task:

- **generate-namespaces.js** — Builds a map of translation namespaces.
- **generate-templates.js** — Extracts and updates translation keys in locale files.
- **generate-translations.js** — Requests missing translations from RapidAPI.
- **generate-types.js** — Converts extracted keys into a types.ts file.
- **watch.js** — Watches for changes and triggers translation-related tasks.
- **help.js** — Outputs list of all CLI tasks and usage.
- **copy.js** — Initializes config files (`i18next.config.json`, `.demo-env`) in a consumer project.

---

## How to Use the Gulp Tasks

Each task can be run via CLI using the `smart-i18n` binary:

```bash
  smart-i18n generate-namespaces
  smart-i18n generate-templates
  smart-i18n generate-types
  smart-i18n generate-translations -l ru
  smart-i18n watch
```

For full task details, run:

```bash
  smart-i18n help
```

These scripts make i18n workflows reproducible, automated, and framework-agnostic. You can easily integrate them with **Next.js**, **React**, **Vue**, or any TypeScript/JavaScript project.
