import assert from "node:assert/strict";
import { execFile } from "node:child_process";
import {
	chmod,
	mkdtemp,
	mkdir,
	readFile,
	rm,
	symlink,
	writeFile,
} from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { promisify } from "node:util";
import test from "node:test";
import type { TestContext } from "node:test";
import { openVault, VaultQueryError } from "../../dist/api/index.js";
import type {
	GraphLimits,
	VaultGraph,
	VaultLimits,
	VaultOptions,
} from "../../dist/api/index.js";
import type { Config, VaultIndex } from "../../dist/api/vault/types.js";
import type { GraphConfig } from "../../dist/api/graph/config.js";
import type { GraphIndex } from "../../dist/api/graph/indexing.js";
import { optionsForOpen } from "../../dist/api/vault/validation.js";
import { fileURLToPath } from "node:url";

async function fixture(t: TestContext) {
	const root = await mkdtemp(path.join(os.tmpdir(), "query-tools-test-"));
	t.after(() => rm(root, { recursive: true, force: true }));
	await mkdir(path.join(root, "Tasks", "nested"), { recursive: true });
	await writeFile(
		path.join(root, "Tasks", "a.md"),
		"---\nparent: root\n---\nstatus:: open\n",
	);
	await writeFile(
		path.join(root, "Tasks", "nested", "b.md"),
		"---\nparent: [root.md, Tasks/a.md]\n---\n",
	);
	await writeFile(path.join(root, "root.md"), "# Root\n");
	return root;
}

const code = (expected: string) => (error: unknown) => {
	assert.ok(error instanceof VaultQueryError);
	assert.equal(error.code, expected);
	return true;
};

type Assert<T extends true> = T;
type Equal<A, B> =
	(<T>() => T extends A ? 1 : 2) extends <T>() => T extends B ? 1 : 2
		? true
		: false;
type GraphLimitKeys = Assert<Equal<keyof GraphLimits, "maxEdges">>;
type VaultLimitKeys = Assert<
	Equal<
		keyof VaultLimits,
		"maxEntries" | "maxFiles" | "maxFileBytes" | "maxResults"
	>
>;
type GraphConfigKeys = Assert<
	Equal<keyof GraphConfig, "edgeFields" | "opposites" | "limits">
>;
type ConfigKeys = Assert<
	Equal<keyof Config, "graph" | "limits" | "unsafeJavaScript">
>;
type GraphIndexKeys = Assert<Equal<keyof GraphIndex, "files" | "edges">>;
type VaultIndexKeys = Assert<Equal<keyof VaultIndex, "graph">>;

test("graph options are separated from vault limits without changing open options", async (t) => {
	const config = optionsForOpen({
		edgeFields: ["parent"],
		limits: { maxEdges: 3, maxFiles: 3 },
	});
	assert.deepEqual(config.graph, {
		edgeFields: ["parent"],
		opposites: {},
		limits: { maxEdges: 3 },
	});
	assert.equal(config.limits.maxFiles, 3);
	assert.equal(Object.hasOwn(config.limits, "maxEdges"), false);
	const root = await fixture(t);
	const vault = await openVault(root, {
		edgeFields: ["parent"],
		limits: { maxEdges: 3, maxFiles: 3 },
	});
	assert.equal(vault.graph().neighbors("Tasks/nested/b.md").data.length, 2);
	assert.equal(vault.list('LIST FROM ""').data.length, 3);
	vault.close();
	await assert.rejects(
		openVault(root, { edgeFields: ["parent"], limits: { maxEdges: 2 } }),
		code("LIMIT_EXCEEDED"),
	);
	await assert.rejects(
		openVault(root, { limits: { maxEdges: 0 } }),
		code("INVALID_OPTIONS"),
	);
});

test("vault errors only expose a path when one is supplied", () => {
	const withoutPath = new VaultQueryError("INVALID_QUERY", "Invalid query.");
	assert.equal(Object.hasOwn(withoutPath, "path"), false);
	const withPath = new VaultQueryError(
		"UNSAFE_PATH",
		"Unsafe path.",
		"note.md",
	);
	assert.equal(withPath.path, "note.md");
});

