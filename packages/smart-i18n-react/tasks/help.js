import chalk from "chalk";
import { CONFIG_FILE_NAME } from "@sayyyat/smart-i18n/lib";

export function helpTask(gulp) {
    gulp.task("help", async function (done) {
        const i18n = await getI18n();
        console.log(chalk.bold("\nsmart-i18n-react Help\n"));

        console.log(chalk.cyan("Available Tasks:"));

        // gulp init
        console.log(
            chalk.green("\n  smart-i18n-react init") +
            chalk.yellow(" [--fsd]")
        );
        console.log("    Copies base i18n setup files into your project");
        console.log("    Files:");
        console.log("      - " + chalk.yellow("./i18next.config.json"));
        console.log("      - " + chalk.yellow("./.demo-env"));
        console.log("      - " + chalk.yellow("src/i18n/ (template folder)"));
        console.log("    Parameters:");
        console.log(
            "      " +
            chalk.yellow("--fsd") +
            " - Use the FSD (Feature-Sliced Design) template for " +
            chalk.yellow("i18next.config.json")
        );

        // gulp
        console.log(chalk.green("\n  smart-i18n-react"));
        console.log("    Run the default task sequence");
        console.log(
            `    ${chalk.yellow("generate-namespaces")} -> ${chalk.yellow(
                "generate-templates"
            )} -> ${chalk.yellow("generate-types")}`
        );
        
        // gulp generate-config
        console.log(chalk.green("\n  smart-i18n-react generate-config"));
        console.log("    Generates runtime config (src/i18n/lib/config.ts) from " + chalk.yellow(CONFIG_FILE_NAME));
        console.log("    (This task is included in the default sequence)");

        // gulp generate-namespaces
        console.log(chalk.green("\n  smart-i18n-react generate-namespaces"));
        console.log("    Scans your codebase and generates namespace definitions");
        console.log("    Output: " + chalk.yellow(configs.generatedNamespacesPath));

        // gulp generate-templates
        console.log(chalk.green("\n  smart-i18n-react generate-templates"));
        console.log("    Extracts translation keys from your source files");
        console.log("    Creates/updates translation files for all languages");
        console.log("    Keeps old translations to avoid data loss");
        console.log("    Output: " + chalk.yellow(i18n.options.resource.savePath));

        // gulp generate-types
        console.log(chalk.green("\n  smart-i18n-react generate-types"));
        console.log("    Generates type definitions for your translations");
        console.log("    Output: " + chalk.yellow(configs.generatedTypesPath));

        // gulp generate-translations
        console.log(
            chalk.green("\n  smart-i18n-react generate-translations") +
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
            chalk.green("smart-i18n-react generate-translations") +
            " - Translate all languages"
        );
        console.log(
            "      " +
            chalk.green("smart-i18n-react generate-translations -l kk") +
            " - Translate only Kazakh"
        );

        // gulp clean-translations
        console.log(
            chalk.green("\n  smart-i18n-react clean-translations") +
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
            chalk.green("smart-i18n-react clean-translations --dry") +
            " - Preview files to be removed"
        );
        console.log(
            "      " +
            chalk.green("smart-i18n-react clean-translations --prune-empty --verbose") +
            " - Remove unused and empty files with detailed log"
        );

        // gulp watch
        console.log(chalk.green("\n  smart-i18n-react watch"));
        console.log(
            `    Runs ${chalk.yellow("generate-namespaces")} -> ${chalk.yellow(
                "generate-templates"
            )} -> ${chalk.yellow("generate-types")} on file changes`
        );

        // gulp help
        console.log(chalk.green("\n  smart-i18n-react help"));
        console.log("    Displays this help information");

        console.log(chalk.cyan("\nWorkflow:"));
        console.log(
            "  1. Run " +
            chalk.green("smart-i18n-react init") +
            " initialize your project to use smart-i18n-react"
        );
        console.log(
            "  2. Run " +
            chalk.green("smart-i18n-react generate-namespaces") +
            " to update namespace definitions"
        );
        console.log(
            "  3. Run " +
            chalk.green("smart-i18n-react generate-templates") +
            " to extract translation keys"
        );
        console.log(
            "  4. Run " +
            chalk.green("smart-i18n-react generate-types") +
            " to update TypeScript types"
        );
        console.log(
            "  5. Run " +
            chalk.green("smart-i18n-react generate-translations") +
            " to translate missing keys"
        );
        console.log(
            "  6. Optionally run " +
            chalk.green("smart-i18n-react clean-translations") +
            " to remove unused translation files"
        );
        console.log(
            "  7. Run " +
            chalk.green("smart-i18n-react watch") +
            " to run generate-namespaces -> generate-templates -> generate-types on file changes"
        );

        console.log(chalk.cyan("\nConfiguration:"));
        console.log(
            "  Edit " +
            chalk.yellow(CONFIG_FILE_NAME) +
            " to customize paths and patterns"
        );

        // gulp create-feature
        console.log(
            chalk.green("\n  smart-i18n-react create-feature") +
            chalk.yellow(" [-n, --name <feature-name>]") +
            chalk.yellow(" [--js]"),
        );
        console.log("    Generates boilerplate for a new feature");
        console.log("    Parameters:");
        console.log(
            "      " +
            chalk.yellow("-n, --name") +
            " - Name for new feature (in camelCase or kebab-case)",
        );
        console.log(
            "      " +
            chalk.yellow("    --js  ") +
            " - Generate JavaScript/JSX instead of TypeScript/TSX. (Default: false)",
        );

        console.log("    Examples:");
        console.log("      " + chalk.green("smart-i18n-react create-feature -n my-feature"));
        console.log(
            "      - Generates feature named 'my-feature' with TypeScript/TSX files",
        );
        console.log(
            "      " + chalk.green("smart-i18n-react create-feature -n my-feature --js"),
        );
        console.log(
            "      - Generates feature named 'my-feature' with JavaScript/JSX files",
        );

        console.log(chalk.green("\n  smart-i18n-react help"));
        console.log("    Displays this help information");

        console.log(chalk.cyan("\nWorkflow:"));
        console.log(
            "  1. Run " +
            chalk.green("smart-i18n-react init") +
            " initialize your project to use smart-i18n and smart-i18n-react",
        );
        console.log(
            "  2. Run " +
            chalk.green("smart-i18n create-feature") +
            " to generate boilerplate for a new feature",
        );

        console.log(chalk.cyan("\nConfiguration:"));
        console.log(
            "  Edit " +
            chalk.yellow(CONFIG_FILE_NAME) +
            " to customize paths and patterns",
        );

        console.log(); // Empty line at the end
        done();
    });
}
