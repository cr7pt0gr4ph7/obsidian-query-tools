import assert from "node:assert/strict";
import { execFile, spawnSync } from "node:child_process";
import { mkdtemp, rm, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { promisify } from "node:util";
import { fileURLToPath } from "node:url";
import test from "node:test";
import { openVault } from "../../dist/api/index.js";

const exec = promisify(execFile);
const cli = fileURLToPath(new URL("../../dist/cli/index.js", import.meta.url));

test("CLI results match the shared API and errors do not corrupt stdout", async (t) => {
	const root = await mkdtemp(path.join(os.tmpdir(), "query-cli-test-"));
	t.after(() => rm(root, { recursive: true, force: true }));
	const help = await exec(process.execPath, [cli, "--help"]);
	assert.match(help.stdout, /Usage: obsidian-query-tools/);
	assert.match(help.stdout, /query \[options\]/);
	assert.doesNotMatch(help.stdout, /list \[options\] <query>/);
	assert.match(help.stdout, /neighbors \[options\] <path>/);
	assert.equal(help.stderr, "");
	const queryHelp = await exec(process.execPath, [cli, "query", "--help"]);
	assert.match(queryHelp.stdout, /Usage: obsidian-query query/);
	assert.match(queryHelp.stdout, /--stdin/);
	const version = await exec(process.execPath, [cli, "--version"]);
	assert.equal(version.stdout, "0.1.0\n");
	assert.equal(version.stderr, "");
	await writeFile(path.join(root, "a.md"), "---\nparent: b\n---\n");
	await writeFile(path.join(root, "b.md"), "# b\n");
	const vault = await openVault(root, { edgeFields: ["parent"] });
	const common = [cli, "--vault", root, "--edge-field", "parent"];
	const query = await exec(process.execPath, [
		cli,
		"query",
		"--vault",
		root,
		"--type",
		"dataview",
		"--query",
		'LIST FROM ""',
		"--file",
		"a.md",
	]);
	assert.equal(query.stderr, "");
	assert.deepEqual(
		JSON.parse(query.stdout),
		vault.list('LIST FROM ""', {
			file: "a.md",
		}),
	);
	const stdinQuery = spawnSync(
		process.execPath,
		[cli, "query", "--vault", root, "--type", "dql", "--stdin"],
		{ input: 'LIST FROM ""\n', encoding: "utf8" },
	);
	assert.equal(stdinQuery.status, 0, stdinQuery.stderr);
	assert.deepEqual(JSON.parse(stdinQuery.stdout), vault.list('LIST FROM ""\n'));
	const markdown = await exec(process.execPath, [
		cli,
		"query",
		"--vault",
		root,
		"--type",
		"dql",
		"--query",
		'LIST FROM ""',
		"--format",
		"markdown",
	]);
	assert.equal(
		markdown.stderr,
		"NON_ATOMIC_SNAPSHOT: The filesystem may change during indexing.\n",
	);
	assert.equal(markdown.stdout, "- a\\.md\n- b\\.md\n");
	const neighbors = await exec(process.execPath, [
		...common,
		"neighbors",
		"b.md",
		"--direction",
		"incoming",
		"--edge-type",
		"parent",
	]);
	assert.equal(neighbors.stderr, "");
	assert.deepEqual(
		JSON.parse(neighbors.stdout),
		vault
			.graph()
			.neighbors("b.md", { direction: "incoming", types: ["parent"] }),
	);
	await assert.rejects(
		exec(process.execPath, [
			...common,
			"neighbors",
			"b.md",
			"--type",
			"parent",
		]),
		(error) => {
			assert.ok(
				error instanceof Error && "stdout" in error && "stderr" in error,
			);
			assert.ok(typeof error.stderr === "string");
			assert.equal(error.stdout, "");
			assert.equal(JSON.parse(error.stderr).error.code, "INVALID_OPTIONS");
			return true;
		},
	);
	await assert.rejects(
		exec(process.execPath, [
			...common,
			"neighbors",
			"b.md",
			"--direction",
			"both",
		]),
		(error) => {
			assert.ok(
				error instanceof Error && "stdout" in error && "stderr" in error,
			);
			assert.ok(typeof error.stderr === "string");
			assert.equal(error.stdout, "");
			assert.equal(JSON.parse(error.stderr).error.code, "INVALID_OPTIONS");
			return true;
		},
	);
	const graphNeighbors = await exec(process.execPath, [
		cli,
		"--vault",
		root,
		"graph",
		"neighbors",
		"b.md",
		"--edge-field",
		"parent",
		"--direction",
		"incoming",
		"--edge-type",
		"parent",
	]);
	assert.equal(graphNeighbors.stderr, "");
	assert.deepEqual(
		JSON.parse(graphNeighbors.stdout),
		vault
			.graph()
			.neighbors("b.md", { direction: "incoming", types: ["parent"] }),
	);
	await assert.rejects(
		exec(process.execPath, [
			cli,
			"query",
			"--vault",
			root,
			"--type",
			"dql",
			"--query",
			"TASK FROM #tag",
		]),
		(error) => {
			assert.ok(
				error instanceof Error &&
					"code" in error &&
					"stdout" in error &&
					"stderr" in error,
			);
			assert.ok(typeof error.stderr === "string");
			assert.equal(error.code, 1);
			assert.equal(error.stdout, "");
			assert.match(error.stderr, /^INVALID_QUERY:/);
			return true;
		},
	);
	await assert.rejects(
		exec(process.execPath, [
			cli,
			"query",
			"--vault",
			root,
			"--type",
			"dql",
			"--query",
			'LIST FROM ""',
			"--format",
			"yaml",
		]),
		(error) => {
			assert.ok(
				error instanceof Error && "stdout" in error && "stderr" in error,
			);
			assert.ok(typeof error.stderr === "string");
			assert.equal(error.stdout, "");
			assert.match(error.stderr, /^INVALID_OPTIONS:/);
			return true;
		},
	);
	await assert.rejects(
		exec(process.execPath, [...common, "list", 'LIST FROM ""']),
		(error) => {
			assert.ok(
				error instanceof Error && "stdout" in error && "stderr" in error,
			);
			assert.equal(error.stdout, "");
			assert.match(String(error.stderr), /unknown command 'list'/i);
			return true;
		},
	);
	await assert.rejects(
		exec(process.execPath, [...common, "graph", "traverse", "b.md"]),
		(error) => {
			assert.ok(
				error instanceof Error && "stdout" in error && "stderr" in error,
			);
			assert.ok(typeof error.stderr === "string");
			assert.equal(error.stdout, "");
			assert.equal(JSON.parse(error.stderr).error.code, "UNSUPPORTED_FEATURE");
			return true;
		},
	);
	vault.close();
});

test("unsafe JavaScript runs only with the explicit flag", async (t) => {
	const root = await mkdtemp(path.join(os.tmpdir(), "query-cli-js-"));
	t.after(() => rm(root, { recursive: true, force: true }));
	await writeFile(path.join(root, "a.md"), "# a\n");
	await writeFile(path.join(root, "b.md"), "# b\n");
	const base = [cli, "query", "--vault", root, "--type", "dataviewjs"];
	const script =
		"return dv.list('LIST FROM \"\"').map((p) => p.toUpperCase());";
	const denied = spawnSync(process.execPath, [...base, "--query", script], {
		encoding: "utf8",
	});
	assert.equal(denied.status, 1);
	assert.equal(denied.stdout, "");
	assert.match(denied.stderr, /^UNSUPPORTED_FEATURE:/);
	const ok = spawnSync(
		process.execPath,
		[...base, "--unsafe-allow-js", "--query", script, "--limit", "1"],
		{ encoding: "utf8" },
	);
	assert.equal(ok.status, 0, ok.stderr);
	const out = JSON.parse(ok.stdout);
	assert.deepEqual(out.data, ["A.MD"]);
	assert.equal(out.truncated, true);
	const loop = spawnSync(
		process.execPath,
		[...base, "--unsafe-allow-js", "--query", "while (true) {}"],
		{ encoding: "utf8", timeout: 20000 },
	);
	assert.equal(loop.status, 1);
	assert.match(loop.stderr, /^INVALID_QUERY|LIMIT_EXCEEDED/);
});
