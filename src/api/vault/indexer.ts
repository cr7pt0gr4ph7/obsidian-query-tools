import { constants } from "node:fs";
import type { Stats } from "node:fs";
import { lstat, open, opendir } from "node:fs/promises";
import type { FileHandle } from "node:fs/promises";
import path from "node:path";
import { parseDocument } from "yaml";
import { VaultQueryError } from "../utils/errors.js";
import type { Edge } from "../graph/graph.js";
import type { GraphIndex } from "../graph/indexing.js";
import { validatePath } from "../utils/paths.js";
import type { Config, VaultIndex } from "./types.js";

const compare = (a: string, b: string): number => (a < b ? -1 : a > b ? 1 : 0);
const fdPath = (handle: FileHandle): string => `/proc/self/fd/${handle.fd}`;

function signature(stat: Stats): string {
	return `${stat.dev}:${stat.ino}:${stat.size}:${stat.mtimeMs}:${stat.ctimeMs}`;
}

async function readFile(
	parent: FileHandle,
	name: string,
	relativePath: string,
	limit: number,
): Promise<string> {
	const anchored = path.join(fdPath(parent), name);
	const stat = await lstat(anchored);
	if (!stat.isFile() || stat.isSymbolicLink()) {
		throw new VaultQueryError(
			"UNSAFE_PATH",
			"Symlinks and special files are not allowed.",
			relativePath,
		);
	}
	if (stat.size > limit)
		throw new VaultQueryError(
			"LIMIT_EXCEEDED",
			"Markdown file exceeds the byte limit.",
			relativePath,
		);
	const file = await open(
		anchored,
		constants.O_RDONLY | constants.O_NOFOLLOW | constants.O_NONBLOCK,
	);
	try {
		const before = await file.stat();
		if (!before.isFile() || signature(stat) !== signature(before)) {
			throw new VaultQueryError(
				"VAULT_CHANGED",
				"File changed while indexing.",
				relativePath,
			);
		}
		const buffer = Buffer.alloc(before.size + 1);
		let length = 0;
		while (length < buffer.length) {
			const { bytesRead } = await file.read(
				buffer,
				length,
				buffer.length - length,
				length,
			);
			if (!bytesRead) break;
			length += bytesRead;
		}
		if (length > limit)
			throw new VaultQueryError(
				"LIMIT_EXCEEDED",
				"Markdown file exceeds the byte limit.",
				relativePath,
			);
		const after = await file.stat();
		const current = await lstat(anchored);
		if (
			!current.isFile() ||
			signature(before) !== signature(after) ||
			signature(after) !== signature(current)
		) {
			throw new VaultQueryError(
				"VAULT_CHANGED",
				"File changed while indexing.",
				relativePath,
			);
		}
		try {
			return new TextDecoder("utf-8", { fatal: true }).decode(
				buffer.subarray(0, length),
			);
		} catch {
			throw new VaultQueryError(
				"INVALID_ENCODING",
				"Markdown file is not valid UTF-8.",
				relativePath,
			);
		}
	} finally {
		await file.close();
	}
}

