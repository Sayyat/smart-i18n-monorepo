import path from "path";
import fs from "fs";
import { fileURLToPath } from "url"; // ❗️ 1. Осыны қосыңыз
import { dirname } from "path";      // ❗️ 2. Осыны қосыңыз

// ❗️ 3. 'findLibraryRoot' енді 'import.meta.url'-ды қолданады
function findLibraryRoot() {
  // Бұл 'paths.js' файлының өзінің толық жолын алады
  // (мысалы, D:/.../packages/smart-i18n-react/lib/paths.js)
  const currentFilePath = fileURLToPath(import.meta.url); 
  
  // Осы файл орналасқан 'lib' папкасын табады
  const libDir = dirname(currentFilePath);
  
  // 'lib'-тен бір деңгей жоғары көтерілеміз, бұл 'packages/smart-i18n-react' папкасы
  const libraryRoot = path.resolve(libDir, "..");

  // 'package.json' сол жерде екенін тексереміз
  if (fs.existsSync(path.join(libraryRoot, 'package.json'))) {
      return libraryRoot;
  }
  
  throw new Error("Could not find the 'smart-i18n-react' library root via import.meta.url.");
}

// ❗️ 4. 'findProjectRoot' 'init' командасы үшін қажет
export function findProjectRoot() {
  let currentDir = process.cwd(); // Бұл 'apps/next-i18n'

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

// Пайдаланушының жобасынан ('apps/next-i18n') жол табады
export function getPathFromConsumerRoot(...segments) {
  return path.join(findProjectRoot(), ...segments);
}

// Осы кітапхананың ('packages/smart-i18n-react') ішінен жол табады
export function getPathFromLibraryRoot(...segments) {
  return path.join(findLibraryRoot(), ...segments);
}