import assert from "node:assert/strict";
import { mkdtemp, mkdir, readFile, rm, symlink, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import test from "node:test";
import { openVault, VaultQueryError } from "../src/index.js";
import { fileURLToPath } from "node:url";

async function fixture(t) {
  const root = await mkdtemp(path.join(os.tmpdir(), "query-tools-test-"));
  t.after(() => rm(root, { recursive: true, force: true }));
  await mkdir(path.join(root, "Tasks", "nested"), { recursive: true });
  await writeFile(path.join(root, "Tasks", "a.md"), "---\nparent: root\n---\nstatus:: open\n");
  await writeFile(path.join(root, "Tasks", "nested", "b.md"), "---\nparent: [root.md, Tasks/a.md]\n---\n");
  await writeFile(path.join(root, "root.md"), "# Root\n");
  return root;
}

const code = expected => error => {
  assert.ok(error instanceof VaultQueryError);
  assert.equal(error.code, expected);
  return true;
};

test("folder query and configured directed edges share an index", async t => {
  const root = await fixture(t);
  const before = await readFile(path.join(root, "Tasks", "a.md"), "utf8");
  const vault = await openVault(root, { edgeFields: ["parent"] });
  const listed = vault.list('lIsT FROM "Tasks"');
  assert.deepEqual(listed.data, ["Tasks/a.md", "Tasks/nested/b.md"]);
  assert.equal(listed.generation, 1);
  assert.equal(listed.truncated, false);
  assert.equal(listed.diagnostics[0].code, "NON_ATOMIC_SNAPSHOT");
  assert.deepEqual(vault.list('LIST FROM ""', { limit: 1 }).data, ["Tasks/a.md"]);
  assert.equal(vault.list('LIST FROM ""', { limit: 1 }).truncated, true);
  assert.deepEqual(vault.neighbors("Tasks/nested/b.md").data, [
    { source: "Tasks/nested/b.md", target: "Tasks/a.md", type: "parent" },
    { source: "Tasks/nested/b.md", target: "root.md", type: "parent" },
  ]);
  assert.equal(vault.neighbors("root.md", { direction: "incoming" }).data.length, 2);
  assert.deepEqual(vault.neighbors("root.md", { direction: "incoming", types: [] }).data, []);
  assert.equal(await readFile(path.join(root, "Tasks", "a.md"), "utf8"), before);
  vault.close();
  assert.throws(() => vault.list('LIST FROM ""'), code("VAULT_CLOSED"));
});

test("indexes the pinned upstream Dataview task fixture as a path only", async () => {
  const root = fileURLToPath(new URL("./fixtures/dataview/", import.meta.url));
  const vault = await openVault(root);
  assert.deepEqual(vault.list('LIST FROM "tasks"').data, ["tasks/checklist.md"]);
  assert.throws(() => vault.list("TASK FROM #page-tag"), code("INVALID_QUERY"));
});

test("Dataview-inspired unsupported syntax is rejected rather than approximated", async t => {
  const vault = await openVault(await fixture(t));
  for (const query of [
    "LIST", "LIST FROM #games", "list from [[Stuff]]",
    'LIST FROM "Tasks" WHERE status = "open"', 'TABLE FROM "Tasks"',
    'LIST FROM "Tasks" OR #games', 'LIST FROM "Tasks',
  ]) assert.throws(() => vault.list(query), code("INVALID_QUERY"));
  assert.throws(() => vault.list('LIST FROM "../outside"'), code("INVALID_PATH"));
  assert.throws(() => vault.neighbors("../root.md"), code("INVALID_PATH"));
  assert.throws(() => vault.neighbors("root.md", { direction: "both" }), code("INVALID_OPTIONS"));
  assert.throws(() => vault.list('LIST FROM ""', { limit: 1001 }), code("INVALID_OPTIONS"));
});

test("refresh publishes additions, modifications and deletions atomically on success", async t => {
  const root = await fixture(t);
  const vault = await openVault(root, { edgeFields: ["parent"] });
  await writeFile(path.join(root, "Tasks", "a.md"), "---\nparent: missing\n---\n");
  await assert.rejects(vault.refresh(), code("UNRESOLVED_EDGE"));
  assert.equal(vault.list('LIST FROM ""').generation, 1);
  assert.equal(vault.neighbors("root.md", { direction: "incoming" }).data.length, 2);
  await writeFile(path.join(root, "Tasks", "a.md"), "---\nparent: Tasks/nested/b\n---\n");
  await rm(path.join(root, "root.md"));
  await writeFile(path.join(root, "Tasks", "nested", "b.md"), "# no edges\n");
  await writeFile(path.join(root, "new.md"), "# new\n");
  assert.equal(await vault.refresh(), 2);
  assert.deepEqual(vault.list('LIST FROM ""').data, ["Tasks/a.md", "Tasks/nested/b.md", "new.md"]);
  assert.equal(vault.neighbors("Tasks/nested/b.md", { direction: "incoming" }).data.length, 1);
  assert.throws(() => vault.neighbors("root.md"), code("NOT_FOUND"));
});

test("malformed fields, limits and symlinks fail explicitly", async t => {
  const root = await fixture(t);
  await assert.rejects(openVault(root, { limits: { maxFiles: 2 } }), code("LIMIT_EXCEEDED"));
  await assert.rejects(openVault(root, { limits: { maxEntries: 1 } }), code("LIMIT_EXCEEDED"));
  await assert.rejects(openVault(root, { limits: { maxFileBytes: 2 } }), code("LIMIT_EXCEEDED"));
  await assert.rejects(openVault(root, { edgeFields: ["parent"], limits: { maxEdges: 1 } }), code("LIMIT_EXCEEDED"));
  await writeFile(path.join(root, "root.md"), "---\nparent: '[[Tasks/a]]'\n---\n");
  await assert.rejects(openVault(root, { edgeFields: ["parent"] }), code("INVALID_EDGE"));
  await writeFile(path.join(root, "root.md"), "---\nparent: [unterminated\n---\n");
  await assert.rejects(openVault(root, { edgeFields: ["parent"] }), code("INVALID_FRONTMATTER"));
  await writeFile(path.join(root, "root.md"), "# root\n");
  await symlink(os.tmpdir(), path.join(root, "outside"));
  await assert.rejects(openVault(root), code("UNSAFE_PATH"));
});

test("rejects invalid configuration and does not execute note JavaScript", async t => {
  const root = await fixture(t);
  await assert.rejects(openVault(root, { limits: { toString: 1 } }), code("INVALID_OPTIONS"));
  await assert.rejects(openVault(root, { edgeFields: ["parent", "parent"] }), code("INVALID_OPTIONS"));
  await writeFile(path.join(root, "script.md"), "```dataviewjs\nthrow new Error('executed');\n```\n");
  const vault = await openVault(root);
  assert.ok(vault.list('LIST FROM ""').data.includes("script.md"));
});
