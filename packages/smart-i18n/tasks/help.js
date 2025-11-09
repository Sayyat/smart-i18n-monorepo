import chalk from "chalk";
import { CONFIG_FILE_NAME, configs } from "../lib/config.js";
import { getI18n } from "../lib/i18n.js";

export function helpTask(gulp) {
    gulp.task("help", async function (done) {
        const i18n = await getI18n();
        console.log(chalk.bold("\nsmart-i18n Help\n"));

        console.log(chalk.cyan("Available Tasks:"));

        // gulp init
        console.log(chalk.green("\n  smart-i18n init"));
        console.log("    Copies base i18n setup files into your project");
        console.log("    Files:");
        console.log("      - " + chalk.yellow("./i18next.config.json"));
        console.log("      - " + chalk.yellow("./.demo-env"));
        console.log("    Note:");
        console.log(
            "      This will also copy the default " +
            chalk.yellow("src/i18n/") +
            " folder structure if available"
        );

        // gulp
        console.log(chalk.green("\n  smart-i18n"));
        console.log("    Run the default task sequence");
        console.log(
            `    ${chalk.yellow("generate-namespaces")} -> ${chalk.yellow(
                "generate-templates"
            )} -> ${chalk.yellow("generate-types")}`
        );

        // gulp generate-config
        console.log(chalk.green("\n  smart-i18n generate-config"));
        console.log("    Generates runtime config (src/i18n/lib/config.ts) from " + chalk.yellow(CONFIG_FILE_NAME));
        console.log("    (This task is included in the default sequence)");

        // gulp generate-namespaces
        console.log(chalk.green("\n  smart-i18n generate-namespaces"));
        console.log("    Scans your codebase and generates namespace definitions");
        console.log("    Output: " + chalk.yellow(configs.generatedNamespacesPath));

        // gulp generate-templates
        console.log(chalk.green("\n  smart-i18n generate-templates"));
        console.log("    Extracts translation keys from your source files");
        console.log("    Creates/updates translation files for all languages");
        console.log("    Keeps old translations to avoid data loss");
        console.log("    Output: " + chalk.yellow(i18n.options.resource.savePath));

        // gulp generate-types
        console.log(chalk.green("\n  smart-i18n generate-types"));
        console.log("    Generates type definitions for your translations");
        console.log("    Output: " + chalk.yellow(configs.generatedTypesPath));

        // gulp generate-translations
        console.log(
            chalk.green("\n  smart-i18n generate-translations") +
            chalk.yellow(" [-l, --lang <language>]")
        );
        console.log(
            "    Translates only missing keys using 'Deep Translate' on 'Rapid api'"
        );
        console.log(
            `    You must provide your ${chalk.yellow(
                "RAPIDAPI_KEY"
            )} variable in ${chalk.yellow(".env")} file (See .demo-env)`
        );
        console.log("    Parameters:");
        console.log(
            "      " +
            chalk.yellow("-l, --lang") +
            " - Specific language to translate. (Default: all)"
        );
        console.log("    Examples:");
        console.log(
            "      " +
            chalk.green("smart-i18n generate-translations") +
            " - Translate all languages"
        );
        console.log(
            "      " +
            chalk.green("smart-i18n generate-translations -l kk") +
            " - Translate only Kazakh"
        );

        // gulp clean-translations
        console.log(
            chalk.green("\n  smart-i18n clean-translations") +
            chalk.yellow(" [--dry] [--prune-empty] [--verbose]")
        );
        console.log(
            "    Removes unused translation files by namespaces that are not referenced in your code"
        );
        console.log(
            "    Sources: code patterns from " +
            chalk.yellow("includePatterns") +
            " and exclusions from " +
            chalk.yellow("excludePatterns") +
            " in " +
            chalk.yellow(CONFIG_FILE_NAME)
        );
        console.log(
            "    Also considers generated namespaces from " +
            chalk.yellow(configs.generatedNamespacesPath)
        );
        console.log("    Parameters:");
        console.log(
            "      " +
            chalk.yellow("--dry") +
            " - Show what would be deleted without deleting"
        );
        console.log(
            "      " +
            chalk.yellow("--prune-empty") +
            " - Remove empty JSON files even if namespace is used"
        );
        console.log(
            "      " +
            chalk.yellow("--verbose") +
            " - Verbose output"
        );
        console.log("    Examples:");
        console.log(
            "      " +
            chalk.green("smart-i18n clean-translations --dry") +
            " - Preview files to be removed"
        );
        console.log(
            "      " +
            chalk.green("smart-i18n clean-translations --prune-empty --verbose") +
            " - Remove unused and empty files with detailed log"
        );

        // gulp watch
        console.log(chalk.green("\n  smart-i18n watch"));
        console.log(
            `    Runs ${chalk.yellow("generate-namespaces")} -> ${chalk.yellow(
                "generate-templates"
            )} -> ${chalk.yellow("generate-types")} on file changes`
        );

        // gulp help
        console.log(chalk.green("\n  smart-i18n help"));
        console.log("    Displays this help information");

        console.log(chalk.cyan("\nRecommended Workflow:"));
        console.log(
            "  1. Run " +
            chalk.green("smart-i18n-react init") +
            " or " +
            chalk.green("init --fsd") +
            " to initialize your project."
        );
        console.log(
            "  2. Edit " +
            chalk.yellow(CONFIG_FILE_NAME) +
            " to match your project structure."
        );
        console.log(
            "  3. Run " +
            chalk.green("smart-i18n-react") +
            " (default) to generate all types and templates."
        );
        console.log(
            "  4. Run " +
            chalk.green("smart-i18n-react generate-translations") +
            " to auto-translate."
        );
        console.log(
            "  5. Run " +
            chalk.green("smart-i18n-react watch") +
            " during development."
        );

        console.log(); // Empty line at the end
        done();
    });
}
