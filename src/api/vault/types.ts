import type { ListOptions } from "../dataview/list.js";
import type { VaultGraph } from "../graph/graph.js";
import type { GraphIndex } from "../graph/indexing.js";
import type { GraphConfig, GraphLimits } from "../graph/config.js";
import type { ScriptOptions } from "../script/run.js";
import type { QueryResult } from "../utils/result.js";

/** Resource limits applied while reading and querying a vault. */
export interface VaultLimits {
	/** Maximum filesystem directory entries examined. */
	maxEntries: number;
	/** Maximum Markdown files indexed. */
	maxFiles: number;
	/** Maximum size in bytes of an individual Markdown file. */
	maxFileBytes: number;
	/** Maximum results returned by any query. */
	maxResults: number;
}

/** Optional configuration for opening a local vault. */
export interface VaultOptions {
	/** Frontmatter fields whose values are interpreted as directed Markdown edges. */
	edgeFields?: string[];
	/**
	 * Maps configured fields to opposite types; each `A -field-> B` also yields an
	 * implied `B -opposite-> A` edge (flagged `implied`), unless already declared.
	 */
	oppositeFields?: Record<string, string>;
	/** Positive resource-limit overrides; each value may lower or raise its default. */
	limits?: Partial<VaultLimits & GraphLimits>;
	/**
	 * UNSAFE: allow `script()` to execute caller-supplied JavaScript in-process.
	 * Not a sandbox; never enable for untrusted input. Defaults to false.
	 */
	unsafeJavaScript?: boolean;
}

/** Read-only operations over one open vault and its published index. */
export interface Vault {
	/**
	 * List Markdown paths using the supported `LIST FROM "<folder>"` subset.
	 * @param query Query text.
	 * @param options Result limit and optional validated file context.
	 */
	list(query: string, options?: ListOptions): QueryResult<string>;
	/**
	 * UNSAFE: execute caller-supplied JavaScript with a read-only `dv` helper.
	 * Fails with `UNSUPPORTED_FEATURE` unless opened with `unsafeJavaScript: true`.
	 * @param source Async function body; its returned value is the result.
	 */
	script(
		source: string,
		options?: ScriptOptions,
	): Promise<QueryResult<unknown>>;
	/** Obtain a graph view that follows the vault's current generation and closes with the vault. */
	graph(): VaultGraph;
	/** Build and publish a replacement index, returning its new generation number. */
	refresh(): Promise<number>;
	/** Close the vault and invalidate subsequent operations. */
	close(): void;
}

/** Fully resolved vault and graph settings used by the indexer. */
export interface Config {
	/** Vault-level resource limits. */
	limits: VaultLimits;
	/** Graph configuration and limits. */
	graph: GraphConfig;
	/** Whether unsafe script execution is enabled. */
	unsafeJavaScript: boolean;
}

/** Data published as one coherent in-memory index generation. */
export interface VaultIndex {
	/** Indexed files and configured graph edges. */
	graph: GraphIndex;
}
