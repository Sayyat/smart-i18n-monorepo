/*
 * Copyright (c) 2025. Sayat Raykul
 */
import chalk from "chalk";
import {CONFIG_FILE_NAME} from "@sayyyat/smart-i18n/lib";

export default function helpTask(gulp) {
    gulp.task("help", async function (done) {
        console.log(chalk.bold("\nsmart-i18n-react Help\n"));

        console.log(chalk.cyan("Available Tasks:"));

        // gulp init
        console.log(chalk.green("\n  smart-i18n-react init"));
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
