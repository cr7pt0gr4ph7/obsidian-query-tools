import type { Config, VaultIndex } from "../types.js";
import { resolveIndex } from "./resolve.js";
import { scanVault } from "./scan.js";

/**
 * Build a bounded index for a vault without executing or modifying its contents.
 *
 * @param root Canonical local vault directory.
 * @param config Validated index settings and resource limits.
 * @returns A complete index; failures prevent partial publication.
 */
export async function buildIndex(root: string, config: Config): Promise<VaultIndex> {
	const scanned = await scanVault(root, config);
	return resolveIndex(scanned.files, scanned.edges, scanned.pending, config);
}
