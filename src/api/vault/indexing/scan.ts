import { constants } from "node:fs";
import type { FileHandle } from "node:fs/promises";
import { lstat, open, opendir } from "node:fs/promises";
import path from "node:path";
import type { Edge } from "../../graph/graph.js";
import { Errors } from "../../utils/errors.js";
import { validatePath } from "../../utils/paths.js";
import type { Config } from "../types.js";
import { readMarkdownFile, signature } from "./files.js";
import { readEdges } from "./frontmatter.js";

export interface ScannedIndex {
	files: string[];
	edges: Edge[];
	pending: Set<Edge>;
}

const fdPath = (handle: FileHandle): string => `/proc/self/fd/${handle.fd}`;

export async function scanVault(root: string, config: Config): Promise<ScannedIndex> {
	const files: string[] = [];
	const edges: Edge[] = [];
	const pending = new Set<Edge>();
	let entries = 0;
	async function visit(directory: FileHandle, relativePath: string): Promise<void> {
		const before = await directory.stat();
		const dir = await opendir(fdPath(directory));
		for await (const entry of dir) {
			if (++entries > config.limits.maxEntries) {
				throw Errors.Limits.Exceeded("Directory entry limit exceeded.");
			}
			const name = relativePath ? `${relativePath}/${entry.name}` : entry.name;
			validatePath(name);
			if (entry.isSymbolicLink()) {
				throw Errors.Files.UnsafePath("Symlinks are not allowed.", name);
			}
			if (entry.isDirectory()) {
				const anchored = path.join(fdPath(directory), entry.name);
				const original = await lstat(anchored);
				if (!original.isDirectory() || original.isSymbolicLink()) {
					throw Errors.Files.UnsafePath("Symlinks and special files are not allowed.", name);
				}
				const child = await open(anchored, constants.O_RDONLY | constants.O_DIRECTORY | constants.O_NOFOLLOW);
				try {
					if (signature(original) !== signature(await child.stat())) {
						throw Errors.Vault.Changed("Directory changed while indexing.", name);
					}
					await visit(child, name);
					const current = await lstat(anchored);
					if (!current.isDirectory() || signature(current) !== signature(await child.stat())) {
						throw Errors.Vault.Changed("Directory changed while indexing.", name);
					}
				} finally {
					await child.close();
				}
			} else if (entry.isFile()) {
				if (!name.toLowerCase().endsWith(".md")) {
					continue;
				}
				if (files.length >= config.limits.maxFiles) {
					throw Errors.Limits.Exceeded("Markdown file limit exceeded.");
				}
				const contents = await readMarkdownFile(directory, entry.name, name, config.limits.maxFileBytes);
				files.push(name);
				readEdges(
					contents,
					name,
					config.graph.edgeFields,
					config.graph.limits.maxEdges,
					edges,
					config.graph.wikilinks,
					pending,
				);
			} else {
				throw Errors.Files.UnsafePath("Special files are not allowed.", name);
			}
		}
		const after = await directory.stat();
		if (signature(before) !== signature(after)) {
			throw Errors.Vault.Changed("Directory changed while indexing.", relativePath);
		}
	}
	try {
		if (process.platform !== "linux" || constants.O_NOFOLLOW === undefined || constants.O_DIRECTORY === undefined) {
			throw Errors.Platform.Unsupported("Linux with /proc/self/fd and O_NOFOLLOW is required.");
		}
		const original = await lstat(root);
		const directory = await open(root, constants.O_RDONLY | constants.O_DIRECTORY | constants.O_NOFOLLOW);
		try {
			if (signature(original) !== signature(await directory.stat())) {
				throw Errors.Vault.Changed("Vault root changed while indexing.");
			}
			await visit(directory, "");
			if (signature(await lstat(root)) !== signature(await directory.stat())) {
				throw Errors.Vault.Changed("Vault root changed while indexing.");
			}
		} finally {
			await directory.close();
		}
	} catch (error) {
		if (Errors.is(error)) {
			throw error;
		}
		throw Errors.Vault.ReadError("Could not read the vault; it may be unreadable or changing.");
	}
	return { files, edges, pending };
}
