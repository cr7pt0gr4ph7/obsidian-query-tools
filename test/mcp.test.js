import assert from "node:assert/strict";
import { mkdtemp, rm, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import test from "node:test";
import { Client } from "@modelcontextprotocol/client";
import { StdioClientTransport } from "@modelcontextprotocol/client/stdio";
import { openVault } from "../src/index.js";

test("MCP stdio tools use the bound vault and shared API", async t => {
  const root = await mkdtemp(path.join(os.tmpdir(), "query-mcp-test-"));
  t.after(() => rm(root, { recursive: true, force: true }));
  await writeFile(path.join(root, "a.md"), "---\nparent: b\n---\n");
  await writeFile(path.join(root, "b.md"), "# b\n");
  const vault = await openVault(root, { edgeFields: ["parent"] });
  const client = new Client({ name: "test-client", version: "1.0.0" });
  const server = fileURLToPath(new URL("../src/mcp.js", import.meta.url));
  const transport = new StdioClientTransport({
    command: process.execPath,
    args: [server, "--vault", root, "--edge-field", "parent"],
    stderr: "pipe",
  });
  let stderr = "";
  transport.stderr.on("data", chunk => { stderr += chunk; });
  try {
    await client.connect(transport);
    const { tools } = await client.listTools();
    assert.deepEqual(tools.map(tool => tool.name).sort(), ["list", "neighbors", "refresh"]);
    const listed = await client.callTool({ name: "list", arguments: { query: 'LIST FROM ""', limit: 1 } });
    assert.deepEqual(listed.structuredContent, vault.list('LIST FROM ""', { limit: 1 }));
    assert.deepEqual(JSON.parse(listed.content[0].text), listed.structuredContent);
    const edges = await client.callTool({ name: "neighbors", arguments: { path: "b.md", direction: "incoming" } });
    assert.deepEqual(edges.structuredContent, vault.neighbors("b.md", { direction: "incoming" }));
    const bad = await client.callTool({ name: "list", arguments: { query: "TASK FROM #tag" } });
    assert.equal(bad.isError, true);
    assert.equal(bad.structuredContent.error.code, "INVALID_QUERY");
    const arbitraryVault = await client.callTool({ name: "list", arguments: { query: 'LIST FROM ""', vault: "/" } });
    assert.equal(arbitraryVault.isError, true);
    await writeFile(path.join(root, "a.md"), "---\nparent: missing\n---\n");
    const failedRefresh = await client.callTool({ name: "refresh", arguments: {} });
    assert.equal(failedRefresh.isError, true);
    assert.equal(failedRefresh.structuredContent.error.code, "UNRESOLVED_EDGE");
    const preserved = await client.callTool({ name: "list", arguments: { query: 'LIST FROM ""' } });
    assert.equal(preserved.structuredContent.generation, 1);
    await writeFile(path.join(root, "a.md"), "---\nparent: b\n---\n");
    await writeFile(path.join(root, "c.md"), "# c\n");
    const refreshed = await client.callTool({ name: "refresh", arguments: {} });
    assert.equal(refreshed.structuredContent.generation, 2);
    const after = await client.callTool({ name: "list", arguments: { query: 'LIST FROM ""' } });
    assert.deepEqual(after.structuredContent.data, ["a.md", "b.md", "c.md"]);
    assert.equal(after.structuredContent.generation, 2);
  } finally {
    await client.close();
    vault.close();
  }
  assert.equal(stderr, "");
});
