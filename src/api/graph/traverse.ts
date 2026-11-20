import { ErrorCode as EC, VaultQueryError } from "../utils/errors.js";
import { result, type QueryResult } from "../utils/result.js";
import { requestLimit, validatePath } from "../validation.js";
import type { GraphConfig } from "./config.js";
import type { Edge, TraverseOptions } from "./graph.js";
import type { GraphIndex } from "./indexing.js";

const maxDepthLimit = 1000;

/**
 * Breadth-first walk of directed edges from a node, visiting each node once.
 * Edges are returned in discovery order: by depth, then sorted edge order.
 */
export function traverse(
	index: GraphIndex,
	generation: number,
	config: GraphConfig,
	maxResults: number,
	node: string,
	options: TraverseOptions = {},
): QueryResult<Edge> {
	const limit = requestLimit(options, maxResults, [
		"limit",
		"direction",
		"types",
		"maxDepth",
	]);
	validatePath(node);
	const direction = options.direction ?? "outgoing";
	if (!["outgoing", "incoming"].includes(direction))
		throw new VaultQueryError(EC.INVALID_OPTIONS, "Invalid direction.");
	const types = options.types ?? config.edgeFields;
	if (
		!Array.isArray(types) ||
		types.some((type) => !config.edgeFields.includes(type))
	)
		throw new VaultQueryError(
			EC.INVALID_OPTIONS,
			"types must contain configured edge fields.",
		);
	const maxDepth = options.maxDepth ?? maxDepthLimit;
	if (
		!Number.isSafeInteger(maxDepth) ||
		maxDepth < 1 ||
		maxDepth > maxDepthLimit
	)
		throw new VaultQueryError(EC.INVALID_OPTIONS, "Invalid maxDepth.");
	if (!index.files.includes(node))
		throw new VaultQueryError(
			EC.NOT_FOUND,
			"Node is not an indexed Markdown file.",
			node,
		);
	const from = direction === "outgoing" ? "source" : "target";
	const to = direction === "outgoing" ? "target" : "source";
	const byNode = new Map<string, Edge[]>();
	for (const edge of index.edges) {
		if (!types.includes(edge.type)) continue;
		const list = byNode.get(edge[from]) ?? [];
		list.push(edge);
		byNode.set(edge[from], list);
	}
	const seen = new Set([node]);
	const values: Edge[] = [];
	let frontier = [node];
	for (let depth = 0; depth < maxDepth && frontier.length; depth++) {
		const next: string[] = [];
		for (const current of frontier) {
			for (const edge of byNode.get(current) ?? []) {
				values.push({ ...edge });
				if (!seen.has(edge[to])) {
					seen.add(edge[to]);
					next.push(edge[to]);
				}
			}
		}
		frontier = next;
	}
	return result(generation, values, limit);
}
