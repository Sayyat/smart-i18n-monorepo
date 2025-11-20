import { glob } from "glob";

export const toArray = (v: any) => Array.isArray(v) ? v : (v ? [v] : [])
export const deriveOutputIgnore = (output?: string | ((language: string, namespace?: string) => string)) => {
	if (!output || typeof output !== 'string') return []
	return [output.replace(/\{\{[^}]+\}\}/g, '*')]
}
// helper to expand one or many glob patterns
export const expandGlobs = async (patterns: string | string[] = []) => {
	const arr = toArray(patterns)
	const sets = await Promise.all(arr.map(p => glob(p || '', { nodir: true })))
	return Array.from(new Set(sets.flat()))
}
