import { parseDocument } from "yaml";
import type { Edge } from "../../graph/graph.js";
import { Errors } from "../../utils/errors.js";
import { validatePath } from "../../utils/paths.js";

/**
 * Parse configured edge values from a Markdown file's YAML frontmatter.
 *
 * @param contents Markdown file contents.
 * @param relativePath Vault-relative path used in diagnostics and edge sources.
 * @param fields Frontmatter fields interpreted as edge types.
 * @param maxEdges Maximum number of declared edges allowed.
 * @param edges Collection receiving parsed edges.
 * @param wikilinks Whether supported wikilink values are accepted.
 * @param pending Edges awaiting wikilink target resolution.
 * @returns Nothing; appends parsed edges to the supplied collections.
 */
export function readEdges(
	contents: string,
	relativePath: string,
	fields: string[],
	maxEdges: number,
	edges: Edge[],
	wikilinks: boolean,
	pending: Set<Edge>,
): void {
	const lines = contents.split(/\r?\n/);
	if (lines[0] !== "---") {
		return;
	}
	const end = lines.indexOf("---", 1);
	if (end < 0) {
		throw Errors.Frontmatter.InvalidFrontmatter("Unclosed frontmatter.", relativePath);
	}
	const document = parseDocument(lines.slice(1, end).join("\n"), {
		uniqueKeys: true,
	});
	if (document.errors.length || document.warnings.length) {
		throw Errors.Frontmatter.InvalidFrontmatter("Invalid or unsupported YAML frontmatter.", relativePath);
	}
	let frontmatter: unknown;
	try {
		frontmatter = document.toJS({ maxAliasCount: 0 });
	} catch {
		throw Errors.Frontmatter.InvalidFrontmatter("Unsupported YAML frontmatter.", relativePath);
	}
	if (frontmatter === null) {
		return;
	}
	if (typeof frontmatter !== "object" || Array.isArray(frontmatter)) {
		throw Errors.Frontmatter.InvalidFrontmatter("Frontmatter must be a mapping.", relativePath);
	}
	for (const type of fields) {
		if (!Object.hasOwn(frontmatter, type)) {
			continue;
		}
		const value: unknown = Reflect.get(frontmatter, type);
		const targets = Array.isArray(value) ? value : [value];
		for (const target of targets) {
			let link: string | undefined;
			if (wikilinks && typeof target === "string") {
				const match = /^\[\[([^[\]|#]+)(?:#[^[\]|]*)?(?:\|[^[\]]*)?\]\]$/.exec(target.trim());
				if (match) {
					link = match[1].trim();
				}
			}
			if (link === undefined && (typeof target !== "string" || target.includes("[[") || target.includes("]]"))) {
				throw Errors.Graph.InvalidEdge("Edge fields must contain vault-relative Markdown paths.", relativePath);
			}
			let normalized: string;
			try {
				normalized = validatePath(link ?? (target as string));
			} catch {
				throw Errors.Graph.InvalidEdge("Edge fields must contain vault-relative Markdown paths.", relativePath);
			}
			if (!normalized.toLowerCase().endsWith(".md")) {
				normalized += ".md";
			}
			if (edges.length >= maxEdges) {
				throw Errors.Limits.Exceeded("Edge limit exceeded.", relativePath);
			}
			const edge: Edge = { source: relativePath, target: normalized, type };
			if (link !== undefined) {
				pending.add(edge);
			}
			edges.push(edge);
		}
	}
}
