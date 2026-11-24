import assert from "node:assert/strict";
import { mkdir, mkdtemp, rm, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import type { TestContext } from "node:test";
import test, { beforeEach, suite } from "node:test";
import { DataviewApi, DEFAULT_DATAVIEW_SETTINGS, FullIndex } from "obsidian-dataview";
import { DataviewManifest } from "../../../src/host/dataview/manifest.ts";
import { App } from "../../../src/host/obsidian/app.ts";
import { Component } from "../../../src/host/obsidian/base/component.ts";

async function createTestVaultFixture(t: TestContext) {
	const root = await mkdtemp(path.join(os.tmpdir(), "query-tools-test-"));
	t.after(() => rm(root, { recursive: true, force: true }));
	await mkdir(path.join(root, "Tasks", "nested"), { recursive: true });
	await writeFile(path.join(root, "Tasks", "a.md"), `---\nparent: root\n---\nstatus:: open\n`);
	await writeFile(path.join(root, "Tasks", "nested", "b.md"), "---\nparent: [root.md, Tasks/a.md]\n---\n");
	await writeFile(path.join(root, "root.md"), "# Root\n");
	return root;
}

function createRootComponent(t: TestContext): Component {
	const component = new Component();
	component.load();
	t.after(() => component.unload());
	return component;
}

suite("Dataview API", () => {
	let rootComponent: Component;
	let root: string;

	beforeEach(async (t) => {
		rootComponent = createRootComponent(t as TestContext);
		root = await createTestVaultFixture(t as TestContext);
	});

	test("can initialize a Dataview API instance", async (t) => {
		const app = new App({ appId: "test-vault", basePath: root });
		const index = rootComponent.addChild(
			FullIndex.create(app, DataviewManifest.indexVersion, () => {
				console.log("Dataview index has changed");
			}),
		);
		const settings = DEFAULT_DATAVIEW_SETTINGS;
		const api = new DataviewApi(app, index, settings, DataviewManifest.pluginVersion);
		assert.ok(api);
	});

	test("can initialize the Dataview index", async (t) => {
		const app = new App({ appId: "test-vault", basePath: root });
		const index = rootComponent.addChild(
			FullIndex.create(app, DataviewManifest.indexVersion, () => {
				console.log("Dataview index has changed");
			}),
		);
		const settings = DEFAULT_DATAVIEW_SETTINGS;
		const api = new DataviewApi(app, index, settings, DataviewManifest.pluginVersion);
		assert.ok(api);
		api.index.initialize();
	});
});
