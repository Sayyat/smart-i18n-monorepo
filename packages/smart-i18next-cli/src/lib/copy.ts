import { ConsoleLogger } from "./logger";
import * as fsp from "node:fs/promises";
import * as path from "node:path";
import { getPathFromConsumerRoot, getPathFromLibraryRoot } from "./paths";
import { type ILogger } from "./types";

async function exists(p: string): Promise<boolean> {
	try {
		await fsp.access(p);
		return true;
	} catch {
		return false;
	}
}

export async function copyTemplates(isReact: boolean, logger: ILogger) {
	const coreTemplatesPath = "src/templates/core/i18n";
	const reactTemplatesPath = "src/templates/react/i18n";

	const templatePath = isReact ? reactTemplatesPath : coreTemplatesPath;
	const copiedText = isReact
		? "✅ Copied Core templates (index.ts, safety.ts)..."
		: "✅ Copied React-specific templates (client.ts, server.ts)..."

	await copyBaseInitFiles(logger);

	const templateSource = getPathFromLibraryRoot(templatePath);
	const consumerDest = getPathFromConsumerRoot("src/i18n");
	await copyDirectoryRecursive(templateSource, consumerDest, logger);
	logger.info(copiedText);
}


export async function copyBaseInitFiles(logger: ILogger = new ConsoleLogger()) {
	const fileList = ["i18next.config.ts", ".demo-env"];
	const templatesFolderPrefix = "src/templates";
	for (const file of fileList) {
		const src = getPathFromLibraryRoot(path.join(templatesFolderPrefix, file));
		const dest = getPathFromConsumerRoot(file);

		if (!(await exists(src))) {
			logger.warn(`⚠️ Skipped: ./${file} not found in library source.`);
			continue;
		}

		if (await exists(dest)) {
			logger.warn(`⚠️ Skipped: ./${file} already exists in project`);
			continue;
		}

		await fsp.copyFile(src, dest);
		logger.info(`✅ Copied: ./${file}`);
	}
}

export async function copyDirectoryRecursive(srcDir: string, destDir: string, logger: ILogger = new ConsoleLogger()) {
	if (!(await exists(srcDir))) {
		logger.warn(`⚠️ Skipped: ${srcDir} folder not found in library`);
		return;
	}

	if (await exists(destDir)) {
		logger.warn(`⚠️ Skipped: ${destDir} folder already exists in project`);
		return;
	}

	const copyRecursive = async (src: string, dest: string) => {
		await fsp.mkdir(dest, {recursive: true});

		const entries = await fsp.readdir(src, {withFileTypes: true});

		for (const entry of entries) {
			const srcItem = path.join(src, entry.name);
			const destItem = path.join(dest, entry.name);

			if (entry.isDirectory()) {
				await copyRecursive(srcItem, destItem);
			} else {
				await fsp.copyFile(srcItem, destItem);
			}
		}
	};

	await copyRecursive(srcDir, destDir);
	logger.info(`✅ Copied folder: ${srcDir.replace(process.cwd(), '.')}`);
}