import type {
	ExportOptions,
	NeighborOptions,
	PathOptions,
	TraverseOptions,
} from "../../api/index.js";

export type CliCommand =
	| { operation: "neighbors"; path: string; options: NeighborOptions }
	| { operation: "traverse"; path: string; options: TraverseOptions }
	| { operation: "path"; from: string; to: string; options: PathOptions }
	| { operation: "stats"; options: { types?: string[] } }
	| { operation: "export"; options: ExportOptions };

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