test("folder query and configured directed edges share an index", async (t) => {
	const root = await fixture(t);
	const before = await readFile(path.join(root, "Tasks", "a.md"), "utf8");
	const vault = await openVault(root, { edgeFields: ["parent"] });
	const graph: VaultGraph = vault.graph();
	const listed = vault.list('lIsT FROM "Tasks"');
	assert.deepEqual(listed.data, ["Tasks/a.md", "Tasks/nested/b.md"]);
	assert.equal(listed.generation, 1);
	assert.equal(listed.truncated, false);
	assert.equal(listed.diagnostics[0].code, "NON_ATOMIC_SNAPSHOT");
	assert.deepEqual(vault.list('LIST FROM ""', { limit: 1 }).data, [
		"Tasks/a.md",
	]);
	assert.equal(vault.list('LIST FROM ""', { limit: 1 }).truncated, true);
	assert.deepEqual(graph.neighbors("Tasks/nested/b.md").data, [
		{ source: "Tasks/nested/b.md", target: "Tasks/a.md", type: "parent" },
		{ source: "Tasks/nested/b.md", target: "root.md", type: "parent" },
	]);
	assert.equal(
		vault.graph().neighbors("root.md", { direction: "incoming" }).data.length,
		2,
	);
	assert.deepEqual(
		vault.graph().neighbors("root.md", { direction: "incoming", types: [] })
			.data,
		[],
	);
	assert.equal(
		await readFile(path.join(root, "Tasks", "a.md"), "utf8"),
		before,
	);
	vault.close();
	assert.throws(() => vault.list('LIST FROM ""'), code("VAULT_CLOSED"));
	assert.throws(() => vault.graph(), code("VAULT_CLOSED"));
	assert.throws(
		() => graph.neighbors("Tasks/nested/b.md"),
		code("VAULT_CLOSED"),
	);
});

test("current-file context must identify an indexed Markdown file", async (t) => {
	const root = await fixture(t);
	const vault = await openVault(root);
	assert.deepEqual(
		vault.list('LIST FROM "Tasks"', { file: "Tasks/a.md" }).data,
		["Tasks/a.md", "Tasks/nested/b.md"],
	);
	for (const file of ["/outside.md", "../root.md", "root.txt", "missing.md"]) {
		assert.throws(
			() => vault.list('LIST FROM ""', { file }),
			file === "missing.md" ? code("NOT_FOUND") : code("INVALID_PATH"),
		);
	}
	vault.close();
});

test("indexes the pinned upstream Dataview vault as paths only", async () => {
	const root = fileURLToPath(new URL("../fixtures/dataview/", import.meta.url));
	const vault = await openVault(root);
	assert.deepEqual(vault.list('lIsT FROM "tasks"').data, [
		"tasks/Annotated Tasks.md",
		"tasks/Completed Tasks.md",
		"tasks/Grouped Sorted Tasks.md",
		"tasks/Sorted Tasks.md",
		"tasks/Tasks Completed on specific Date.md",
		"tasks/Tasks in a specific section.md",
		"tasks/Uncompleted Tasks.md",
		"tasks/checklist.md",
		"tasks/example tasks.md",
	]);
	assert.deepEqual(vault.list('LIST FROM "books"').data, [
		"books/Catcher in the Rye.md",
		"books/Origin of Species.md",
		"books/The Great Gatsby.md",
	]);
	assert.deepEqual(vault.list('LIST FROM "book"').data, []);
	assert.throws(() => vault.list("TASK FROM #page-tag"), code("INVALID_QUERY"));
	assert.throws(() => vault.list("list from [[Stuff]]"), code("INVALID_QUERY"));
	vault.close();
});

