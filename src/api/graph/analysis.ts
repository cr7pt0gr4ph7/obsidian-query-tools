import { ErrorCode as EC, VaultQueryError } from "../utils/errors.js";
import { validatePath } from "../utils/paths.js";
import { type QueryResult, result } from "../utils/result.js";
import { requestLimit } from "../utils/validation.js";
import { edgeTypes, type GraphConfig } from "./config.js";
import type {
	CyclesOptions,
	Edge,
	GraphStats,
	NodesOptions,
	PathOptions,
	Sibling,
	SiblingsOptions,
} from "./graph.js";
import type { GraphIndex } from "./indexing.js";

export function selectTypes(config: GraphConfig, types?: string[]): string[] {
	const selected = types ?? edgeTypes(config);
	if (
		!Array.isArray(selected) ||
		selected.some((type) => !edgeTypes(config).includes(type))
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

/** Summary counts for the selected edge types. */
export function graphStats(
	index: GraphIndex,
	generation: number,
	config: GraphConfig,
	types?: string[],
): GraphStats {
	const selected = selectTypes(config, types);
	const edges = index.edges.filter((edge) => selected.includes(edge.type));
	const edgesByType: Record<string, number> = {};
	for (const type of [...selected].sort()) edgesByType[type] = 0;
	const out = new Set<string>();
	const into = new Set<string>();
	for (const edge of edges) {
		edgesByType[edge.type]++;
		out.add(edge.source);
		into.add(edge.target);
	}
	let sources = 0;
	let sinks = 0;
	let isolated = 0;
	for (const file of index.files) {
		const hasOut = out.has(file);
		const hasIn = into.has(file);
		if (!hasOut && !hasIn) isolated++;
		else if (hasOut && !hasIn) sources++;
		else if (!hasOut && hasIn) sinks++;
	}
	return {
		generation,
		nodeCount: index.files.length,
		edgeCount: edges.length,
		edgesByType,
		sources,
		sinks,
		isolated,
		diagnostics: [
			{
				code: "NON_ATOMIC_SNAPSHOT",
				message: "The filesystem may change during indexing.",
			},
		],
		truncated: false,
	};
}

const roles = ["all", "sources", "sinks", "isolated"] as const;

/** Sorted node paths filtered by their role in the selected edges. */
export function listNodes(
	index: GraphIndex,
	generation: number,
	config: GraphConfig,
	maxResults: number,
	options: NodesOptions = {},
): QueryResult<string> {
	const limit = requestLimit(options, maxResults, ["limit", "types", "role"]);
	const role = options.role ?? "all";
	if (!roles.includes(role))
		throw new VaultQueryError(EC.INVALID_OPTIONS, "Invalid node role.");
	const types = selectTypes(config, options.types);
	const out = new Set<string>();
	const into = new Set<string>();
	for (const edge of index.edges) {
		if (!types.includes(edge.type)) continue;
		out.add(edge.source);
		into.add(edge.target);
	}
	const values = index.files.filter((file) => {
		const hasOut = out.has(file);
		const hasIn = into.has(file);
		switch (role) {
			case "sources":
				return hasOut && !hasIn;
			case "sinks":
				return hasIn && !hasOut;
			case "isolated":
				return !hasOut && !hasIn;
			default:
				return true;
		}
	});
	return result(generation, values, limit);
}

/** Groups of mutually reachable nodes (including self-loops), via iterative Tarjan. */
export function findCycles(
	index: GraphIndex,
	generation: number,
	config: GraphConfig,
	maxResults: number,
	options: CyclesOptions = {},
): QueryResult<string[]> {
	const limit = requestLimit(options, maxResults, ["limit", "types"]);
	const types = selectTypes(config, options.types);
	const adjacency = new Map<string, string[]>();
	const selfLoops = new Set<string>();
	for (const edge of index.edges) {
		if (!types.includes(edge.type)) continue;
		if (edge.source === edge.target) selfLoops.add(edge.source);
		const list = adjacency.get(edge.source) ?? [];
		list.push(edge.target);
		adjacency.set(edge.source, list);
	}
	const order = new Map<string, number>();
	const low = new Map<string, number>();
	const onStack = new Set<string>();
	const stack: string[] = [];
	const groups: string[][] = [];
	let counter = 0;
	for (const start of index.files) {
		if (order.has(start)) continue;
		const work: [string, number][] = [[start, 0]];
		order.set(start, counter);
		low.set(start, counter++);
		stack.push(start);
		onStack.add(start);
		while (work.length) {
			const frame = work[work.length - 1];
			const [node] = frame;
			const next = adjacency.get(node) ?? [];
			if (frame[1] < next.length) {
				const target = next[frame[1]++];
				if (!order.has(target)) {
					order.set(target, counter);
					low.set(target, counter++);
					stack.push(target);
					onStack.add(target);
					work.push([target, 0]);
				} else if (onStack.has(target)) {
					low.set(node, Math.min(low.get(node)!, order.get(target)!));
				}
				continue;
			}
			work.pop();
			if (work.length) {
				const parent = work[work.length - 1][0];
				low.set(parent, Math.min(low.get(parent)!, low.get(node)!));
			}
			if (low.get(node) === order.get(node)) {
				const group: string[] = [];
				let member: string;
				do {
					member = stack.pop()!;
					onStack.delete(member);
					group.push(member);
				} while (member !== node);
				if (group.length > 1 || selfLoops.has(group[0]))
					groups.push(group.sort());
			}
		}
	}
	groups.sort((a, b) => (a[0] < b[0] ? -1 : a[0] > b[0] ? 1 : 0));
	return result(generation, groups, limit);
}

/** Notes sharing a target ("parent") with a node through the same edge type. */
export function findSiblings(
	index: GraphIndex,
	generation: number,
	config: GraphConfig,
	maxResults: number,
	node: string,
	options: SiblingsOptions = {},
): QueryResult<Sibling> {
	const limit = requestLimit(options, maxResults, ["limit", "types"]);
	const types = selectTypes(config, options.types);
	requireNode(index, node);
	const parents = index.edges.filter(
		(edge) => edge.source === node && types.includes(edge.type),
	);
	const values: Sibling[] = [];
	for (const parent of parents) {
		for (const edge of index.edges) {
			if (
				edge.target === parent.target &&
				edge.type === parent.type &&
				edge.source !== node
			)
				values.push({
					node: edge.source,
					parent: parent.target,
					type: parent.type,
				});
		}
	}
	values.sort(
		(a, b) =>
			(a.node < b.node ? -1 : a.node > b.node ? 1 : 0) ||
			(a.parent < b.parent ? -1 : a.parent > b.parent ? 1 : 0) ||
			(a.type < b.type ? -1 : a.type > b.type ? 1 : 0),
	);
	return result(generation, values, limit);
}