function readEdges(
	contents: string,
	relativePath: string,
	fields: string[],
	maxEdges: number,
	edges: Edge[],
	wikilinks: boolean,
	pending: Set<Edge>,
): void {
	const lines = contents.split(/\r?\n/);
	if (lines[0] !== "---") return;
	const end = lines.indexOf("---", 1);
	if (end < 0)
		throw new VaultQueryError(
			"INVALID_FRONTMATTER",
			"Unclosed frontmatter.",
			relativePath,
		);
	const document = parseDocument(lines.slice(1, end).join("\n"), {
		uniqueKeys: true,
	});
	if (document.errors.length || document.warnings.length) {
		throw new VaultQueryError(
			"INVALID_FRONTMATTER",
			"Invalid or unsupported YAML frontmatter.",
			relativePath,
		);
	}
	let frontmatter: unknown;
	try {
		frontmatter = document.toJS({ maxAliasCount: 0 });
	} catch {
		throw new VaultQueryError(
			"INVALID_FRONTMATTER",
			"Unsupported YAML frontmatter.",
			relativePath,
		);
	}
	if (frontmatter === null) return;
	if (typeof frontmatter !== "object" || Array.isArray(frontmatter)) {
		throw new VaultQueryError(
			"INVALID_FRONTMATTER",
			"Frontmatter must be a mapping.",
			relativePath,
		);
	}
	for (const type of fields) {
		if (!Object.hasOwn(frontmatter, type)) continue;
		const value: unknown = Reflect.get(frontmatter, type);
		const targets = Array.isArray(value) ? value : [value];
		for (const target of targets) {
			let link: string | undefined;
			if (wikilinks && typeof target === "string") {
				const match =
					/^\[\[([^\[\]|#]+)(?:#[^\[\]|]*)?(?:\|[^\[\]]*)?\]\]$/.exec(
						target.trim(),
					);
				if (match) link = match[1].trim();
			}
			if (
				link === undefined &&
				(typeof target !== "string" ||
					target.includes("[[") ||
					target.includes("]]"))
			) {
				throw new VaultQueryError(
					"INVALID_EDGE",
					"Edge fields must contain vault-relative Markdown paths.",
					relativePath,
				);
			}
			let normalized;
			try {
				normalized = validatePath(link ?? (target as string));
			} catch {
				throw new VaultQueryError(
					"INVALID_EDGE",
					"Edge fields must contain vault-relative Markdown paths.",
					relativePath,
				);
			}
			if (!normalized.toLowerCase().endsWith(".md")) normalized += ".md";
			if (edges.length >= maxEdges)
				throw new VaultQueryError(
					"LIMIT_EXCEEDED",
					"Edge limit exceeded.",
					relativePath,
				);
			const edge: Edge = { source: relativePath, target: normalized, type };
			if (link !== undefined) pending.add(edge);
			edges.push(edge);
		}
	}
}

/**
 * Build a bounded index for a vault without executing or modifying its contents.
 * @param root Canonical local vault directory.
 * @param config Validated index settings and resource limits.
 * @returns A complete index; failures prevent partial publication.
 */
export async function buildIndex(
	root: string,
	config: Config,
): Promise<VaultIndex> {
	const files: string[] = [];
	const edges: Edge[] = [];
	const pending = new Set<Edge>();
	let entries = 0;
	async function visit(
		directory: FileHandle,
		relativePath: string,
	): Promise<void> {
		const before = await directory.stat();
		const dir = await opendir(fdPath(directory));
		for await (const entry of dir) {
			if (++entries > config.limits.maxEntries)
				throw new VaultQueryError(
					"LIMIT_EXCEEDED",
					"Directory entry limit exceeded.",
				);
			const name = relativePath ? `${relativePath}/${entry.name}` : entry.name;
			validatePath(name);
			if (entry.isSymbolicLink())
				throw new VaultQueryError(
					"UNSAFE_PATH",
					"Symlinks are not allowed.",
					name,
				);
			if (entry.isDirectory()) {
				const anchored = path.join(fdPath(directory), entry.name);
				const original = await lstat(anchored);
				if (!original.isDirectory() || original.isSymbolicLink()) {
					throw new VaultQueryError(
						"UNSAFE_PATH",
						"Symlinks and special files are not allowed.",
						name,
					);
				}
				const child = await open(
					anchored,
					constants.O_RDONLY | constants.O_DIRECTORY | constants.O_NOFOLLOW,
				);
				try {
					if (signature(original) !== signature(await child.stat())) {
						throw new VaultQueryError(
							"VAULT_CHANGED",
							"Directory changed while indexing.",
							name,
						);
					}
					await visit(child, name);
					const current = await lstat(anchored);
					if (
						!current.isDirectory() ||
						signature(current) !== signature(await child.stat())
					) {
						throw new VaultQueryError(
							"VAULT_CHANGED",
							"Directory changed while indexing.",
							name,
						);
					}
				} finally {
					await child.close();
				}
			} else if (entry.isFile()) {
				if (!name.toLowerCase().endsWith(".md")) continue;
				if (files.length >= config.limits.maxFiles)
					throw new VaultQueryError(
						"LIMIT_EXCEEDED",
						"Markdown file limit exceeded.",
					);
				const contents = await readFile(
					directory,
					entry.name,
					name,
					config.limits.maxFileBytes,
				);
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
			} else
				throw new VaultQueryError(
					"UNSAFE_PATH",
					"Special files are not allowed.",
					name,
				);
		}
		const after = await directory.stat();
		if (signature(before) !== signature(after))
			throw new VaultQueryError(
				"VAULT_CHANGED",
				"Directory changed while indexing.",
				relativePath,
			);
	}
	try {
		if (
			process.platform !== "linux" ||
			constants.O_NOFOLLOW === undefined ||
			constants.O_DIRECTORY === undefined
		) {
			throw new VaultQueryError(
				"UNSUPPORTED_PLATFORM",
				"Linux with /proc/self/fd and O_NOFOLLOW is required.",
			);
		}
		const original = await lstat(root);
		const directory = await open(
			root,
			constants.O_RDONLY | constants.O_DIRECTORY | constants.O_NOFOLLOW,
		);
		try {
			if (signature(original) !== signature(await directory.stat())) {
				throw new VaultQueryError(
					"VAULT_CHANGED",
					"Vault root changed while indexing.",
				);
			}
			await visit(directory, "");
			if (signature(await lstat(root)) !== signature(await directory.stat())) {
				throw new VaultQueryError(
					"VAULT_CHANGED",
					"Vault root changed while indexing.",
				);
			}
		} finally {
			await directory.close();
		}
	} catch (error) {
		if (error instanceof VaultQueryError) throw error;
		throw new VaultQueryError(
			"VAULT_READ_ERROR",
			"Could not read the vault; it may be unreadable or changing.",
		);
	}
	files.sort(compare);
	const paths = new Set(files);
	if (pending.size) {
		const byName = new Map<string, string[]>();
		for (const file of files) {
			const name = file.slice(file.lastIndexOf("/") + 1).toLowerCase();
			byName.set(name, [...(byName.get(name) ?? []), file]);
		}
		for (const edge of pending) {
			if (paths.has(edge.target)) continue;
			const matches = byName.get(edge.target.toLowerCase()) ?? [];
			if (matches.length > 1)
				throw new VaultQueryError(
					"INVALID_EDGE",
					"Wikilink target is ambiguous; use a vault-relative path.",
					edge.source,
				);
			if (matches.length === 1) edge.target = matches[0];
		}
	}
	for (const edge of edges) {
		if (!paths.has(edge.target))
			throw new VaultQueryError(
				"UNRESOLVED_EDGE",
				"Edge target is not an indexed Markdown file.",
				edge.source,
			);
	}
	const declared = new Set(
		edges.map((e) => `${e.source}\0${e.target}\0${e.type}`),
	);
	for (const edge of [...edges]) {
		const opposite = config.graph.opposites[edge.type];
		if (opposite === undefined) continue;
		const key = `${edge.target}\0${edge.source}\0${opposite}`;
		if (declared.has(key)) continue;
		declared.add(key);
		if (edges.length >= config.graph.limits.maxEdges)
			throw new VaultQueryError(
				"LIMIT_EXCEEDED",
				"Edge limit exceeded.",
				edge.source,
			);
		edges.push({
			source: edge.target,
			target: edge.source,
			type: opposite,
			implied: true,
		});
	}
	edges.sort(
		(a, b) =>
			compare(a.source, b.source) ||
			compare(a.target, b.target) ||
			compare(a.type, b.type),
	);
	const graph: GraphIndex = { files, edges };
	return { graph };
}
