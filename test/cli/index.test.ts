import assert from "node:assert/strict";
import { execFile } from "node:child_process";
import { mkdtemp, rm, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { promisify } from "node:util";
import { fileURLToPath } from "node:url";
import test from "node:test";
import { openVault } from "../../dist/api/index.js";

const exec = promisify(execFile);
const cli = fileURLToPath(new URL("../../dist/cli/index.js", import.meta.url));

test("CLI results match the shared API and errors do not corrupt stdout", async t => {
  const root = await mkdtemp(path.join(os.tmpdir(), "query-cli-test-"));
  t.after(() => rm(root, { recursive: true, force: true }));
  await writeFile(path.join(root, "a.md"), "---\nparent: b\n---\n");
  await writeFile(path.join(root, "b.md"), "# b\n");
  const vault = await openVault(root, { edgeFields: ["parent"] });
  const common = [cli, "--vault", root, "--edge-field", "parent"];
  const list = await exec(process.execPath, [...common, "list", 'LIST FROM ""', "--limit", "1"]);
  assert.equal(list.stderr, "");
  assert.deepEqual(JSON.parse(list.stdout), vault.list('LIST FROM ""', { limit: 1 }));
  const neighbors = await exec(process.execPath, [...common, "neighbors", "b.md", "--direction", "incoming", "--type", "parent"]);
  assert.equal(neighbors.stderr, "");
  assert.deepEqual(JSON.parse(neighbors.stdout), vault.neighbors("b.md", { direction: "incoming", types: ["parent"] }));
  await assert.rejects(exec(process.execPath, [...common, "list", "TASK FROM #tag"]), error => {
    assert.ok(error instanceof Error && "code" in error && "stdout" in error && "stderr" in error);
    assert.ok(typeof error.stderr === "string");
    assert.equal(error.code, 1);
    assert.equal(error.stdout, "");
    assert.equal(JSON.parse(error.stderr).error.code, "INVALID_QUERY");
    return true;
  });
  await assert.rejects(exec(process.execPath, [...common, "list", 'LIST FROM ""', "--limit", "1.5"]), error => {
    assert.ok(error instanceof Error && "stdout" in error && "stderr" in error);
    assert.ok(typeof error.stderr === "string");
    assert.equal(error.stdout, "");
    assert.equal(JSON.parse(error.stderr).error.code, "INVALID_OPTIONS");
    return true;
  });
  vault.close();
});
