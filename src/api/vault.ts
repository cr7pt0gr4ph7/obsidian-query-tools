import { lstat, realpath } from "node:fs/promises";
import { fail, VaultQueryError } from "./errors.js";
import { buildIndex } from "./indexer.js";
import type {
	Config,
	Edge,
	ListOptions,
	NeighborOptions,
	QueryResult,
	Vault,
	VaultOptions,
} from "./types.js";
import { optionsForOpen, requestLimit, validatePath } from "./validation.js";

function result<T>(
	generation: number,
	values: T[],
	limit: number,
): QueryResult<T> {
	return {
		generation,
		data: values.slice(0, limit),
		diagnostics: [
			{
				code: "NON_ATOMIC_SNAPSHOT",
				message: "The filesystem may change during indexing.",
			},
		],
		truncated: values.length > limit,
	};
}

export async function openVault(
	root: string,
	options: VaultOptions = {},
): Promise<Vault> {
	if (typeof root !== "string" || !root)
		fail("INVALID_VAULT", "A vault root is required.");
	const config: Config = optionsForOpen(options);
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
	return {
		list(query: string, options: ListOptions = {}) {
			ensureOpen();
			const limit = requestLimit(options, config.limits.maxResults, ["limit"]);
			if (typeof query !== "string")
				fail("INVALID_QUERY", 'Expected LIST FROM "<folder>".');
			const match = /^\s*list\s+from\s+"([^"]*)"\s*$/i.exec(query);
			if (!match)
				fail("INVALID_QUERY", 'Only LIST FROM "<folder>" is supported.');
			const folder = validatePath(match[1], true);
			return result(
				generation,
				index.files.filter((file) => !folder || file.startsWith(`${folder}/`)),
				limit,
			);
		},
		neighbors(node: string, options: NeighborOptions = {}) {
			ensureOpen();
			const limit = requestLimit(options, config.limits.maxResults, [
				"limit",
				"direction",
				"types",
			]);
			validatePath(node);
			const direction = options.direction ?? "outgoing";
			if (!["outgoing", "incoming"].includes(direction))
				fail("INVALID_OPTIONS", "Invalid direction.");
			const types = options.types ?? config.edgeFields;
			if (
				!Array.isArray(types) ||
				types.some((type) => !config.edgeFields.includes(type))
			) {
				fail("INVALID_OPTIONS", "types must contain configured edge fields.");
			}
			if (!index.files.includes(node))
				fail("NOT_FOUND", "Node is not an indexed Markdown file.", node);
			const values = index.edges.filter(
				(edge) =>
					edge[direction === "outgoing" ? "source" : "target"] === node &&
					types.includes(edge.type),
			);
			return result(
				generation,
				values.map((edge: Edge) => ({ ...edge })),
				limit,
			);
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
