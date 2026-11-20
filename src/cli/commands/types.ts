import type {
	CyclesOptions,
	ExportOptions,
	NeighborOptions,
	NodesOptions,
	PathOptions,
	SiblingsOptions,
	TraverseOptions,
} from "../../api/index.js";

export type CliCommand =
	| {
			operation: "neighbors";
			path: string;
			options: NeighborOptions;
			edgeFields?: string[];
	  }
	| { operation: "traverse"; path: string; options: TraverseOptions }
	| { operation: "path"; from: string; to: string; options: PathOptions }
	| { operation: "siblings"; path: string; options: SiblingsOptions }
	| { operation: "cycles"; options: CyclesOptions }
	| { operation: "nodes"; options: NodesOptions }
	| { operation: "stats"; options: { types?: string[] } }
	| { operation: "export"; options: ExportOptions };

export interface RootOptions {
	vault?: string;
	edgeField: string[];
	opposite: string[];
	config?: string;
}

export interface NeighborCliOptions {
	limit?: string;
	direction?: "incoming" | "outgoing";
	edgeType?: string[];
	edgeField?: string[];
}

export type CliCommandSelector = (command: CliCommand) => void;
