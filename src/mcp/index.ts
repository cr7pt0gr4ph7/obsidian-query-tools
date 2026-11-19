#!/usr/bin/env node
import { parseArgs } from "node:util";
import { McpServer } from "@modelcontextprotocol/server";
import { StdioServerTransport } from "@modelcontextprotocol/server/stdio";
import * as z from "zod/v4";
import { openVault, VaultQueryError } from "../api/index.js";

function reply(data: Record<string, unknown>) {
  return { content: [{ type: "text" as const, text: JSON.stringify(data) }], structuredContent: data };
}

async function handle(operation: () => object | Promise<object>) {
  try {
    const data = await operation();
    return reply({ ...data });
  } catch (error) {
    const details = error instanceof VaultQueryError
      ? { code: error.code, message: error.message, ...(error.path === undefined ? {} : { path: error.path }) }
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
      },
    });
  } catch {
    throw new VaultQueryError("INVALID_OPTIONS", "Invalid MCP server arguments.");
  }
  if (!parsed.values.vault) {
    throw new VaultQueryError("INVALID_OPTIONS", "Expected --vault <path> at server startup.");
  }
  const vault = await openVault(parsed.values.vault, { edgeFields: parsed.values["edge-field"] ?? [] });
  const server = new McpServer({ name: "obsidian-query-tools", version: "0.1.0" });
  const limit = z.number().int().positive().max(1000).optional();
  const annotations = { readOnlyHint: true, openWorldHint: false };
  server.registerTool("list", {
    description: 'List paths using only LIST FROM "<folder>".',
    inputSchema: z.strictObject({ query: z.string().max(4096), limit }),
    annotations,
  }, async ({ query, limit }) => handle(() => vault.list(query, { limit })));
  server.registerTool("neighbors", {
    description: "Get direct typed edges for an indexed vault-relative Markdown path.",
    inputSchema: z.strictObject({
      path: z.string().max(4096),
      direction: z.enum(["incoming", "outgoing"]).optional(),
      types: z.array(z.string().max(256)).max(100).optional(),
      limit,
    }),
    annotations,
  }, async ({ path, direction, types, limit }) => handle(() => vault.neighbors(path, { direction, types, limit })));
  server.registerTool("refresh", {
    description: "Rebuild the bound vault index and return its new generation.",
    inputSchema: z.strictObject({}),
    annotations,
  }, async () => handle(async () => ({ generation: await vault.refresh() })));
  const transport = new StdioServerTransport();
  transport.onclose = () => vault.close();
  await server.connect(transport);
}

try {
  await main();
} catch (error) {
  const details = error instanceof VaultQueryError
    ? { code: error.code, message: error.message }
    : { code: "INTERNAL_ERROR", message: "Unexpected internal error." };
  process.stderr.write(`${JSON.stringify({ error: details })}\n`);
  process.exitCode = 1;
}
