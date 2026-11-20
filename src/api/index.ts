/** Structured error type raised by shared API operations. */

/** Options for folder-list queries. */
export type { ListOptions } from "./dataview/list.js";

/** Describe supported operations, limits and error codes. */
export { Description, describe } from "./description.js";

/** Types for directed edges and direct-neighbor queries. */
export type { GraphLimits } from "./graph/config.js";
export type {
	CyclesOptions,
	Edge,
	ExportFormat,
	ExportOptions,
	GraphExport,
	GraphStats,
	NeighborOptions,
	NodesOptions,
	PathOptions,
	Sibling,
	SiblingsOptions,
	TraverseOptions,
	VaultGraph,
} from "./graph/graph.js";
export type { ScriptOptions } from "./script/run.js";
export { VaultQueryError } from "./utils/errors.js";

/** Standard result envelope returned by query operations. */
export type { QueryResult } from "./utils/result.js";

/** Open a local vault and create the shared read-only query context. */
export { openVault, Vault, VaultLimits, VaultOptions } from "./vault/vault.js";
