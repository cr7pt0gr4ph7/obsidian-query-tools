import { ErrorCode as EC, VaultQueryError } from "../utils/errors.js";
import { result, type QueryResult } from "../utils/result.js";
import { requestLimit, validatePath } from "../validation.js";
import type { GraphConfig } from "./config.js";
import type { Edge, PathOptions } from "./graph.js";
import type { GraphIndex } from "./indexing.js";

export function selectTypes(config: GraphConfig, types?: string[]): string[] {
	const selected = types ?? config.edgeFields;
	if (
		!Array.isArray(selected) ||
		selected.some((type) => !config.edgeFields.includes(type))
	)
		throw new VaultQueryError(
			EC.INVALID_OPTIONS,
			"types must contain configured edge fields.",
		);
	return selected;
}

export function requireNode(index: GraphIndex, node: string): void {
	validatePath(node);
	if (!index.files.includes(node))
		throw new VaultQueryError(
			EC.NOT_FOUND,
			"Node is not an indexed Markdown file.",
			node,
		);
}

/** Shortest outgoing (or incoming) edge path between two nodes; empty data when unreachable. */
export function shortestPath(
	index: GraphIndex,
	generation: number,
	config: GraphConfig,
	maxResults: number,
	from: string,
	to: string,
	options: PathOptions = {},
): QueryResult<Edge> {
	const limit = requestLimit(options, maxResults, [
		"limit",
		"direction",
		"types",
	]);
	const direction = options.direction ?? "outgoing";
	if (!["outgoing", "incoming"].includes(direction))
		throw new VaultQueryError(EC.INVALID_OPTIONS, "Invalid direction.");
	const types = selectTypes(config, options.types);
	requireNode(index, from);
	requireNode(index, to);
	const key = direction === "outgoing" ? "source" : "target";
	const other = direction === "outgoing" ? "target" : "source";
	const adjacency = new Map<string, Edge[]>();
	for (const edge of index.edges) {
		if (!types.includes(edge.type)) continue;
		const list = adjacency.get(edge[key]) ?? [];
		list.push(edge);
		adjacency.set(edge[key], list);
	}
	const via = new Map<string, Edge>();
	const seen = new Set([from]);
	const queue = [from];
	for (let i = 0; i < queue.length && !seen.has(to); i++) {
		for (const edge of adjacency.get(queue[i]) ?? []) {
			if (seen.has(edge[other])) continue;
			seen.add(edge[other]);
			via.set(edge[other], edge);
			queue.push(edge[other]);
		}
	}
	const path: Edge[] = [];
	for (let at = to; at !== from && via.has(at); ) {
		const edge = via.get(at)!;
		path.unshift({ ...edge });
		at = edge[key];
	}
	return result(generation, from === to || !seen.has(to) ? [] : path, limit);
}
