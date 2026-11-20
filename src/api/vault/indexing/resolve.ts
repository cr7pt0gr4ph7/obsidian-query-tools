import type { Edge } from "../../graph/graph.js";
import type { GraphIndex } from "../../graph/indexing.js";
import { ErrorCode, VaultQueryError } from "../../utils/errors.js";
import type { Config, VaultIndex } from "../types.js";
import { compare } from "./files.js";

export function resolveIndex(files: string[], edges: Edge[], pending: Set<Edge>, config: Config): VaultIndex {
	files.sort(compare);
	const paths = new Set(files);
	if (pending.size) {
		const byName = new Map<string, string[]>();
		for (const file of files) {
			const name = file.slice(file.lastIndexOf("/") + 1).toLowerCase();
			byName.set(name, [...(byName.get(name) ?? []), file]);
		}
		for (const edge of pending) {
			if (paths.has(edge.target)) {
				continue;
			}
			const matches = byName.get(edge.target.toLowerCase()) ?? [];
			if (matches.length > 1) {
				throw new VaultQueryError(
					ErrorCode.INVALID_EDGE,
					"Wikilink target is ambiguous; use a vault-relative path.",
					edge.source,
				);
			}
			if (matches.length === 1) {
				edge.target = matches[0];
			}
		}
	}
	for (const edge of edges) {
		if (!paths.has(edge.target)) {
			throw new VaultQueryError(ErrorCode.UNRESOLVED_EDGE, "Edge target is not an indexed Markdown file.", edge.source);
		}
	}
	const declared = new Set(edges.map((e) => `${e.source}\0${e.target}\0${e.type}`));
	for (const edge of [...edges]) {
		const opposite = config.graph.opposites[edge.type];
		if (opposite === undefined) {
			continue;
		}
		const key = `${edge.target}\0${edge.source}\0${opposite}`;
		if (declared.has(key)) {
			continue;
		}
		declared.add(key);
		if (edges.length >= config.graph.limits.maxEdges) {
			throw new VaultQueryError(ErrorCode.LIMIT_EXCEEDED, "Edge limit exceeded.", edge.source);
		}
		edges.push({
			source: edge.target,
			target: edge.source,
			type: opposite,
			implied: true,
		});
	}
	edges.sort((a, b) => compare(a.source, b.source) || compare(a.target, b.target) || compare(a.type, b.type));
	const graph: GraphIndex = { files, edges };
	return { graph };
}
