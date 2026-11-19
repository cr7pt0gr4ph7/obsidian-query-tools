import { lstat, realpath } from "node:fs/promises";
import { fail, VaultQueryError } from "../errors.js";
import { list } from "../dataview/list.js";
import { neighbors } from "../graph/neighbors.js";
import { requestLimit, validatePath } from "../validation.js";
import type { Vault, VaultOptions } from "./types.js";
import { buildIndex } from "./indexer.js";
import { optionsForOpen } from "./validation.js";

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
	const graph = {
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
	return {
		list(query, options = {}) {
			ensureOpen();
			const limit = requestLimit(options, config.limits.maxResults, [
				"limit",
				"file",
			]);
			if (options.file !== undefined) {
				const file = validatePath(options.file);
				if (!file.toLowerCase().endsWith(".md"))
					fail("INVALID_PATH", "Current-file context must be a Markdown path.");
				if (!index.graph.files.includes(file))
					fail(
						"NOT_FOUND",
						"Current-file context was not found in the vault.",
						file,
					);
			}
			return list(index.graph.files, generation, query, limit);
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
