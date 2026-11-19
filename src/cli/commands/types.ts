import type { NeighborOptions } from "../../api/index.js";

export type CliCommand = { path: string; options: NeighborOptions };

export interface RootOptions {
	vault?: string;
	edgeField: string[];
}

export interface NeighborCliOptions {
	limit?: string;
	direction?: "incoming" | "outgoing";
	edgeType?: string[];
	edgeField?: string[];
}

export type CliCommandSelector = (command: CliCommand) => void;
