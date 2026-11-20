import { Errors } from "../utils/errors.js";
import { validatePath } from "../utils/paths.js";
import { type QueryResult, result } from "../utils/result.js";
import { requestLimit } from "../utils/validation.js";
import { edgeTypes, type GraphConfig } from "./config.js";
import type { Edge, NeighborOptions } from "./graph.js";
import type { GraphIndex } from "./indexing.js";

/**
 * Return direct edges incident to a node, filtered by direction and field type.
 * @param index Current graph index.
 * @param generation Index generation used by the query.
 * @param config Graph configuration, including indexed edge fields.
 * @param maxResults Maximum configured result count.
 * @param node Vault-relative Markdown path to query.
 * @param options Direction, edge-type, and result-limit filters.
 */
export function neighbors(
	index: GraphIndex,
	generation: number,
	config: GraphConfig,
	maxResults: number,
	node: string,
	options: NeighborOptions = {},
): QueryResult<Edge> {
	const limit = requestLimit(options, maxResults, ["limit", "direction", "types"]);
	validatePath(node);
	const direction = options.direction ?? "outgoing";
	if (!["outgoing", "incoming"].includes(direction)) {
		throw Errors.Options.InvalidOptions("Invalid direction.");
	}
	const types = options.types ?? edgeTypes(config);
	if (!Array.isArray(types) || types.some((type) => !edgeTypes(config).includes(type))) {
		throw Errors.Options.InvalidOptions("types must contain configured edge fields.");
	}
	if (!index.files.includes(node)) {
		throw Errors.Graph.UnresolvedNode("Node is not an indexed Markdown file.", node);
	}
	const values = index.edges.filter(
		(edge) => edge[direction === "outgoing" ? "source" : "target"] === node && types.includes(edge.type),
	);
	return result(
		generation,
		values.map((edge) => ({ ...edge })),
		limit,
	);
}
