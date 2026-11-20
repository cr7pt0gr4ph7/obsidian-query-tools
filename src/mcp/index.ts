#!/usr/bin/env node
import { parseArgs } from "node:util";
import { McpServer } from "@modelcontextprotocol/server";
import { StdioServerTransport } from "@modelcontextprotocol/server/stdio";
import * as z from "zod/v4";
import { openVault, VaultQueryError } from "../api/index.js";
import { loadConfig, mergeOptions } from "../cli/config.js";

function reply(data: Record<string, unknown>) {
	return {
		content: [{ type: "text" as const, text: JSON.stringify(data) }],
		structuredContent: data,
	};
}

async function handle(operation: () => object | Promise<object>) {
	try {
		const data = await operation();
		return reply({ ...data });
	} catch (error) {
		const details =
			error instanceof VaultQueryError
				? {
						code: error.code,
						message: error.message,
						...(error.path === undefined ? {} : { path: error.path }),
					}
				: { code: "INTERNAL_ERROR", message: "Unexpected internal error." };
		return { ...reply({ error: details }), isError: true };
	}
}

async function main() {
	let parsed;
	try {
		parsed = parseArgs({
			options: {
				vault: { type: "string" },
				"edge-field": { type: "string", multiple: true },
				opposite: { type: "string", multiple: true },
				"allow-wikilinks": { type: "boolean" },
				config: { type: "string" },
			},
		});
	} catch {
		throw new VaultQueryError(
			"INVALID_OPTIONS",
			"Invalid MCP server arguments.",
		);
	}
	if (!parsed.values.vault) {
		throw new VaultQueryError(
			"INVALID_OPTIONS",
			"Expected --vault <path> at server startup.",
		);
	}
	const fileOptions = parsed.values.config
		? await loadConfig(parsed.values.config)
		: {};
	const vault = await openVault(
		parsed.values.vault,
		mergeOptions(fileOptions, {
			edgeFields: parsed.values["edge-field"] ?? [],
			allowWikilinks: parsed.values["allow-wikilinks"] === true,
			oppositeFields: Object.fromEntries(
				(parsed.values.opposite ?? []).map((pair) => {
					const at = pair.indexOf(":");
					if (at < 1 || at === pair.length - 1)
						throw new VaultQueryError(
							"INVALID_OPTIONS",
							"--opposite expects <field:type>.",
						);
					return [pair.slice(0, at), pair.slice(at + 1)];
				}),
			),
		}),
	);
	const server = new McpServer({
		name: "obsidian-query-tools",
		version: "0.1.0",
	});
	const limit = z.number().int().positive().max(1000).optional();
	const annotations = { readOnlyHint: true, openWorldHint: false };
	server.registerTool(
		"list",
		{
			description: 'List paths using only LIST FROM "<folder>".',
			inputSchema: z.strictObject({ query: z.string().max(4096), limit }),
			annotations,
		},
		async ({ query, limit }) => handle(() => vault.list(query, { limit })),
	);
	server.registerTool(
		"neighbors",
		{
			description:
				"Get direct typed edges for an indexed vault-relative Markdown path.",
			inputSchema: z.strictObject({
				path: z.string().max(4096),
				direction: z.enum(["incoming", "outgoing"]).optional(),
				types: z.array(z.string().max(256)).max(100).optional(),
				limit,
			}),
			annotations,
		},
		async ({ path, direction, types, limit }) =>
			handle(() => vault.graph().neighbors(path, { direction, types, limit })),
	);
	server.registerTool(
		"traverse",
		{
			description:
				"Breadth-first walk of typed edges reachable from an indexed Markdown path.",
			inputSchema: z.strictObject({
				path: z.string().max(4096),
				direction: z.enum(["incoming", "outgoing"]).optional(),
				types: z.array(z.string().max(256)).max(100).optional(),
				maxDepth: z.number().int().positive().max(1000).optional(),
				limit,
			}),
			annotations,
		},
		async ({ path, ...options }) =>
			handle(() => vault.graph().traverse(path, options)),
	);
	server.registerTool(
		"path",
		{
			description:
				"Find the shortest typed-edge path between two indexed Markdown paths.",
			inputSchema: z.strictObject({
				from: z.string().max(4096),
				to: z.string().max(4096),
				direction: z.enum(["incoming", "outgoing"]).optional(),
				types: z.array(z.string().max(256)).max(100).optional(),
				limit,
			}),
			annotations,
		},
		async ({ from, to, ...options }) =>
			handle(() => vault.graph().path(from, to, options)),
	);
	server.registerTool(
		"siblings",
		{
			description:
				"Find notes that share a typed-edge target (parent) with an indexed Markdown path.",
			inputSchema: z.strictObject({
				path: z.string().max(4096),
				types: z.array(z.string().max(256)).max(100).optional(),
				limit,
			}),
			annotations,
		},
		async ({ path, ...options }) =>
			handle(() => vault.graph().siblings(path, options)),
	);
	server.registerTool(
		"cycles",
		{
			description:
				"Find groups of notes that can reach each other via typed edges.",
			inputSchema: z.strictObject({
				types: z.array(z.string().max(256)).max(100).optional(),
				limit,
			}),
			annotations,
		},
		async (options) => handle(() => vault.graph().cycles(options)),
	);
	server.registerTool(
		"nodes",
		{
			description:
				"List Markdown paths, optionally only graph sources, sinks, or isolated nodes.",
			inputSchema: z.strictObject({
				role: z.enum(["all", "sources", "sinks", "isolated"]).optional(),
				types: z.array(z.string().max(256)).max(100).optional(),
				limit,
			}),
			annotations,
		},
		async (options) => handle(() => vault.graph().nodes(options)),
	);
	server.registerTool(
		"stats",
		{
			description:
				"Count nodes, edges, per-type edges, sources, sinks and isolated nodes.",
			inputSchema: z.strictObject({
				types: z.array(z.string().max(256)).max(100).optional(),
			}),
			annotations,
		},
		async (options) => handle(() => vault.graph().stats(options)),
	);
	server.registerTool(
		"export",
		{
			description:
				"Serialize the whole graph as json, csv, dot, mermaid, or graphml.",
			inputSchema: z.strictObject({
				format: z.enum(["json", "csv", "dot", "mermaid", "graphml"]).optional(),
				types: z.array(z.string().max(256)).max(100).optional(),
				root: z.string().max(4096).optional(),
				maxDepth: z.number().int().positive().max(1000).optional(),
				direction: z.enum(["incoming", "outgoing", "both"]).optional(),
			}),
			annotations,
		},
		async (options) => handle(() => vault.graph().export(options)),
	);
	server.registerTool(
		"refresh",
		{
			description:
				"Rebuild the bound vault index and return its new generation.",
			inputSchema: z.strictObject({}),
			annotations,
		},
		async () => handle(async () => ({ generation: await vault.refresh() })),
	);
	const transport = new StdioServerTransport();
	transport.onclose = () => vault.close();
	await server.connect(transport);
}

try {
	await main();
} catch (error) {
	const details =
		error instanceof VaultQueryError
			? { code: error.code, message: error.message }
			: { code: "INTERNAL_ERROR", message: "Unexpected internal error." };
	process.stderr.write(`${JSON.stringify({ error: details })}\n`);
	process.exitCode = 1;
}
