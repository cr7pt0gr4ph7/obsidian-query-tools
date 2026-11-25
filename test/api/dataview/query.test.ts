import assert from "node:assert/strict";
import { mkdir, mkdtemp, rm, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { test } from "node:test";
import { buildDataviewIndex } from "../../../src/api/dataview/query.ts";
import { openVault } from "../../../src/api/index.ts";

test("pinned Dataview engine evaluates LIST and TABLE over frontmatter", async (t) => {
	const root = await mkdtemp(path.join(os.tmpdir(), "dataview-query-"));
	t.after(() => rm(root, { recursive: true, force: true }));
	await mkdir(path.join(root, "Projects", "nested"), { recursive: true });
	await writeFile(path.join(root, "Projects", "a.md"), "---\nstatus: open\npriority: 2\n---\n");
	await writeFile(path.join(root, "Projects", "b.md"), "---\nstatus: closed\npriority: 1\n---\n");
	await writeFile(path.join(root, "Projects", "nested", "c.md"), "---\nstatus: open\npriority: 3\n---\n");
	const index = await buildDataviewIndex(root, { maxEntries: 100, maxFiles: 10, maxFileBytes: 1000, maxResults: 10 });
	t.after(() => index.close());
	const list = await index.query('LIST FROM "Projects" WHERE status = "open" SORT priority ASC', undefined, 1, 10);
	assert.deepEqual(list.data, {
		type: "list",
		values: [
			{ type: "link", path: "Projects/a.md", linkType: "file", embed: false, subpath: null, display: null },
			{ type: "link", path: "Projects/nested/c.md", linkType: "file", embed: false, subpath: null, display: null },
		],
	});
	const table = await index.query('TABLE status, priority FROM "Projects" SORT priority DESC', undefined, 1, 2);
	assert.equal(table.truncated, true);
	assert.deepEqual(table.data.type, "table");
	if (table.data.type !== "table") throw new Error("Expected table.");
	assert.deepEqual(table.data.headers, ["File", "status", "priority"]);
	assert.deepEqual(
		table.data.values.map((row) => row.slice(1)),
		[
			["open", 3],
			["open", 2],
		],
	);
	await assert.rejects(index.query("TASK", undefined, 1, 10), { code: "UNSUPPORTED_FEATURE" });
	await assert.rejects(index.query("CALENDAR file.day", undefined, 1, 10), { code: "UNSUPPORTED_FEATURE" });
	await assert.rejects(index.query("not valid", undefined, 1, 10), { code: "INVALID_QUERY" });
	const originalFetch = globalThis.fetch;
	let fetchCalls = 0;
	globalThis.fetch = async () => {
		fetchCalls++;
		throw new Error("Network access was attempted");
	};
	try {
		for (const source of ["https://example.invalid/data.csv", "file:///etc/passwd", "local.csv"]) {
			await assert.rejects(index.query(`LIST FROM csv("${source}")`, undefined, 1, 10), {
				code: "UNSUPPORTED_FEATURE",
			});
		}
		await assert.rejects(index.query('LIST FROM "Projects" OR csv("local.csv")', undefined, 1, 10), {
			code: "UNSUPPORTED_FEATURE",
		});
		await assert.rejects(index.query('LIST FROM !csv("local.csv")', undefined, 1, 10), {
			code: "UNSUPPORTED_FEATURE",
		});
		assert.equal(fetchCalls, 0);
	} finally {
		globalThis.fetch = originalFetch;
	}
});

test("vault publishes both query indexes together and preserves them after failed refresh", async (t) => {
	const root = await mkdtemp(path.join(os.tmpdir(), "dataview-refresh-"));
	t.after(() => rm(root, { recursive: true, force: true }));
	await writeFile(path.join(root, "a.md"), "---\r\nstatus: open\r\npriority: 2\r\n---\r\ninline:: hidden\r\n");
	const vault = await openVault(root);
	t.after(() => vault.close());
	const initial = await vault.query("TABLE WITHOUT ID status, priority, inline SORT priority");
	assert.deepEqual(initial, {
		generation: 1,
		data: { type: "table", headers: ["status", "priority", "inline"], values: [["open", 2, null]] },
		diagnostics: [{ code: "NON_ATOMIC_SNAPSHOT", message: "The filesystem may change during indexing." }],
		truncated: false,
	});
	assert.deepEqual(vault.list('LIST FROM ""').data, ["a.md"]);
	await assert.rejects(vault.query("LIST", { file: "missing.md" }), { code: "NOT_FOUND" });
	await writeFile(path.join(root, "b.md"), "---\nstatus: closed\npriority: 1\n---\n");
	const inFlight = vault.query("LIST");
	const refresh = vault.refresh();
	await assert.rejects(vault.refresh(), { code: "REFRESH_IN_PROGRESS" });
	assert.equal((await inFlight).generation, 1);
	assert.equal(await refresh, 2);
	assert.deepEqual((await vault.query("TABLE WITHOUT ID status SORT priority")).data, {
		type: "table",
		headers: ["status"],
		values: [["closed"], ["open"]],
	});
	assert.deepEqual(vault.list('LIST FROM ""').data, ["a.md", "b.md"]);
	await writeFile(path.join(root, "b.md"), "---\ninvalid: [\n---\n");
	await assert.rejects(vault.refresh());
	assert.equal((await vault.query("LIST")).generation, 2);
	assert.deepEqual(vault.list('LIST FROM ""').data, ["a.md", "b.md"]);
	vault.close();
	await assert.rejects(vault.query("LIST"), { code: "VAULT_CLOSED" });
});

test("Dataview serializes nested frontmatter and uses current-file context", async (t) => {
	const root = await mkdtemp(path.join(os.tmpdir(), "dataview-values-"));
	t.after(() => rm(root, { recursive: true, force: true }));
	await writeFile(
		path.join(root, "a.md"),
		'---\nstatus: open\nflag: true\nitems: [1, two, null]\ninfo: { name: example }\ntarget: "[[b]]"\n---\n',
	);
	await writeFile(path.join(root, "b.md"), "# b\n");
	const vault = await openVault(root);
	t.after(() => vault.close());
	const result = await vault.query('TABLE WITHOUT ID flag, items, info, target FROM "" WHERE status = this.status', {
		file: "a.md",
	});
	assert.deepEqual(result.data, {
		type: "table",
		headers: ["flag", "items", "info", "target"],
		values: [
			[
				true,
				[1, "two", null],
				{ name: "example" },
				{
					type: "link",
					path: "b.md",
					linkType: "file",
					embed: false,
					subpath: null,
					display: null,
				},
			],
		],
	});
	assert.equal((await vault.query("LIST", { limit: 1 })).truncated, true);
	assert.deepEqual((await vault.query('LIST FROM "missing"')).data, { type: "list", values: [] });
});
