import { fail } from "../errors.js";
import { result, type QueryResult } from "../utils/result.js";
import { requestLimit, validatePath } from "../validation.js";
import type {
	GraphConfig,
	GraphIndex,
	Edge,
	NeighborOptions,
} from "./types.js";

export function neighbors(
	index: GraphIndex,
	generation: number,
	config: GraphConfig,
	maxResults: number,
	node: string,
	options: NeighborOptions = {},
): QueryResult<Edge> {
	const limit = requestLimit(options, maxResults, [
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
		values.map((edge) => ({ ...edge })),
		limit,
	);
}
