#!/usr/bin/env node
import { parseArgs } from "node:util";
import { openVault, VaultQueryError } from "../api/index.js";
import type { NeighborOptions } from "../api/index.js";

async function main(args: string[]) {
  let parsed;
  try {
    parsed = parseArgs({
      args,
      allowPositionals: true,
      options: {
        vault: { type: "string" },
        "edge-field": { type: "string", multiple: true },
        limit: { type: "string" },
        direction: { type: "string" },
        type: { type: "string", multiple: true },
      },
    });
  } catch {
    throw new VaultQueryError("INVALID_OPTIONS", "Invalid CLI arguments.");
  }
  const { values, positionals } = parsed;
  if (!values.vault || positionals.length !== 2 || !["list", "neighbors"].includes(positionals[0])) {
    throw new VaultQueryError("INVALID_OPTIONS", "Expected --vault <path> list <query> or --vault <path> neighbors <path>.");
  }
  if (positionals[0] === "list" && (values.direction || values.type)) {
    throw new VaultQueryError("INVALID_OPTIONS", "--direction and --type only apply to neighbors.");
  }
  const options: NeighborOptions = {};
  if (values.limit !== undefined) {
    if (!/^[1-9]\d*$/.test(values.limit)) throw new VaultQueryError("INVALID_OPTIONS", "Invalid result limit.");
    options.limit = Number(values.limit);
  }
  const vault = await openVault(values.vault, { edgeFields: values["edge-field"] ?? [] });
  try {
    if (positionals[0] === "list") return vault.list(positionals[1], options);
    if (values.direction !== undefined) {
      if (values.direction !== "incoming" && values.direction !== "outgoing") {
        throw new VaultQueryError("INVALID_OPTIONS", "Invalid direction.");
      }
      options.direction = values.direction;
    }
    if (values.type !== undefined) options.types = values.type;
    return vault.neighbors(positionals[1], options);
  } finally {
    vault.close();
  }
}

try {
  const result = await main(process.argv.slice(2));
  process.stdout.write(`${JSON.stringify(result)}\n`);
} catch (error) {
  if (error instanceof VaultQueryError) {
    const details: { code: string; message: string; path?: string } = { code: error.code, message: error.message };
    if (error.path !== undefined) details.path = error.path;
    process.stderr.write(`${JSON.stringify({ error: details })}\n`);
  } else {
    process.stderr.write(`${JSON.stringify({ error: { code: "INTERNAL_ERROR", message: "Unexpected internal error." } })}\n`);
  }
  process.exitCode = 1;
}
