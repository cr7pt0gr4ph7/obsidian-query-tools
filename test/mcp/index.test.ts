import assert from "node:assert/strict";
import { mkdtemp, rm, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import test from "node:test";
import { Client } from "@modelcontextprotocol/client";
import { StdioClientTransport } from "@modelcontextprotocol/client/stdio";
import { openVault } from "../../dist/api/index.js";

function record(value: unknown): Record<string, unknown> {
	assert.ok(
		value !== null && typeof value === "object" && !Array.isArray(value),
	);
	return Object.fromEntries(Object.entries(value));
}

test("MCP stdio tools use the bound vault and shared API", async (t) => {
	const root = await mkdtemp(path.join(os.tmpdir(), "query-mcp-test-"));
	t.after(() => rm(root, { recursive: true, force: true }));
	await writeFile(path.join(root, "a.md"), "---\nparent: b\n---\n");
	await writeFile(path.join(root, "b.md"), "# b\n");
	const vault = await openVault(root, { edgeFields: ["parent"] });
	const client = new Client({ name: "test-client", version: "1.0.0" });
	const server = fileURLToPath(
		new URL("../../dist/mcp/index.js", import.meta.url),
	);
	const transport = new StdioClientTransport({
		command: process.execPath,
		args: [server, "--vault", root, "--edge-field", "parent"],
		stderr: "pipe",
	});
	let stderr = "";
	assert.ok(transport.stderr);
	transport.stderr.on("data", (chunk) => {
		stderr += chunk;
	});
	try {
		await client.connect(transport);
		const { tools } = await client.listTools();
		assert.deepEqual(tools.map((tool) => tool.name).sort(), [
			"export",
			"list",
			"neighbors",
			"nodes",
			"path",
			"refresh",
			"stats",
			"traverse",
		]);
		const exported = await client.callTool({
			name: "export",
			arguments: { format: "csv" },
		});
		assert.equal(exported.isError, undefined);
		assert.equal(
			(exported.structuredContent as { format: string }).format,
			"csv",
		);
		const listed = await client.callTool({
			name: "list",
			arguments: { query: 'LIST FROM ""', limit: 1 },
		});
		assert.deepEqual(
			listed.structuredContent,
			vault.list('LIST FROM ""', { limit: 1 }),
		);
		const text = listed.content[0];
		assert.equal(text.type, "text");
		if (text.type !== "text") throw new Error("Expected text content.");
		assert.deepEqual(JSON.parse(text.text), listed.structuredContent);
		const edges = await client.callTool({
			name: "neighbors",
			arguments: { path: "b.md", direction: "incoming" },
		});
		assert.deepEqual(
			edges.structuredContent,
			vault.graph().neighbors("b.md", { direction: "incoming" }),
		);
		const bad = await client.callTool({
			name: "list",
			arguments: { query: "TASK FROM #tag" },
		});
		assert.equal(bad.isError, true);
		assert.equal(
			record(record(bad.structuredContent).error).code,
			"INVALID_QUERY",
		);
		const arbitraryVault = await client.callTool({
			name: "list",
			arguments: { query: 'LIST FROM ""', vault: "/" },
		});
		assert.equal(arbitraryVault.isError, true);
		await writeFile(path.join(root, "a.md"), "---\nparent: missing\n---\n");
		const failedRefresh = await client.callTool({
			name: "refresh",
			arguments: {},
		});
		assert.equal(failedRefresh.isError, true);
		assert.equal(
			record(record(failedRefresh.structuredContent).error).code,
			"UNRESOLVED_EDGE",
		);
		const preserved = await client.callTool({
			name: "list",
			arguments: { query: 'LIST FROM ""' },
		});
		assert.equal(record(preserved.structuredContent).generation, 1);
		await writeFile(path.join(root, "a.md"), "---\nparent: b\n---\n");
		await writeFile(path.join(root, "c.md"), "# c\n");
		const refreshed = await client.callTool({ name: "refresh", arguments: {} });
		assert.equal(record(refreshed.structuredContent).generation, 2);
		const after = await client.callTool({
			name: "list",
			arguments: { query: 'LIST FROM ""' },
		});
		assert.deepEqual(record(after.structuredContent).data, [
			"a.md",
			"b.md",
			"c.md",
		]);
		assert.equal(record(after.structuredContent).generation, 2);
	} finally {
		await client.close();
		vault.close();
	}
	assert.equal(stderr, "");
});
