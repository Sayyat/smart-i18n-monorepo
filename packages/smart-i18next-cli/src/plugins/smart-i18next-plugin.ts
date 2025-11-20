import chalk from 'chalk';
import type { ExtractedKeysMap, I18nextToolkitConfig, Plugin, TranslationResult } from 'i18next-cli';
import {
	checkIsReactProject,
	ConsoleLogger,
	extractNamespaces,
	generateConfigs,
	generateNamespaces,
	generateTypes,
	type ILogger,
	loadConfig,
	mergeTranslations,
	normalizeNamespacePath,
} from '../lib';

// 1. REGEX: Detect useTranslation, getTranslation, or TFunction calls.
// Group 1: Function name (useTranslation)
// Group 2: Quote (", ', `)
// Group 3: Namespace string (my.namespace)
const NS_USAGE_REGEX = /\b(useTranslation|getTranslation)(?:<[^>]+>)?\s*\(\s*(?:(['"`])([^'"`]+)\2)?/g;

// 2. REGEX: Detect the opening tag of the <Trans> component.
// Matches <Trans ... > or <Trans ... />
// (\s[\s\S]*?) - Captures the attributes/props
const TRANS_TAG_REGEX = /<Trans(\s[\s\S]*?)?(\/?)>/g;

// 3. REGEX: Detect the 'ns' prop within attributes.
// Matches ns="value", ns={'value'}, or ns={"value"}
const NS_PROP_REGEX = /(\bns\s*=\s*)(?:(["'])([^"']*)\2|(\{)([^}]*)(\}))/;

// 4. REGEX: Updated TFunction Detection (Flexible)
// Explanation:
// 1. (... - Start of capture
// 2. t: TFunction... - The 't' argument with type definition
// 3. ... ) - End of arguments
// 4. (?::\s*[^{]+)? - NEW: Matches optional return type definition (e.g., : Promise<string>) before the body
// 5. \s*(?:=>)?\s*\{ - Start of the function body
const TFUNCTION_COMPLEX_REGEX = /(\(\s*[^)]*?)(\bt\s*:\s*TFunction(?:\s*<\s*(["'])([^"']+)\3\s*>)?)([^)]*\)\s*(?::\s*[^{]+)?\s*(?:=>)?\s*\{)/g;

/**
 * Main plugin for 'smart-i18next-cli'.
 * This plugin overrides default i18next-cli behavior to implement:
 * 1. 1-to-1 file-based namespacing via code rewriting (onLoad).
 * 2. 'key: key' default value logic.
 * 3. Smart merging to preserve unused keys.
 */
export const SmartI18nextPlugin = (
	logger: ILogger = new ConsoleLogger(true, '[smart-i18next-plugin]'),
): Plugin => {

	// Cache for valid namespaces generated during setup
	let validNamespacesSet = new Set<string>();

	return {
		name: 'smart-i18next-plugin',

		/**
		 * SETUP Hook: Generates initial configuration and namespaces.
		 * Runs before extraction begins.
		 */
		async setup() {
			logger.info(chalk.magenta(`--- setup ---`));

			const config = await loadConfig(undefined, logger);
			if (config === null) return;

			const isReact = await checkIsReactProject();

			// 1. Generate config.ts and namespaces.ts
			await generateConfigs(config, isReact, logger);
			await generateNamespaces(config, logger);

			// 2. Load the generated valid namespaces into memory
			// This is critical for the 'reuse' logic in onLoad
			const namespacesList = await extractNamespaces(logger);
			validNamespacesSet = new Set(namespacesList);

			logger.info(`Loaded ${validNamespacesSet.size} valid namespaces.`);
		},

		/**
		 * "Killer Feature" Logic: Rewrite code BEFORE it hits the AST parser.
		 * This allows us to inject namespaces dynamically based on file path.
		 */
		async onLoad(code: string, filePath: string): Promise<string> {
			const nativeNs = normalizeNamespacePath(filePath);
			let needsImportInjection = false;

			// --- 1. Handle useTranslation / getTranslation ---
			let rewrittenCode = code.replace(NS_USAGE_REGEX, (match, fnName, quote, currentNs) => {
				// If no namespace provided -> use native file-based namespace
				if (!currentNs) return `${fnName}("${nativeNs}"`;
				// If namespace provided but invalid/unknown -> force overwrite with native namespace
				if (!validNamespacesSet.has(currentNs)) return `${fnName}("${nativeNs}"`;
				// If valid namespace -> keep as is (reuse)
				return match;
			});

			// --- 2. Handle <Trans> Component ---
			rewrittenCode = rewrittenCode.replace(TRANS_TAG_REGEX, (fullTagMatch, attributes, selfClosing) => {
				const safeAttributes = attributes || "";
				const safeSelfClosing = selfClosing || "";

				// Check if 'ns' prop exists
				const nsMatch = safeAttributes.match(NS_PROP_REGEX);

				if (nsMatch) {
					// 'ns' prop exists. Check its value.
					// Group 3: "value" (double quotes), Group 5: {value} (braces)
					const currentNs = nsMatch[3] || nsMatch[5];

					// Case 1: Valid namespace (Reuse) -> Keep as is
					if (currentNs && validNamespacesSet.has(currentNs.replace(/['"]/g, ''))) {
						return fullTagMatch;
					}

					// Case 2: Invalid namespace -> Overwrite in place
					const newAttributes = safeAttributes.replace(NS_PROP_REGEX, (m: string, prefix: string) => {
						return `${prefix}"${nativeNs}"`;
					});

					return `<Trans${newAttributes}${safeSelfClosing}>`;

				} else {
					// Case 3: No 'ns' prop -> Inject it at the beginning
					return `<Trans ns="${nativeNs}"${safeAttributes}${safeSelfClosing}>`;
				}
			});

			// --- 3. Handle TFunction (Smart Injection) ---
			// Transforms: (t: TFunction<"ns">) => { ... }
			// Into:       (t: TFunction<"ns">) => { const {t} = useTranslation("ns"); ... }
			rewrittenCode = rewrittenCode.replace(TFUNCTION_COMPLEX_REGEX, (match, beforeT, tArg, quote, currentNs, afterT) => {
				// Determine target namespace
				let targetNs = nativeNs;

				// If a valid namespace is provided in generic, reuse it
				if (currentNs && validNamespacesSet.has(currentNs)) {
					targetNs = currentNs;
				}

				// Inject 'useTranslation' call at the start of the function body.
				// This tricks the i18next-cli parser into registering the keys for the correct namespace.
				needsImportInjection = true;

				return `${beforeT}${tArg}${afterT} const {t} = useTranslation("${targetNs}");`;
			});

			// --- 4. Inject Import if needed ---
			if (needsImportInjection) {
				// If we injected 'useTranslation', we must ensure it is imported to avoid syntax errors
				// (though i18next-cli parser might be lenient, it's safer to add it).
				if (!rewrittenCode.includes('import { useTranslation }') && !rewrittenCode.includes('import {useTranslation}')) {
					// Assume 'react-i18next' for React projects (or fallback to i18next)
					rewrittenCode = `import { useTranslation } from 'react-i18next';\n` + rewrittenCode;
				}
			}

			// Debugging: View the transformed code
			// console.log(rewrittenCode)

			return rewrittenCode;
		},

		// Note: onVisitNode is not used because we handle everything via code rewriting in onLoad.
		// This avoids complexity with AST manipulation and missing location data.

		/**
		 * onEnd Hook: Ensures 'key: key' logic is applied.
		 */
		async onEnd(keys: ExtractedKeysMap) {
			for (const [_, keyInfo] of keys.entries()) {
				if (!keyInfo.defaultValue) {
					keyInfo.defaultValue = keyInfo.key;
				}
			}
		},

		/**
		 * afterSync Hook: Handles merging (preserving unused keys) and type generation.
		 */
		async afterSync(results: TranslationResult[], config: I18nextToolkitConfig) {
			logger.info(chalk.magenta('--- afterSync ---'));

			for (const result of results) {
				const merged = mergeTranslations({
					config,
					existing: result.existingTranslations,
					newTranslations: result.newTranslations,
					logger,
				});
				result.newTranslations = merged;
				result.updated = true;
			}

			await generateTypes(config, logger);
		},
	};
};