test("Dataview-inspired unsupported syntax is rejected rather than approximated", async (t) => {
	const vault = await openVault(await fixture(t));
	for (const query of [
		"LIST",
		"LIST FROM #games",
		"list from [[Stuff]]",
		'LIST FROM "Tasks" WHERE status = "open"',
		'TABLE FROM "Tasks"',
		'LIST FROM "Tasks" OR #games',
		'LIST FROM "Tasks',
	])
		assert.throws(() => vault.list(query), code("INVALID_QUERY"));
	assert.throws(
		() => vault.list('LIST FROM "../outside"'),
		code("INVALID_PATH"),
	);
	assert.throws(
		() => vault.graph().neighbors("../root.md"),
		code("INVALID_PATH"),
	);
	const invalidDirection: Parameters<VaultGraph["neighbors"]>[1] = {
		// @ts-expect-error Exercise validation of an invalid JavaScript caller.
		direction: "both",
	};
	assert.throws(
		() => vault.graph().neighbors("root.md", invalidDirection),
		code("INVALID_OPTIONS"),
	);
	assert.throws(
		() => vault.list('LIST FROM ""', { limit: 1001 }),
		code("INVALID_OPTIONS"),
	);
});

test("refresh publishes additions, modifications and deletions atomically on success", async (t) => {
	const root = await fixture(t);
	const vault = await openVault(root, { edgeFields: ["parent"] });
	const graph = vault.graph();
	await writeFile(
		path.join(root, "Tasks", "a.md"),
		"---\nparent: missing\n---\n",
	);
	await assert.rejects(vault.refresh(), code("UNRESOLVED_EDGE"));
	assert.equal(vault.list('LIST FROM ""').generation, 1);
	assert.equal(
		graph.neighbors("root.md", { direction: "incoming" }).data.length,
		2,
	);
	await writeFile(
		path.join(root, "Tasks", "a.md"),
		"---\nparent: Tasks/nested/b\n---\n",
	);
	await rm(path.join(root, "root.md"));
	await writeFile(path.join(root, "Tasks", "nested", "b.md"), "# no edges\n");
	await writeFile(path.join(root, "new.md"), "# new\n");
	assert.equal(await vault.refresh(), 2);
	assert.deepEqual(vault.list('LIST FROM ""').data, [
		"Tasks/a.md",
		"Tasks/nested/b.md",
		"new.md",
	]);
	assert.equal(
		graph.neighbors("Tasks/nested/b.md", { direction: "incoming" }).generation,
		2,
	);
	assert.equal(
		graph.neighbors("Tasks/nested/b.md", { direction: "incoming" }).data.length,
		1,
	);
	assert.throws(() => vault.graph().neighbors("root.md"), code("NOT_FOUND"));
});

test("malformed fields, limits and symlinks fail explicitly", async (t) => {
	const root = await fixture(t);
	await assert.rejects(
		openVault(root, { limits: { maxFiles: 2 } }),
		code("LIMIT_EXCEEDED"),
	);
	await assert.rejects(
		openVault(root, { limits: { maxEntries: 1 } }),
		code("LIMIT_EXCEEDED"),
	);
	await assert.rejects(
		openVault(root, { limits: { maxFileBytes: 2 } }),
		code("LIMIT_EXCEEDED"),
	);
	await assert.rejects(
		openVault(root, { edgeFields: ["parent"], limits: { maxEdges: 1 } }),
		code("LIMIT_EXCEEDED"),
	);
	await writeFile(
		path.join(root, "root.md"),
		"---\nparent: '[[Tasks/a]]'\n---\n",
	);
	await assert.rejects(
		openVault(root, { edgeFields: ["parent"] }),
		code("INVALID_EDGE"),
	);
	await writeFile(
		path.join(root, "root.md"),
		"---\nparent: [unterminated\n---\n",
	);
	await assert.rejects(
		openVault(root, { edgeFields: ["parent"] }),
		code("INVALID_FRONTMATTER"),
	);
	await writeFile(path.join(root, "root.md"), "---\nparent: !custom b\n---\n");
	await assert.rejects(
		openVault(root, { edgeFields: ["parent"] }),
		code("INVALID_FRONTMATTER"),
	);
	await writeFile(
		path.join(root, "root.md"),
		"---\nparent: &link b\nother: *link\n---\n",
	);
	await assert.rejects(
		openVault(root, { edgeFields: ["parent"] }),
		code("INVALID_FRONTMATTER"),
	);
	await writeFile(path.join(root, "root.md"), "# root\n");
	await symlink(os.tmpdir(), path.join(root, "outside"));
	await assert.rejects(openVault(root), code("UNSAFE_PATH"));
});

