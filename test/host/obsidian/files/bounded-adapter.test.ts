import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { mkdir, mkdtemp, readFile, rm, symlink, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { suite, test } from "node:test";
import { App } from "../../../../src/host/obsidian/app.ts";
import { BoundedDataAdapter } from "../../../../src/host/obsidian/files/adapter_bounded.ts";
import { Vault } from "../../../../src/host/obsidian/files/vault.ts";

const limits = { maxEntries: 10, maxFiles: 2, maxFileBytes: 4 };

suite("Bounded data adapter", () => {
	test("captures a confined read-only snapshot for the host vault", async (t) => {
		const root = await mkdtemp(path.join(os.tmpdir(), "bounded-adapter-"));
		t.after(() => rm(root, { recursive: true, force: true }));
		await mkdir(path.join(root, "notes"));
		await writeFile(path.join(root, "notes", "a.md"), "test");
		await writeFile(path.join(root, "other.txt"), "not captured");
		const adapter = await BoundedDataAdapter.create(root, limits);
		const vault = new Vault(adapter);
		await vault.initialize();
		assert.equal(vault.getAbstractFileByPath("/"), vault.getRoot());
		assert.deepEqual(
			vault.getMarkdownFiles().map((file) => file.path),
			["notes/a.md"],
		);
		assert.equal(await adapter.read("notes/a.md"), "test");
		assert.deepEqual([...new Uint8Array(await adapter.readBinary("notes/a.md"))], [...Buffer.from("test")]);
		await writeFile(path.join(root, "notes", "a.md"), "new");
		assert.equal(await adapter.read("notes/a.md"), "test");
		await assert.rejects(adapter.read("other.txt"));
		await assert.rejects(adapter.read("../outside.md"));
		await assert.rejects(adapter.read("/outside.md"));
		await assert.rejects(adapter.read("notes/\0bad.md"));
		const mutations = [
			() => adapter.write("notes/a.md", "bad"),
			() => adapter.writeBinary("notes/a.md", new ArrayBuffer(1)),
			() => adapter.append("notes/a.md", "bad"),
			() => adapter.appendBinary("notes/a.md", new ArrayBuffer(1)),
			() => adapter.process("notes/a.md", () => "bad"),
			() => adapter.mkdir("new"),
			() => adapter.trashSystem("notes/a.md"),
			() => adapter.trashLocal("notes/a.md"),
			() => adapter.rmdir("notes", true),
			() => adapter.remove("notes/a.md"),
			() => adapter.rename("notes/a.md", "b.md"),
			() => adapter.copy("notes/a.md", "b.md"),
		];
		for (const mutate of mutations) await assert.rejects(mutate(), { code: "UNSUPPORTED_FEATURE" });
		assert.throws(() => adapter.getResourcePath("notes/a.md"), { code: "UNSUPPORTED_FEATURE" });
		assert.equal(await readFile(path.join(root, "notes", "a.md"), "utf8"), "new");
	});

	test("enforces entry, file, and byte limits without double counting reads", async (t) => {
		const root = await mkdtemp(path.join(os.tmpdir(), "bounded-limits-"));
		t.after(() => rm(root, { recursive: true, force: true }));
		await writeFile(path.join(root, "a.md"), "1234");
		await writeFile(path.join(root, "b.md"), "1");
		const adapter = await BoundedDataAdapter.create(root, { maxEntries: 2, maxFiles: 2, maxFileBytes: 4 });
		assert.equal(await adapter.read("a.md"), "1234");
		assert.equal(await adapter.read("a.md"), "1234");
		await assert.rejects(BoundedDataAdapter.create(root, { ...limits, maxEntries: 1 }), { code: "LIMIT_EXCEEDED" });
		await assert.rejects(BoundedDataAdapter.create(root, { ...limits, maxFiles: 1 }), { code: "LIMIT_EXCEEDED" });
		await assert.rejects(BoundedDataAdapter.create(root, { ...limits, maxFileBytes: 3 }), { code: "LIMIT_EXCEEDED" });
		await writeFile(path.join(root, "a.md"), Buffer.from([0xff]));
		await assert.rejects(BoundedDataAdapter.create(root, limits), { code: "INVALID_ENCODING" });
	});

	test("rejects symlinks in the indexed tree", async (t) => {
		const root = await mkdtemp(path.join(os.tmpdir(), "bounded-symlink-"));
		const outside = await mkdtemp(path.join(os.tmpdir(), "bounded-outside-"));
		t.after(async () => {
			await rm(root, { recursive: true, force: true });
			await rm(outside, { recursive: true, force: true });
		});
		await writeFile(path.join(outside, "secret.md"), "secret");
		await symlink(outside, path.join(root, "linked"));
		await assert.rejects(BoundedDataAdapter.create(root, limits), { code: "UNSAFE_PATH" });
		await rm(path.join(root, "linked"));
		await symlink(path.join(outside, "secret.md"), path.join(root, "leaf.md"));
		await assert.rejects(BoundedDataAdapter.create(root, limits), { code: "UNSAFE_PATH" });
		await rm(path.join(root, "leaf.md"));
		execFileSync("mkfifo", [path.join(root, "pipe")]);
		await assert.rejects(BoundedDataAdapter.create(root, limits), { code: "UNSAFE_PATH" });
		assert.equal(await readFile(path.join(outside, "secret.md"), "utf8"), "secret");
	});

	test("injected snapshot supplies partial metadata and deterministic link resolution", async (t) => {
		const root = await mkdtemp(path.join(os.tmpdir(), "bounded-host-"));
		t.after(() => rm(root, { recursive: true, force: true }));
		await mkdir(path.join(root, "first"));
		await mkdir(path.join(root, "second"));
		await writeFile(path.join(root, "first", "item.md"), "---\r\nstatus: open\r\n---\r\n# body\nfield:: hidden\n");
		await writeFile(path.join(root, "second", "item.md"), "# other\n");
		await writeFile(path.join(root, "second", "source.md"), "# source\n");
		const adapter = await BoundedDataAdapter.create(root, { maxEntries: 10, maxFiles: 3, maxFileBytes: 100 });
		const app = new App({ appId: "test", basePath: root, adapter });
		await app.vault.initialize();
		await app.metadataCache.initialize();
		assert.equal(app.metadataCache.getCache("first/item.md")?.frontmatter?.status, "open");
		assert.deepEqual(app.metadataCache.getCache("first/item.md")?.sections, []);
		assert.equal(app.metadataCache.getFirstLinkpathDest("item", "second/source.md")?.path, "second/item.md");
		assert.equal(app.metadataCache.getFirstLinkpathDest("first/item", "second/source.md")?.path, "first/item.md");
		assert.equal(app.metadataCache.getFirstLinkpathDest("item", "source.md")?.path, "first/item.md");
		assert.equal(app.metadataCache.getFirstLinkpathDest("../outside", "source.md"), null);
	});
});
