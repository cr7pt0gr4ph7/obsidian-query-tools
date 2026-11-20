import { lstat, realpath } from "node:fs/promises";
import { fail, VaultQueryError } from "../utils/errors.js";
import { runScript } from "../script/run.js";
import { result } from "../utils/result.js";
import { list } from "../dataview/list.js";
import { exportGraph } from "../graph/export.js";
import {
	findCycles,
	findSiblings,
	graphStats,
	listNodes,
	shortestPath,
} from "../graph/analysis.js";
import { traverse } from "../graph/traverse.js";
import { neighbors } from "../graph/neighbors.js";
import { requestLimit } from "../utils/validation.js";
import { validatePath } from "../utils/paths.js";
import type { VaultGraph } from "../graph/graph.js";
import type { Vault, VaultOptions } from "./types.js";
import { buildIndex } from "./indexer.js";
import { optionsForOpen } from "./validation.js";

/**
 * Open and index a local Obsidian vault for read-only queries.
 * @param root Path to the vault directory.
 * @param options Optional edge-field configuration and resource limits.
 * @returns A vault API context with an initial index generation.
 */
export async function openVault(
	root: string,
	options: VaultOptions = {},
): Promise<Vault> {
	if (typeof root !== "string" || !root)
		fail("INVALID_VAULT", "A vault root is required.");
	const config = optionsForOpen(options);
	let canonical;
	try {
		canonical = await realpath(root);
		if (!(await lstat(canonical)).isDirectory())
			fail("INVALID_VAULT", "Vault root must be a directory.");
	} catch (error) {
		if (error instanceof VaultQueryError) throw error;
		fail("INVALID_VAULT", "Vault root is not an accessible directory.");
	}
	let index = await buildIndex(canonical, config);
	let generation = 1;
	let closed = false;
	let refreshing = false;
	function ensureOpen() {
		if (closed) fail("VAULT_CLOSED", "Vault is closed.");
	}
	const graph: VaultGraph = {
		traverse(node, options = {}) {
			ensureOpen();
			return traverse(
				index.graph,
				generation,
				config.graph,
				config.limits.maxResults,
				node,
				options,
			);
		},
		path(from, to, options = {}) {
			ensureOpen();
			return shortestPath(
				index.graph,
				generation,
				config.graph,
				config.limits.maxResults,
				from,
				to,
				options,
			);
		},
		siblings(node, options = {}) {
			ensureOpen();
			return findSiblings(
				index.graph,
				generation,
				config.graph,
				config.limits.maxResults,
				node,
				options,
			);
		},
		cycles(options = {}) {
			ensureOpen();
			return findCycles(
				index.graph,
				generation,
				config.graph,
				config.limits.maxResults,
				options,
			);
		},
		nodes(options = {}) {
			ensureOpen();
			return listNodes(
				index.graph,
				generation,
				config.graph,
				config.limits.maxResults,
				options,
			);
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
			return neighbors(
				index.graph,
				generation,
				config.graph,
				config.limits.maxResults,
				node,
				options,
			);
		},
	};
	function checkFile(value: string | undefined) {
		if (value === undefined) return;
		const file = validatePath(value);
		if (!file.toLowerCase().endsWith(".md"))
			fail("INVALID_PATH", "Current-file context must be a Markdown path.");
		if (!index.graph.files.includes(file))
			fail(
				"NOT_FOUND",
				"Current-file context was not found in the vault.",
				file,
			);
	}
	return {
		list(query, options = {}) {
			ensureOpen();
			const limit = requestLimit(options, config.limits.maxResults, [
				"limit",
				"file",
			]);
			checkFile(options.file);
			return list(index.graph.files, generation, query, limit);
		},
		async script(source, options = {}) {
			ensureOpen();
			if (!config.unsafeJavaScript)
				fail(
					"UNSUPPORTED_FEATURE",
					"JavaScript execution is disabled; open the vault with unsafeJavaScript to enable it.",
				);
			const { timeoutMs, ...rest } = options;
			const limit = requestLimit(rest, config.limits.maxResults, [
				"limit",
				"file",
			]);
			checkFile(options.file);
			const files = index.graph.files;
			const at = generation;
			const values = await runScript(
				source,
				{
					...(options.file === undefined ? {} : { current: options.file }),
					paths: () => [...files],
					list: (query) =>
						list(files, at, query, config.limits.maxResults).data,
					neighbors: (path, opts = {}) =>
						neighbors(
							index.graph,
							at,
							config.graph,
							config.limits.maxResults,
							path,
							opts,
						).data,
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
			if (refreshing)
				fail("REFRESH_IN_PROGRESS", "A refresh is already in progress.");
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
}
