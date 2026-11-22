import assert from "node:assert/strict";
import { mkdir, mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { test } from "node:test";
import { FileSystemAdapter } from "../../../../src/host/obsidian/files/adapter_filesystem.ts";
import { TAbstractFile, TExternalFile, TFile, TFolder } from "../../../../src/host/obsidian/files/files.ts";
import { Vault } from "../../../../src/host/obsidian/files/vault.ts";

async function makeRoot(): Promise<string> {
	return mkdtemp(path.join(os.tmpdir(), "obsidian-mock-vault-"));
}

test("vault initialization indexes file objects and hierarchy", async (t) => {
	const root = await makeRoot();
	t.after(() => rm(root, { recursive: true, force: true }));
	await mkdir(path.join(root, "notes", "nested"), { recursive: true });
	await writeFile(path.join(root, "notes", "nested", "Home.MD"), "hello");
	await writeFile(path.join(root, "image.png"), Buffer.from([1, 2, 3]));
	const vault = new Vault(new FileSystemAdapter(root));

	assert.equal(vault.getRoot().isRoot(), true);
	assert.equal(vault.getAbstractFileByPath("notes"), null);
	await vault.initialize();

	const folder = vault.getFolderByPath("notes");
	const nestedFile = vault.getFileByPath("notes/nested/Home.MD");
	assert.ok(folder instanceof TFolder);
	assert.ok(nestedFile instanceof TFile);
	assert.ok(nestedFile instanceof TAbstractFile);
	assert.equal(nestedFile?.basename, "Home");
	assert.equal(nestedFile?.extension, "MD");
	assert.equal(nestedFile?.parent?.path, "notes/nested");
	assert.equal(nestedFile?.stat.size, 5);
	assert.equal(vault.getAbstractFileByPath("notes/nested"), nestedFile?.parent);
	assert.deepEqual(
		vault.getMarkdownFiles().map((file) => file.path),
		["notes/nested/Home.MD"],
	);
	assert.deepEqual(
		vault.getAllFolders().map((entry) => entry.path),
		["notes", "notes/nested"],
	);
	assert.equal(vault.getAllFolders(true)[0], vault.getRoot());
	assert.equal(vault.getAllLoadedFiles().includes(vault.getRoot()), false);

	await vault.adapter.write("later.md", "updated");
	await vault.initialize();
	const laterFile = vault.getFileByPath("later.md");
	assert.ok(laterFile);
	assert.equal(await vault.read(laterFile), "updated");
});

test("vault file operations update metadata, hierarchy, and disk", async (t) => {
	const root = await makeRoot();
	t.after(() => rm(root, { recursive: true, force: true }));
	const vault = new Vault(new FileSystemAdapter(root));
	await vault.initialize();

	const folder = await vault.createFolder("notes");
	const file = await vault.create("notes/note.md", "one");
	assert.equal(file.parent, folder);
	assert.equal(await vault.read(file), "one");
	await vault.append(file, " two");
	assert.equal(await vault.cachedRead(file), "one two");
	assert.equal(file.stat.size, 7);
	await vault.modify(file, "three");
	assert.equal(file.stat.size, 5);
	assert.equal(await vault.process(file, (content) => content.toUpperCase()), "THREE");
	assert.equal(await vault.read(file), "THREE");

	const binary = await vault.createBinary("notes/data.bin", new Uint8Array([0, 255]).buffer);
	assert.deepEqual([...new Uint8Array(await vault.readBinary(binary))], [0, 255]);
	await vault.modifyBinary(binary, new Uint8Array([3]).buffer);
	await vault.appendBinary(binary, new Uint8Array([1]).buffer);
	assert.deepEqual([...new Uint8Array(await vault.readBinary(binary))], [3, 1]);

	const copied = await vault.copy(file, "notes/copy.md");
	assert.equal(await vault.read(copied), "THREE");
	const copiedFolder = await vault.copy(folder, "notes-copy");
	assert.ok(copiedFolder instanceof TFolder);
	const copiedNote = vault.getFileByPath("notes-copy/note.md");
	assert.ok(copiedNote);
	assert.equal(await vault.read(copiedNote), "THREE");
	await assert.rejects(vault.copy(folder, "notes/nested"), /descendants/);
	await assert.rejects(vault.rename(folder, "notes/nested"), /descendants/);
	await vault.rename(folder, "renamed");
	assert.equal(file.path, "renamed/note.md");
	assert.equal(file.parent?.path, "renamed");
	assert.equal(vault.getFileByPath("renamed/note.md"), file);
	assert.equal(file.basename, "note");
	assert.equal(await readFile(path.join(root, "renamed", "note.md"), "utf8"), "THREE");
	await vault.trash(copied, false);
	assert.equal(await vault.getFileByPath("notes/copy.md"), null);
	assert.equal(await vault.adapter.exists(".trash/copy.md"), true);
	const renamedFolder = vault.getFolderByPath("renamed");
	assert.ok(renamedFolder);
	await assert.rejects(vault.delete(renamedFolder), /not empty/i);
	await vault.delete(renamedFolder, true);
	assert.equal(vault.getAbstractFileByPath("renamed"), null);
	assert.equal(await vault.adapter.exists("renamed"), false);
});

test("file manager generates attachment paths and updates frontmatter", async (t) => {
	const root = await makeRoot();
	t.after(() => rm(root, { recursive: true, force: true }));
	const vault = new Vault(new FileSystemAdapter(root));
	await vault.initialize();
	const note = await vault.create("note.md", "---\ntitle: Old\n---\nBody\n");

	await vault.fileManager.processFrontMatter(note, (frontmatter) => {
		frontmatter.title = "New";
		frontmatter.tags = ["test"];
	});
	assert.equal(await vault.read(note), "---\ntitle: New\ntags:\n  - test\n---\nBody\n");
	assert.equal(vault.fileManager.generateMarkdownLink(note, "folder/source.md"), "[[note]]");

	await vault.create("image.png", "");
	assert.equal(await vault.fileManager.getAvailablePathForAttachment("image.png"), "image 1.png");
	assert.equal(await vault.fileManager.getAvailablePathForAttachment("photo.jpg"), "photo.jpg");
	assert.equal(vault.fileManager.getNewFileParent("note.md"), vault.getRoot());
	assert.throws(() => vault.fileManager.promptForDeletion(note), /Method not implemented/);

	const malformed = await vault.create("malformed.md", "---\ntitle: [\n");
	await assert.rejects(
		vault.fileManager.processFrontMatter(malformed, () => undefined),
		/Unterminated YAML frontmatter/,
	);
	assert.equal(await vault.read(malformed), "---\ntitle: [\n");
});

test("vault paths are confined and external files require adapter opt-in", async (t) => {
	const root = await makeRoot();
	const vaultRoot = path.join(root, "vault");
	const outsideFile = path.join(root, "outside.txt");
	await mkdir(vaultRoot);
	await writeFile(outsideFile, "external");
	t.after(() => rm(root, { recursive: true, force: true }));

	const vault = new Vault(new FileSystemAdapter(vaultRoot, true));
	await vault.initialize();
	await assert.rejects(vault.create("../outside.txt", "bad"), /traverse outside/);
	const external = await vault.fileManager.createExternalFile(outsideFile);
	assert.ok(external instanceof TExternalFile);
	assert.equal(external.getRealPath(), outsideFile);
	assert.equal(await vault.read(external), "external");
});
