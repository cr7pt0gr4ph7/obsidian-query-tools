import { ErrorCode as EC, VaultQueryError } from "../utils/errors.js";
import { edgeTypes, type GraphConfig } from "./config.js";
import type { ExportFormat, ExportOptions, GraphExport } from "./graph.js";
import type { GraphIndex } from "./indexing.js";

/** Graph export formats in documentation order. */
export const exportFormats: readonly ExportFormat[] = [
	"json",
	"csv",
	"dot",
	"mermaid",
	"graphml",
];

const quote = (value: string) =>
	`"${value.replaceAll("\\", "\\\\").replaceAll('"', '\\"')}"`;
const xml = (value: string) =>
	value
		.replaceAll("&", "&amp;")
		.replaceAll("<", "&lt;")
		.replaceAll(">", "&gt;")
		.replaceAll('"', "&quot;");
const csv = (value: string) => {
	const safe = /^[=+\-@\t\r]/.test(value) ? `'${value}` : value;
	return /[",\r\n]/.test(safe) ? `"${safe.replaceAll('"', '""')}"` : safe;
};
const mermaidLabel = (value: string) =>
	value.replaceAll('"', "#quot;").replaceAll(/[\r\n]/g, " ");

/** Serialize the graph (all files as nodes, selected edges) deterministically. */
export function exportGraph(
	index: GraphIndex,
	generation: number,
	config: GraphConfig,
	options: ExportOptions = {},
): GraphExport {
	if (!options || typeof options !== "object" || Array.isArray(options))
		throw new VaultQueryError(EC.INVALID_OPTIONS, "Options must be an object.");
	for (const key of Object.keys(options))
		if (!["format", "types"].includes(key))
			throw new VaultQueryError(EC.INVALID_OPTIONS, `Unknown option: ${key}`);
	const format = options.format ?? "json";
	if (!exportFormats.includes(format))
		throw new VaultQueryError(EC.INVALID_OPTIONS, "Unsupported export format.");
	const types = options.types ?? edgeTypes(config);
	if (
		!Array.isArray(types) ||
		types.some((type) => !edgeTypes(config).includes(type))
	)
		throw new VaultQueryError(
			EC.INVALID_OPTIONS,
			"types must contain configured edge fields.",
		);
	const edges = index.edges.filter((edge) => types.includes(edge.type));
	const files = index.files;
	const id = new Map(files.map((file, i) => [file, `n${i}`]));
	let content: string;
	switch (format) {
		case "json":
			content = `${JSON.stringify({ nodes: files, edges })}\n`;
			break;
		case "csv":
			content = `${["source,target,type", ...edges.map((e) => [e.source, e.target, e.type].map(csv).join(","))].join("\r\n")}\r\n`;
			break;
		case "dot":
			content = `${[
				"digraph vault {",
				...files.map((f) => `  ${id.get(f)} [label=${quote(f)}];`),
				...edges.map(
					(e) =>
						`  ${id.get(e.source)} -> ${id.get(e.target)} [label=${quote(e.type)}];`,
				),
				"}",
			].join("\n")}\n`;
			break;
		case "mermaid":
			content = `${[
				"flowchart LR",
				...files.map((f) => `  ${id.get(f)}["${mermaidLabel(f)}"]`),
				...edges.map(
					(e) =>
						`  ${id.get(e.source)} -->|"${mermaidLabel(e.type)}"| ${id.get(e.target)}`,
				),
			].join("\n")}\n`;
			break;
		case "graphml":
			content = `${[
				'<?xml version="1.0" encoding="UTF-8"?>',
				'<graphml xmlns="http://graphml.graphdrawing.org/xmlns">',
				'  <key id="path" for="node" attr.name="path" attr.type="string"/>',
				'  <key id="type" for="edge" attr.name="type" attr.type="string"/>',
				'  <graph id="vault" edgedefault="directed">',
				...files.map(
					(f) =>
						`    <node id="${id.get(f)}"><data key="path">${xml(f)}</data></node>`,
				),
				...edges.map(
					(e, i) =>
						`    <edge id="e${i}" source="${id.get(e.source)}" target="${id.get(e.target)}"><data key="type">${xml(e.type)}</data></edge>`,
				),
				"  </graph>",
				"</graphml>",
			].join("\n")}\n`;
			break;
	}
	return {
		generation,
		format,
		content,
		nodeCount: files.length,
		edgeCount: edges.length,
		diagnostics: [
			{
				code: "NON_ATOMIC_SNAPSHOT",
				message: "The filesystem may change during indexing.",
			},
		],
		truncated: false,
	};
}
