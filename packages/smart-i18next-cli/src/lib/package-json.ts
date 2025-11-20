import { ConsoleLogger } from "./logger";
import * as fsp from "node:fs/promises";
import { getPathFromConsumerRoot, getPathFromLibraryRoot } from "./paths";
import type { ILogger } from "./types";

interface IPackageJson {
	dependencies?: Record<string, string>;
	devDependencies?: Record<string, string>;
	version: string
}

export async function getPackageJson(pkgPath: string): Promise<IPackageJson> {
	try {
		const content = await fsp.readFile(pkgPath, 'utf8');
		return JSON.parse(content)
	} catch (e) {
		return {} as IPackageJson;
	}
}

export async function getPackageVersion(): Promise<string> {
	const pkgPath = getPathFromLibraryRoot('package.json');
	const packageJson = await getPackageJson(pkgPath)
	return packageJson.version
}

export async function checkIsReactProject(): Promise<boolean> {
	const pkgPath = getPathFromConsumerRoot('package.json');
	const pkg = await getPackageJson(pkgPath)
	const allDeps = {...(pkg.dependencies ?? {}), ...(pkg.devDependencies ?? {})};
	return 'react' in allDeps || 'next' in allDeps;
}

export async function checkIsReactMode(options: {
	react?: boolean;
	core?: boolean
}, logger: ILogger = new ConsoleLogger()) {
	let isReactMode: boolean;

	if (options.react) {
		logger.info("React mode forced via --react flag.");
		isReactMode = true;
	} else if (options.core) {
		logger.info("Core mode forced via --core flag.");
		isReactMode = false;
	} else {
		logger.info("No flags detected. Analyzing package.json...");
		isReactMode = await checkIsReactProject();
		if (isReactMode) {
			logger.info("React/Next.js project detected. Using 'React' templates.");
		} else {
			logger.info("No React/Next.js detected. Using 'Core' templates.");
		}
	}
	return isReactMode;
}