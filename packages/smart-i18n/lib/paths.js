import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
import { dirname } from "path";

function findLibraryRoot() {
    const currentFilePath = fileURLToPath(import.meta.url);
    const libDir = dirname(currentFilePath);
    const libraryRoot = path.resolve(libDir, "..");

    if (fs.existsSync(path.join(libraryRoot, 'package.json'))) {
        return libraryRoot;
    }

    throw new Error("Could not find the library root via import.meta.url. File structure may be incorrect.");
}

export function findProjectRoot() {
    let currentDir = process.cwd();

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
export function getPathFromConsumerRoot(...segments) {
    return path.join(findProjectRoot(), ...segments);
}

export function getPathFromLibraryRoot(...segments) {
    return path.join(findLibraryRoot(), ...segments);
}

// === Useful constants === //
export const SRC_PATH = getPathFromConsumerRoot("src");

export const LIB_SRC_PATH = getPathFromLibraryRoot("src");