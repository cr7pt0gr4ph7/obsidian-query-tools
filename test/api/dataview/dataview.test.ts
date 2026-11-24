import assert from "node:assert/strict";
import { mkdir, mkdtemp, rm, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import type { TestContext } from "node:test";
import test from "node:test";
import { DataviewApi, DataviewWrapper, DEFAULT_DATAVIEW_SETTINGS, FullIndex } from "../../../lib/dataview/wrapper.ts";
import { App } from "../../../src/host/obsidian/app.ts";
import "../../../src/host/web-worker/worker-polyfill.ts";


async function createTestVaultFixture(t: TestContext) {
	const root = await mkdtemp(path.join(os.tmpdir(), "query-tools-test-"));
	t.after(() => rm(root, { recursive: true, force: true }));
	await mkdir(path.join(root, "Tasks", "nested"), { recursive: true });
	await writeFile(path.join(root, "Tasks", "a.md"), `---\nparent: root\n---\nstatus:: open\n`);
	await writeFile(path.join(root, "Tasks", "nested", "b.md"), "---\nparent: [root.md, Tasks/a.md]\n---\n");
	await writeFile(path.join(root, "root.md"), "# Root\n");
	return root;
}

test("can initialize a Dataview API instance", async (t) => {
	const root = await createTestVaultFixture(t);
	const app = new App({ appId: "test-vault", basePath: root });
	const index = FullIndex.create(app, DataviewWrapper.indexVersion, () => {
		console.log("Dataview index has changed");
	});
	const settings = DEFAULT_DATAVIEW_SETTINGS;
	const api = new DataviewApi(app, index, settings, DataviewWrapper.pluginVersion);
	assert.ok(api);
});
