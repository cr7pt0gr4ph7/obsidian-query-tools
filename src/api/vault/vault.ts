import { lstat, realpath } from "node:fs/promises";
import { type ListOptions, list } from "../dataview/list.js";
import { findCycles, findSiblings, graphStats, listNodes, shortestPath } from "../graph/analysis.js";
import type { GraphLimits } from "../graph/config.js";
import { exportGraph } from "../graph/export.js";
import type { VaultGraph } from "../graph/graph.js";
import { neighbors } from "../graph/neighbors.js";
import { traverse } from "../graph/traverse.js";
import { runScript, type ScriptOptions } from "../script/run.js";
import { ErrorCode, VaultQueryError } from "../utils/errors.js";
import { validatePath } from "../utils/paths.js";
import { type QueryResult, result } from "../utils/result.js";
import { requestLimit } from "../utils/validation.js";
import { buildIndex } from "./indexer.js";
import { optionsForOpen } from "./validation.js";

/**
 * Open and index a local Obsidian vault for read-only queries.
 * @param root Path to the vault directory.
 * @param options Optional edge-field configuration and resource limits.
 * @returns A vault API context with an initial index generation.
 */
export async function openVault(root: string, options: VaultOptions = {}): Promise<Vault> {
	if (typeof root !== "string" || !root) {
		throw new VaultQueryError(ErrorCode.INVALID_VAULT, "A vault root is required.");
	}
	const config = optionsForOpen(options);
	let canonical: string;
	try {
		canonical = await realpath(root);
		if (!(await lstat(canonical)).isDirectory()) {
			throw new VaultQueryError(ErrorCode.INVALID_VAULT, "Vault root must be a directory.");
		}
	} catch (error) {
		if (error instanceof VaultQueryError) {
			throw error;
		}
		throw new VaultQueryError(ErrorCode.INVALID_VAULT, "Vault root is not an accessible directory.");
	}
	let index = await buildIndex(canonical, config);
	let generation = 1;
	let closed = false;
	let refreshing = false;
	function ensureOpen() {
		if (closed) {
			throw new VaultQueryError(ErrorCode.VAULT_CLOSED, "Vault is closed.");
		}
	}
	const graph: VaultGraph = {
		traverse(node, options = {}) {
			ensureOpen();
			return traverse(index.graph, generation, config.graph, config.limits.maxResults, node, options);
		},
		path(from, to, options = {}) {
			ensureOpen();
			return shortestPath(index.graph, generation, config.graph, config.limits.maxResults, from, to, options);
		},
		siblings(node, options = {}) {
			ensureOpen();
			return findSiblings(index.graph, generation, config.graph, config.limits.maxResults, node, options);
		},
		cycles(options = {}) {
			ensureOpen();
			return findCycles(index.graph, generation, config.graph, config.limits.maxResults, options);
		},
		nodes(options = {}) {
			ensureOpen();
			return listNodes(index.graph, generation, config.graph, config.limits.maxResults, options);
		},
		stats(options = {}) {
			ensureOpen();
			return graphStats(index.graph, generation, config.graph, options.types);
		},
		export(options = {}) {
			ensureOpen();
			return exportGraph(index.graph, generation, config.graph, options);
		},
		neighbors(node: string, options = {}) {
			ensureOpen();
			return neighbors(index.graph, generation, config.graph, config.limits.maxResults, node, options);
		},
	};
	function checkFile(value: string | undefined) {
		if (value === undefined) {
			return;
		}
		const file = validatePath(value);
		if (!file.toLowerCase().endsWith(".md")) {
			throw new VaultQueryError(ErrorCode.INVALID_PATH, "Current-file context must be a Markdown path.");
		}
		if (!index.graph.files.includes(file)) {
			throw new VaultQueryError(ErrorCode.NOT_FOUND, "Current-file context was not found in the vault.", file);
		}
	}
	return {
		list(query, options = {}) {
			ensureOpen();
			const limit = requestLimit(options, config.limits.maxResults, ["limit", "file"]);
			checkFile(options.file);
			return list(index.graph.files, generation, query, limit);
		},
		async script(source, options = {}) {
			ensureOpen();
			if (!config.unsafeJavaScript) {
				throw new VaultQueryError(
					ErrorCode.UNSUPPORTED_FEATURE,
					"JavaScript execution is disabled; open the vault with unsafeJavaScript to enable it.",
				);
			}
			const { timeoutMs, ...rest } = options;
			const limit = requestLimit(rest, config.limits.maxResults, ["limit", "file"]);
			checkFile(options.file);
			const files = index.graph.files;
			const at = generation;
			const values = await runScript(
				source,
				{
					...(options.file === undefined ? {} : { current: options.file }),
					paths: () => [...files],
					list: (query) => list(files, at, query, config.limits.maxResults).data,
					neighbors: (path, opts = {}) =>
						neighbors(index.graph, at, config.graph, config.limits.maxResults, path, opts).data,
				},
				timeoutMs,
			);
			return result(at, values, limit);
		},
		graph() {
			ensureOpen();
			return graph;
		},
		async refresh() {
			ensureOpen();
			if (refreshing) {
				throw new VaultQueryError(ErrorCode.REFRESH_IN_PROGRESS, "A refresh is already in progress.");
			}
			refreshing = true;
			try {
				const next = await buildIndex(canonical, config);
				ensureOpen();
				index = next;
				return ++generation;
			} finally {
				refreshing = false;
			}
		},
		close() {
			closed = true;
		},
	};
} /** Resource limits applied while reading and querying a vault. */

