import assert from "node:assert/strict";
import type { TestContext } from "node:test";
import test, { beforeEach, suite } from "node:test";
import { BreadcrumbsPlugin } from "obsidian-breadcrumbs";
import breadcrumbsManifest from "obsidian-breadcrumbs/manifest.json" with { type: "json" };
import { App } from "../../../src/host/obsidian/app.ts";
import type { Component } from "../../../src/host/obsidian/base/component.ts";
import { awaitEvent, createRootComponent, createTestVaultFixture } from "../../test-utils/utils.js";

suite("Breadcrumbs API", () => {
	let rootComponent: Component;
	let root: string;
    let app: App;

	beforeEach(async (t) => {
		rootComponent = createRootComponent(t as TestContext);
		root = await createTestVaultFixture("simple-breadcrumbs", t as TestContext);
        app = new App({ appId: "test-vault", basePath: root });

        await app.vault.initialize();
		await app.metadataCache.initialize();
	});

	test("can initialize a Breadcrumbs plugin instance", async (t) => {
		const plugin = rootComponent.addChild(new BreadcrumbsPlugin(app, breadcrumbsManifest));
		assert.ok(plugin);
	});
});