test("a Markdown symlink cannot expose a file outside the vault", async (t) => {
	const root = await fixture(t);
	const outside = await mkdtemp(path.join(os.tmpdir(), "query-outside-test-"));
	t.after(() => rm(outside, { recursive: true, force: true }));
	await writeFile(path.join(outside, "secret.md"), "private contents\n");
	await symlink(path.join(outside, "secret.md"), path.join(root, "linked.md"));
	await assert.rejects(openVault(root), (error) => {
		assert.ok(error instanceof VaultQueryError);
		assert.equal(error.code, "UNSAFE_PATH");
		assert.equal(error.path, "linked.md");
		assert.ok(!error.message.includes("private contents"));
		return true;
	});
});

test("rejects invalid configuration and does not execute note JavaScript", async (t) => {
	const root = await fixture(t);
	// @ts-expect-error Exercise validation of an invalid JavaScript caller.
	const invalidOptions: VaultOptions = { limits: { toString: 1 } };
	await assert.rejects(
		openVault(root, invalidOptions),
		code("INVALID_OPTIONS"),
	);
	await assert.rejects(
		openVault(root, { edgeFields: ["parent", "parent"] }),
		code("INVALID_OPTIONS"),
	);
	await writeFile(
		path.join(root, "script.md"),
		"```dataviewjs\nthrow new Error('executed');\n```\n",
	);
	const vault = await openVault(root);
	assert.ok(vault.list('LIST FROM ""').data.includes("script.md"));
});

test("refresh cannot publish after close or overlap another refresh", async (t) => {
	const vault = await openVault(await fixture(t), { edgeFields: ["parent"] });
	const refreshing = vault.refresh();
	await assert.rejects(vault.refresh(), code("REFRESH_IN_PROGRESS"));
	vault.close();
	await assert.rejects(refreshing, code("VAULT_CLOSED"));
	await assert.rejects(vault.refresh(), code("VAULT_CLOSED"));
});

test("result mutations do not alter the published index", async (t) => {
	const vault = await openVault(await fixture(t), { edgeFields: ["parent"] });
	const result = vault.graph().neighbors("Tasks/a.md");
	result.data[0].target = "elsewhere.md";
	result.data.push({ source: "fake.md", target: "fake.md", type: "parent" });
	assert.deepEqual(vault.graph().neighbors("Tasks/a.md").data, [
		{ source: "Tasks/a.md", target: "root.md", type: "parent" },
	]);
	const listed = vault.list('LIST FROM ""');
	listed.data.length = 0;
	assert.equal(vault.list('LIST FROM ""').data.length, 3);
	vault.close();
});

test("unreadable Markdown causes an explicit vault read error", async (t) => {
	const root = await fixture(t);
	const file = path.join(root, "Tasks", "a.md");
	await chmod(file, 0);
	if (process.getuid?.() !== 0) {
		await assert.rejects(openVault(root), code("VAULT_READ_ERROR"));
		return;
	}
	await chmod(root, 0o755);
	const moduleUrl = new URL("../../dist/api/index.js", import.meta.url).href;
	const program = `
    import { openVault } from ${JSON.stringify(moduleUrl)};
    process.setgid(65534);
    process.setuid(65534);
    try {
      await openVault(process.argv[1]);
      process.exitCode = 1;
    } catch (error) {
      process.stdout.write(error.code);
    }
  `;
	const { stdout } = await promisify(execFile)(process.execPath, [
		"--input-type=module",
		"-e",
		program,
		root,
	]);
	assert.equal(stdout, "VAULT_READ_ERROR");
});

test("invalid UTF-8 is rejected without replacing the current generation", async (t) => {
	const root = await fixture(t);
	const vault = await openVault(root, { edgeFields: ["parent"] });
	await writeFile(path.join(root, "Tasks", "a.md"), Buffer.from([0xff, 0xfe]));
	await assert.rejects(vault.refresh(), code("INVALID_ENCODING"));
	assert.equal(vault.list('LIST FROM "Tasks"').generation, 1);
	assert.equal(vault.graph().neighbors("Tasks/a.md").data[0].target, "root.md");
	vault.close();
});