export interface VaultLimits {
	/** Maximum filesystem directory entries examined. */
	maxEntries: number;
	/** Maximum Markdown files indexed. */
	maxFiles: number;
	/** Maximum size in bytes of an individual Markdown file. */
	maxFileBytes: number;
	/** Maximum results returned by any query. */
	maxResults: number;
}
/** Optional configuration for opening a local vault. */

export interface VaultOptions {
	/** Frontmatter fields whose values are interpreted as directed Markdown edges. */
	edgeFields?: string[];
	/**
	 * Maps configured fields to opposite types; each `A -field-> B` also yields an
	 * implied `B -opposite-> A` edge (flagged `implied`), unless already declared.
	 */
	/** Also accept `[[Note]]`, `[[Folder/Note|alias]]` and `[[Note#heading]]` edge values. */
	allowWikilinks?: boolean;
	oppositeFields?: Record<string, string>;
	/** Positive resource-limit overrides; each value may lower or raise its default. */
	limits?: Partial<VaultLimits & GraphLimits>;
	/**
	 * UNSAFE: allow `script()` to execute caller-supplied JavaScript in-process.
	 * Not a sandbox; never enable for untrusted input. Defaults to false.
	 */
	unsafeJavaScript?: boolean;
} /** Read-only operations over one open vault and its published index. */

export interface Vault {
	/**
	 * List Markdown paths using the supported `LIST FROM "<folder>"` subset.
	 * @param query Query text.
	 * @param options Result limit and optional validated file context.
	 */
	list(query: string, options?: ListOptions): QueryResult<string>;
	/**
	 * UNSAFE: execute caller-supplied JavaScript with a read-only `dv` helper.
	 * Fails with `UNSUPPORTED_FEATURE` unless opened with `unsafeJavaScript: true`.
	 * @param source Async function body; its returned value is the result.
	 */
	script(source: string, options?: ScriptOptions): Promise<QueryResult<unknown>>;
	/** Obtain a graph view that follows the vault's current generation and closes with the vault. */
	graph(): VaultGraph;
	/** Build and publish a replacement index, returning its new generation number. */
	refresh(): Promise<number>;
	/** Close the vault and invalidate subsequent operations. */
	close(): void;
}
