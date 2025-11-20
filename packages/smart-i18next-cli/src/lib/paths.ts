import * as path from "node:path";
import * as fs from "node:fs";

function findLibraryRoot(): string {
	let currentModulePath: string = __dirname;

	let libraryRoot = currentModulePath;
	while (true) {
		if (fs.existsSync(path.join(libraryRoot, 'package.json'))) {
			// We found the package root
			return libraryRoot;
		}
		const parentDir = path.dirname(libraryRoot);
		if (parentDir === libraryRoot) {
			// We've reached the file system root and found nothing
			throw new Error(`❌ Could not find a package.json root starting from ${currentModulePath}`);
		}
		libraryRoot = parentDir;
	}
}

/**
 * Finds the root directory of the project that is *consuming* (using) this library.
 * It searches upwards from the current working directory (process.cwd()).
 */
export function findProjectRoot(): string {
	let currentDir = process.cwd(); // This will be the user's project root (e.g., apps/next-i18n)

	while (true) {
		const pkgPath = path.join(currentDir, "package.json");
		if (fs.existsSync(pkgPath)) {
			return currentDir;
		}
		const parentDir = path.dirname(currentDir);
		if (parentDir === currentDir) {
			throw new Error("❌ Could not find a valid project root (no package.json found).");
		}
		currentDir = parentDir;
	}
}

// === Public API === //
export function getPathFromConsumerRoot(...segments: string[]): string {
	return path.join(findProjectRoot(), ...segments);
}

export function getPathFromLibraryRoot(...segments: string[]): string {
	return path.join(findLibraryRoot(), ...segments);
}

