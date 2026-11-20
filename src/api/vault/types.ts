import type { GraphConfig } from "../graph/config.js";
import type { GraphIndex } from "../graph/indexing.js";
import type { VaultLimits } from "./vault.js";

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
