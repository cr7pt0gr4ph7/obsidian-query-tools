import { readFile, stat } from "node:fs/promises";
import { Errors, type VaultOptions } from "../api/index.js";

const maxConfigBytes = 65_536;
const allowedKeys = ["edgeFields", "oppositeFields", "allowWikilinks", "limits"];

/** Load trusted open options from an explicitly named JSON file. */
export async function loadConfig(file: string): Promise<VaultOptions> {
	let text: string;
	try {
		const info = await stat(file);
		if (!info.isFile() || info.size > maxConfigBytes) {
			throw new Error("unusable");
		}
		text = await readFile(file, "utf8");
	} catch {
		throw Errors.Options.InvalidOptions("--config must name a readable JSON file of at most 64 KiB.");
	}
	let parsed: unknown;
	try {
		parsed = JSON.parse(text);
	} catch {
		throw Errors.Options.InvalidOptions("Config is not valid JSON.");
	}
	if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
		throw Errors.Options.InvalidOptions("Config must be an object.");
	}
	for (const key of Object.keys(parsed)) {
		if (!allowedKeys.includes(key)) {
			throw Errors.Options.InvalidOptions(`Unsupported config key: ${key}`);
		}
	}
	return parsed as VaultOptions;
}

/** Combine file settings with command-line flags; flags add to or override the file. */
export function mergeOptions(file: VaultOptions, flags: VaultOptions): VaultOptions {
	const edgeFields = [...(file.edgeFields ?? [])];
	for (const field of flags.edgeFields ?? []) {
		if (!edgeFields.includes(field)) {
			edgeFields.push(field);
		}
	}
	const merged: VaultOptions = { ...file, edgeFields };
	const opposites = { ...file.oppositeFields, ...flags.oppositeFields };
	if (Object.keys(opposites).length) {
		merged.oppositeFields = opposites;
	}
	if (flags.allowWikilinks) {
		merged.allowWikilinks = true;
	}
	return merged;
}
