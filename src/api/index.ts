/** Structured error type raised by shared API operations. */
export { VaultQueryError } from "./utils/errors.js";
/** Open a local vault and create the shared read-only query context. */
export { openVault } from "./vault/vault.js";
/** Options for folder-list queries. */
export type { ListOptions } from "./dataview/list.js";
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
	TraverseOptions,
	VaultGraph,
} from "./graph/graph.js";
/** Standard result envelope returned by query operations. */
export type { QueryResult } from "./utils/result.js";
/** Vault lifecycle, open configuration, and resource-limit types. */
export type { Vault, VaultLimits, VaultOptions } from "./vault/types.js";
/** Options for unsafe script evaluation. */
export type { ScriptOptions } from "./script/run.js";
/** Describe supported operations, limits and error codes. */
export { describe } from "./describe.js";
export type { Description } from "./describe.js";
