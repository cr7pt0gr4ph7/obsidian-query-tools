import assert from "node:assert/strict";
import { mkdir, mkdtemp, readFile, rm, symlink, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { test } from "node:test";
import { fileURLToPath } from "node:url";
import { FileSystemAdapter } from "../../../../src/host/obsidian/files/adapter_filesystem.js";

async function makeRoot(): Promise<string> {
	return mkdtemp(path.join(os.tmpdir(), "obsidian-mock-adapter-"));
}

test("filesystem adapter reads, writes, stats, lists, and processes vault paths", async (t) => {
	const root = await makeRoot();
	t.after(() => rm(root, { recursive: true, force: true }));
	const adapter = new FileSystemAdapter(root);

	await adapter.mkdir("notes/nested");
	await adapter.write("notes/nested/a.md", "one");
	assert.equal(await adapter.read("notes/nested/a.md"), "one");
	await adapter.append("notes/nested/a.md", " two");
	assert.equal(await adapter.process("notes/nested/a.md", (text) => text.toUpperCase()), "ONE TWO");
	assert.deepEqual(await adapter.list("notes"), { files: [], folders: ["notes/nested"] });
	assert.deepEqual(await adapter.list("notes/nested"), { files: ["notes/nested/a.md"], folders: [] });
	assert.equal((await adapter.stat("notes/nested/a.md"))?.type, "file");
	assert.equal((await adapter.stat("notes"))?.type, "folder");
	assert.equal(await adapter.stat("missing"), null);
	assert.equal(await adapter.exists("notes/nested/a.md"), true);
	assert.equal(await adapter.exists("NOTES/NESTED/A.MD"), true);
	assert.equal(await adapter.exists("NOTES/NESTED/A.MD", true), false);
	assert.equal(adapter.getName(), path.basename(root));
	assert.equal(adapter.getBasePath(), root);
	assert.equal(adapter.getFullPath("."), root);

	const bytes = new Uint8Array([0, 1, 255]);
	await adapter.writeBinary("binary.dat", bytes.buffer);
	assert.deepEqual([...new Uint8Array(await adapter.readBinary("binary.dat"))], [...bytes]);
	await adapter.appendBinary("binary.dat", new Uint8Array([2]).buffer);
	assert.deepEqual([...new Uint8Array(await adapter.readBinary("binary.dat"))], [0, 1, 255, 2]);

	await adapter.copy("binary.dat", "copy.dat");
	assert.deepEqual(await readFile(path.join(root, "copy.dat")), Buffer.from([0, 1, 255, 2]));
	await assert.rejects(adapter.copy("binary.dat", "copy.dat"), { code: "EEXIST" });
	await adapter.rename("copy.dat", "renamed.dat");
	assert.equal(await adapter.exists("renamed.dat"), true);
	assert.equal(adapter.getResourcePath("renamed.dat"), adapter.getFilePath("renamed.dat"));
	assert.equal(fileURLToPath(adapter.getFilePath("renamed.dat")), path.join(root, "renamed.dat"));
	await adapter.remove("renamed.dat");
	assert.equal(await adapter.exists("renamed.dat"), false);
	assert.ok(Number.isFinite((await adapter.stat("notes/nested/a.md"))?.ctime));
});

test("filesystem adapter confines relative paths and rejects symlinks", async (t) => {
	const root = await makeRoot();
	const outside = await makeRoot();
	t.after(async () =>
		Promise.all([rm(root, { recursive: true, force: true }), rm(outside, { recursive: true, force: true })]),
	);
	await writeFile(path.join(outside, "secret.txt"), "secret");
	await symlink(outside, path.join(root, "linked"));
	const adapter = new FileSystemAdapter(root);

	assert.throws(() => adapter.getFullPath("../outside"), /escapes the vault root/);
	assert.throws(() => adapter.getFullPath(path.join(outside, "secret.txt")), /Absolute paths are disabled/);
	await assert.rejects(adapter.read("linked/secret.txt"), /Symlink paths are not allowed/);
	await assert.rejects(adapter.write("linked/new.txt", "bad"), /Symlink paths are not allowed/);
	assert.equal(await readFile(path.join(outside, "secret.txt"), "utf8"), "secret");
});

test("absolute paths are only accepted when explicitly enabled", async (t) => {
	const root = await makeRoot();
	const externalFile = path.join(root, "external.txt");
	await writeFile(externalFile, "external");
	t.after(() => rm(root, { recursive: true, force: true }));
	await mkdir(path.join(root, "vault"));
	const adapter = new FileSystemAdapter(path.join(root, "vault"), true);

	assert.equal(adapter.getFullPath(externalFile), externalFile);
	assert.equal(await adapter.read(externalFile), "external");
	await adapter.write(externalFile, "changed");
	assert.equal(await readFile(externalFile, "utf8"), "changed");
});

test("local trash, timestamps, and directory removal work", async (t) => {
	const root = await makeRoot();
	t.after(() => rm(root, { recursive: true, force: true }));
	const adapter = new FileSystemAdapter(root);

	assert.equal(await adapter.trashSystem("gone.txt"), false);
	await adapter.write("gone.txt", "trash", { mtime: 1_000_000 });
	const trashedStat = await adapter.stat("gone.txt");
	assert.ok(trashedStat);
	assert.ok(Math.abs(trashedStat.mtime - 1_000_000) < 5);
	await adapter.trashLocal("gone.txt");
	assert.equal(await adapter.read(".trash/gone.txt"), "trash");
	await adapter.mkdir("empty/nested");
	await adapter.rmdir("empty", true);
	assert.equal(await adapter.exists("empty"), false);
	await adapter.mkdir("not-empty/child");
	await assert.rejects(adapter.rmdir("not-empty", false));
	await assert.rejects(adapter.rmdir(".", true), /Cannot remove the vault root/);
});

test("static local helpers operate on explicitly supplied absolute paths", async (t) => {
	const root = await makeRoot();
	t.after(() => rm(root, { recursive: true, force: true }));
	await FileSystemAdapter.mkdir(path.join(root, "nested"));
	await writeFile(path.join(root, "nested", "file.txt"), "static");
	assert.equal(
		new TextDecoder().decode(await FileSystemAdapter.readLocalFile(path.join(root, "nested", "file.txt"))),
		"static",
	);
});
