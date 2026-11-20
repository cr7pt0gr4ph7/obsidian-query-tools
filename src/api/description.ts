import { exportFormats } from "./graph/export.js";
import { ErrorCode } from "./utils/errors.js";
import { defaultLimits } from "./vault/validation.js";

/** Machine-readable summary of what this tool supports. */
export interface Description {
	/** Vault operations shared by API, CLI and MCP. */
	operations: { name: string; summary: string; cli: string }[];
	/** Graph export formats. */
	exportFormats: string[];
	/** Default resource limits. */
	defaultLimits: Record<string, number>;
	/** Stable error codes. */
	errorCodes: string[];
	/** Query forms accepted by the `list`/`query` operation. */
	queryGrammar: string[];
	/** Vault-opening options and their meaning. */
	openOptions: Record<string, string>;
}

/** Describe supported operations, options, limits and error codes without opening a vault. */
export function describe(): Description {
	return {
		operations: [
			{ name: "list", summary: 'LIST FROM "<folder>" query', cli: "query" },
			{
				name: "neighbors",
				summary: "direct typed edges",
				cli: "neighbors <path>",
			},
			{
				name: "traverse",
				summary: "breadth-first reachability",
				cli: "graph traverse <path>",
			},
			{
				name: "path",
				summary: "shortest edge path",
				cli: "graph path <from> <to>",
			},
			{
				name: "cycles",
				summary: "mutually reachable groups",
				cli: "graph cycles",
			},
			{ name: "nodes", summary: "paths by role", cli: "graph nodes" },
			{ name: "stats", summary: "graph counts", cli: "graph stats" },
			{ name: "export", summary: "serialize the graph", cli: "graph export" },
			{
				name: "refresh",
				summary: "rebuild the index",
				cli: "(MCP and API only)",
			},
			{
				name: "script",
				summary: "UNSAFE trusted JavaScript",
				cli: "query --type dataviewjs --unsafe-allow-js",
			},
		],
		exportFormats: [...exportFormats],
		defaultLimits: { ...defaultLimits },
		errorCodes: Object.values(ErrorCode).sort(),
		queryGrammar: ['LIST FROM "<folder>"'],
		openOptions: {
			edgeFields: "frontmatter fields interpreted as edges (--edge-field)",
			oppositeFields: "field to implied reverse type (--opposite field:type)",
			allowWikilinks: "accept [[wikilink]] values (--allow-wikilinks)",
			limits: "resource limit overrides",
			unsafeJavaScript: "UNSAFE: enable script() (--unsafe-allow-js on query)",
		},
	};
}
