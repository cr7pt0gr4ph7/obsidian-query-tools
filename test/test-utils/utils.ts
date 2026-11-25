import { mkdir, mkdtemp, rm, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import type { TestContext } from "node:test";
import { Component } from "../../src/host/obsidian/base/component.ts";

export async function createTestVaultFixture(kind: "simple", t: TestContext) {
	if (kind === "simple") {
		const root = await mkdtemp(path.join(os.tmpdir(), "query-tools-test-"));
		t.after(() => rm(root, { recursive: true, force: true }));
		await mkdir(path.join(root, "Tasks", "nested"), { recursive: true });
		await writeFile(path.join(root, "Tasks", "a.md"), `---\nparent: root\n---\nstatus:: open\n`);
		await writeFile(path.join(root, "Tasks", "nested", "b.md"), "---\nparent: [root.md, Tasks/a.md]\n---\n");
		await writeFile(path.join(root, "root.md"), "# Root\n");
		return root;
	} else {
		throw new Error(`Unknown test vault kind: ${kind}`);
	}
}

export function createRootComponent(t: TestContext): Component {
	const component = new Component();
	component.load();
	t.after(() => component.unload());
	return component;
}

export { awaitEvent } from "../../src/host/obsidian/base/events.internal.js";