test("script() is disabled unless unsafeJavaScript is set", async (t) => {
	const root = await mkdtemp(path.join(os.tmpdir(), "query-script-"));
	t.after(() => rm(root, { recursive: true, force: true }));
	await writeFile(path.join(root, "a.md"), "---\nparent: b\n---\n");
	await writeFile(path.join(root, "b.md"), "# b\n");
	const safe = await openVault(root);
	await assert.rejects(safe.script("return 1"), {
		code: "UNSUPPORTED_FEATURE",
	});
	const vault = await openVault(root, {
		edgeFields: ["parent"],
		unsafeJavaScript: true,
	});
	const r = await vault.script(
		"return dv.neighbors('a.md').map((e) => e.target);",
	);
	assert.deepEqual(r.data, ["b.md"]);
	await assert.rejects(vault.script("throw new Error('x')"), {
		code: "INVALID_QUERY",
	});
});

test("traverse walks reachability and export serializes escaped formats", async (t) => {
	const root = await mkdtemp(path.join(os.tmpdir(), "query-graph-"));
	t.after(() => rm(root, { recursive: true, force: true }));
	await writeFile(path.join(root, "a.md"), "---\nup: b\n---\n");
	await writeFile(path.join(root, "b.md"), "---\nup: c\n---\n");
	await writeFile(path.join(root, "c.md"), "---\nup: a\n---\n");
	await writeFile(path.join(root, 'd"&<.md'), "# d\n");
	const vault = await openVault(root, { edgeFields: ["up"] });
	const g = vault.graph();
	assert.deepEqual(
		g.traverse("a.md").data.map((e) => `${e.source}>${e.target}`),
		["a.md>b.md", "b.md>c.md", "c.md>a.md"],
	);
	assert.equal(g.traverse("a.md", { maxDepth: 1 }).data.length, 1);
	assert.deepEqual(
		g.traverse("a.md", { direction: "incoming", maxDepth: 1 }).data[0].source,
		"c.md",
	);
	assert.throws(
		() => g.traverse("a.md", { maxDepth: 0 }),
		code("INVALID_OPTIONS"),
	);
	assert.throws(
		() => g.export({ format: "pdf" as "json" }),
		code("INVALID_OPTIONS"),
	);
	assert.match(g.export({ format: "dot" }).content, /n0 -> n1 \[label="up"\]/);
	assert.match(g.export({ format: "graphml" }).content, /d&quot;&amp;&lt;\.md/);
	assert.match(g.export({ format: "mermaid" }).content, /d#quot;&<\.md/);
	assert.equal(
		g.export({ format: "csv" }).content.split("\r\n")[0],
		"source,target,type",
	);
	assert.equal(g.export().edgeCount, 3);
});

test("path returns the shortest edge chain or nothing", async (t) => {
	const root = await mkdtemp(path.join(os.tmpdir(), "query-path-"));
	t.after(() => rm(root, { recursive: true, force: true }));
	await writeFile(path.join(root, "a.md"), "---\nup: [b, c]\n---\n");
	await writeFile(path.join(root, "b.md"), "---\nup: d\n---\n");
	await writeFile(path.join(root, "c.md"), "---\nup: [b, d]\n---\n");
	await writeFile(path.join(root, "d.md"), "# d\n");
	await writeFile(path.join(root, "e.md"), "# e\n");
	const g = (await openVault(root, { edgeFields: ["up"] })).graph();
	assert.deepEqual(
		g.path("a.md", "d.md").data.map((e) => `${e.source}>${e.target}`),
		["a.md>b.md", "b.md>d.md"],
	);
	assert.deepEqual(g.path("a.md", "e.md").data, []);
	assert.deepEqual(g.path("a.md", "a.md").data, []);
	assert.equal(
		g.path("d.md", "a.md", { direction: "incoming" }).data.length,
		2,
	);
	assert.throws(() => g.path("a.md", "x.md"), code("NOT_FOUND"));
});

test("stats counts nodes, edges and node roles", async (t) => {
	const root = await mkdtemp(path.join(os.tmpdir(), "query-stats-"));
	t.after(() => rm(root, { recursive: true, force: true }));
	await writeFile(path.join(root, "a.md"), "---\nup: b\nsee: c\n---\n");
	await writeFile(path.join(root, "b.md"), "# b\n");
	await writeFile(path.join(root, "c.md"), "# c\n");
	await writeFile(path.join(root, "d.md"), "# d\n");
	const g = (await openVault(root, { edgeFields: ["up", "see"] })).graph();
	const s = g.stats();
	assert.deepEqual(
		[s.nodeCount, s.edgeCount, s.sources, s.sinks, s.isolated],
		[4, 2, 1, 2, 1],
	);
	assert.deepEqual(s.edgesByType, { see: 1, up: 1 });
	assert.equal(g.stats({ types: ["up"] }).isolated, 2);
});

test("nodes filters by role", async (t) => {
	const root = await mkdtemp(path.join(os.tmpdir(), "query-nodes-"));
	t.after(() => rm(root, { recursive: true, force: true }));
	await writeFile(path.join(root, "a.md"), "---\nup: b\n---\n");
	await writeFile(path.join(root, "b.md"), "# b\n");
	await writeFile(path.join(root, "c.md"), "# c\n");
	const g = (await openVault(root, { edgeFields: ["up"] })).graph();
	assert.deepEqual(g.nodes({ role: "sources" }).data, ["a.md"]);
	assert.deepEqual(g.nodes({ role: "sinks" }).data, ["b.md"]);
	assert.deepEqual(g.nodes({ role: "isolated" }).data, ["c.md"]);
	assert.equal(g.nodes({ limit: 2 }).truncated, true);
	assert.throws(() => g.nodes({ role: "x" as "all" }), code("INVALID_OPTIONS"));
});

test("cycles finds mutually reachable groups and self-loops", async (t) => {
	const root = await mkdtemp(path.join(os.tmpdir(), "query-cycles-"));
	t.after(() => rm(root, { recursive: true, force: true }));
	await writeFile(path.join(root, "a.md"), "---\nup: b\n---\n");
	await writeFile(path.join(root, "b.md"), "---\nup: [c, d]\n---\n");
	await writeFile(path.join(root, "c.md"), "---\nup: a\n---\n");
	await writeFile(path.join(root, "d.md"), "---\nup: d\n---\n");
	await writeFile(path.join(root, "e.md"), "---\nup: a\n---\n");
	const g = (await openVault(root, { edgeFields: ["up"] })).graph();
	assert.deepEqual(g.cycles().data, [["a.md", "b.md", "c.md"], ["d.md"]]);
	assert.equal(g.cycles({ limit: 1 }).truncated, true);
});

test("opposite fields add flagged implied edges within limits", async (t) => {
	const root = await mkdtemp(path.join(os.tmpdir(), "query-opposite-"));
	t.after(() => rm(root, { recursive: true, force: true }));
	await writeFile(path.join(root, "a.md"), "---\nup: b\n---\n");
	await writeFile(path.join(root, "b.md"), "---\ndown: a\n---\n");
	await writeFile(path.join(root, "c.md"), "---\nup: b\n---\n");
	const vault = await openVault(root, {
		edgeFields: ["up", "down"],
		oppositeFields: { up: "below" },
	});
	const g = vault.graph();
	assert.deepEqual(g.neighbors("b.md", { types: ["below"] }).data, [
		{ source: "b.md", target: "a.md", type: "below", implied: true },
		{ source: "b.md", target: "c.md", type: "below", implied: true },
	]);
	assert.equal(g.neighbors("a.md").data[0].implied, undefined);
	assert.equal(g.stats().edgeCount, 5);
	await assert.rejects(
		openVault(root, { edgeFields: ["up"], oppositeFields: { x: "y" } }),
		code("INVALID_OPTIONS"),
	);
	await assert.rejects(
		openVault(root, {
			edgeFields: ["up"],
			oppositeFields: { up: "r" },
			limits: { maxEdges: 3 },
		}),
		code("LIMIT_EXCEEDED"),
	);
});
