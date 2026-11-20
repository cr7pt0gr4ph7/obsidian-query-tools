import type { Edge } from "./graph.js";

/** Indexed Markdown files and their configured directed relationships. */

export interface GraphIndex {
	/** Sorted vault-relative Markdown paths. */
	files: string[];
	/** Sorted directed edges extracted from configured frontmatter fields. */
	edges: Edge[];
}
