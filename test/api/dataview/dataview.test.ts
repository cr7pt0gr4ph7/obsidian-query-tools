import assert from "node:assert/strict";
import path from "node:path";
import type { TestContext } from "node:test";
import test, { beforeEach, suite } from "node:test";
import { DataviewApi, DEFAULT_DATAVIEW_SETTINGS, FullIndex } from "obsidian-dataview";
import { DataviewManifest } from "../../../src/host/dataview/manifest.ts";
import { App } from "../../../src/host/obsidian/app.ts";
import type { Component } from "../../../src/host/obsidian/base/component.ts";
import { awaitEvent, createRootComponent, createTestVaultFixture } from "../../test-utils/utils.js";

suite("Dataview API", () => {
	let rootComponent: Component;
	let root: string;

	beforeEach(async (t) => {
		rootComponent = createRootComponent(t as TestContext);
		root = await createTestVaultFixture("simple", t as TestContext);
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
		api.index.initialize();
		assert.ok(api);
	});

	test("correctly indexes the pages when initializing the Dataview index", async (t) => {
		const app = new App({ appId: "test-vault", basePath: root });
		await app.vault.initialize();
		await app.metadataCache.initialize();

		const index = rootComponent.addChild(
			FullIndex.create(app, DataviewManifest.indexVersion, () => {
				console.log("Dataview index has changed");
			}),
		);

		const settings = DEFAULT_DATAVIEW_SETTINGS;
		const api = new DataviewApi(app, index, settings, DataviewManifest.pluginVersion);
		const indexReady = awaitEvent(app.metadataCache, "dataview:index-ready", 5000);
		api.index.initialize();
		await indexReady;
		assert.equal(api.index.pages.size, 3);
		assert.ok(api.index.pages.has(path.join(root, "Tasks", "a.md")));
		assert.ok(api.index.pages.has(path.join(root, "Tasks", "nested", "b.md")));
		assert.ok(api.index.pages.has(path.join(root, "root.md")));
		assert.ok(api);
	});
});
