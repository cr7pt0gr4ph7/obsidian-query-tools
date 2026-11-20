import { parseDocument } from "yaml";
import type { Edge } from "../../graph/graph.js";
import { ErrorCode, VaultQueryError } from "../../utils/errors.js";
import { validatePath } from "../../utils/paths.js";

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
		throw new VaultQueryError(ErrorCode.INVALID_FRONTMATTER, "Unclosed frontmatter.", relativePath);
	}
	const document = parseDocument(lines.slice(1, end).join("\n"), {
		uniqueKeys: true,
	});
	if (document.errors.length || document.warnings.length) {
		throw new VaultQueryError(ErrorCode.INVALID_FRONTMATTER, "Invalid or unsupported YAML frontmatter.", relativePath);
	}
	let frontmatter: unknown;
	try {
		frontmatter = document.toJS({ maxAliasCount: 0 });
	} catch {
		throw new VaultQueryError(ErrorCode.INVALID_FRONTMATTER, "Unsupported YAML frontmatter.", relativePath);
	}
	if (frontmatter === null) {
		return;
	}
	if (typeof frontmatter !== "object" || Array.isArray(frontmatter)) {
		throw new VaultQueryError(ErrorCode.INVALID_FRONTMATTER, "Frontmatter must be a mapping.", relativePath);
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
				throw new VaultQueryError(
					ErrorCode.INVALID_EDGE,
					"Edge fields must contain vault-relative Markdown paths.",
					relativePath,
				);
			}
			let normalized: string;
			try {
				normalized = validatePath(link ?? (target as string));
			} catch {
				throw new VaultQueryError(
					ErrorCode.INVALID_EDGE,
					"Edge fields must contain vault-relative Markdown paths.",
					relativePath,
				);
			}
			if (!normalized.toLowerCase().endsWith(".md")) {
				normalized += ".md";
			}
			if (edges.length >= maxEdges) {
				throw new VaultQueryError(ErrorCode.LIMIT_EXCEEDED, "Edge limit exceeded.", relativePath);
			}
			const edge: Edge = { source: relativePath, target: normalized, type };
			if (link !== undefined) {
				pending.add(edge);
			}
			edges.push(edge);
		}
	}
}
