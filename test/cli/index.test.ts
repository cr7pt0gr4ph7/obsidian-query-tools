import assert from "node:assert/strict";
import { execFile, spawnSync } from "node:child_process";
import { mkdtemp, rm, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";
import { promisify } from "node:util";
import { openVault } from "../../src/api/index.ts";

const exec = promisify(execFile);
const cli = fileURLToPath(new URL("../../src/cli/index.js", import.meta.url));

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
	const stdinQuery = spawnSync(process.execPath, [cli, "query", "--vault", root, "--type", "dql", "--stdin"], {
		input: 'LIST FROM ""\n',
		encoding: "utf8",
	});
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
	assert.equal(markdown.stderr, "NON_ATOMIC_SNAPSHOT: The filesystem may change during indexing.\n");
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
		vault.graph().neighbors("b.md", { direction: "incoming", types: ["parent"] }),
	);
	await assert.rejects(exec(process.execPath, [...common, "neighbors", "b.md", "--type", "parent"]), (error) => {
		assert.ok(error instanceof Error && "stdout" in error && "stderr" in error);
		assert.ok(typeof error.stderr === "string");
		assert.equal(error.stdout, "");
		assert.equal(JSON.parse(error.stderr).error.code, "INVALID_OPTIONS");
		return true;
	});
	await assert.rejects(exec(process.execPath, [...common, "neighbors", "b.md", "--direction", "both"]), (error) => {
		assert.ok(error instanceof Error && "stdout" in error && "stderr" in error);
		assert.ok(typeof error.stderr === "string");
		assert.equal(error.stdout, "");
		assert.equal(JSON.parse(error.stderr).error.code, "INVALID_OPTIONS");
		return true;
	});
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
		vault.graph().neighbors("b.md", { direction: "incoming", types: ["parent"] }),
	);
	await assert.rejects(
		exec(process.execPath, [cli, "query", "--vault", root, "--type", "dql", "--query", "TASK FROM #tag"]),
		(error) => {
			assert.ok(error instanceof Error && "code" in error && "stdout" in error && "stderr" in error);
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
			assert.ok(error instanceof Error && "stdout" in error && "stderr" in error);
			assert.ok(typeof error.stderr === "string");
			assert.equal(error.stdout, "");
			assert.match(error.stderr, /^INVALID_OPTIONS:/);
			return true;
		},
	);
	await assert.rejects(exec(process.execPath, [...common, "list", 'LIST FROM ""']), (error) => {
		assert.ok(error instanceof Error && "stdout" in error && "stderr" in error);
		assert.equal(error.stdout, "");
		assert.match(String(error.stderr), /unknown command 'list'/i);
		return true;
	});
	const traversed = await exec(process.execPath, [...common, "graph", "traverse", "a.md", "--max-depth", "2"]);
	assert.deepEqual(JSON.parse(traversed.stdout), vault.graph().traverse("a.md", { maxDepth: 2 }));
	for (const format of ["json", "csv", "dot", "mermaid", "graphml"]) {
		const exported = await exec(process.execPath, [...common, "graph", "export", "--format", format]);
		const expected = vault.graph().export({ format: format as "json" });
		assert.deepEqual(JSON.parse(exported.stdout), expected);
		assert.ok(expected.content.length > 0);
	}
	await assert.rejects(exec(process.execPath, [...common, "graph", "export", "--format", "pdf"]));
	vault.close();
});

test("unsafe JavaScript runs only with the explicit flag", async (t) => {
	const root = await mkdtemp(path.join(os.tmpdir(), "query-cli-js-"));
	t.after(() => rm(root, { recursive: true, force: true }));
	await writeFile(path.join(root, "a.md"), "# a\n");
	await writeFile(path.join(root, "b.md"), "# b\n");
	const base = [cli, "query", "--vault", root, "--type", "dataviewjs"];
	const script = "return dv.list('LIST FROM \"\"').map((p) => p.toUpperCase());";
	const denied = spawnSync(process.execPath, [...base, "--query", script], {
		encoding: "utf8",
	});
	assert.equal(denied.status, 1);
	assert.equal(denied.stdout, "");
	assert.match(denied.stderr, /^UNSUPPORTED_FEATURE:/);
	const ok = spawnSync(process.execPath, [...base, "--unsafe-allow-js", "--query", script, "--limit", "1"], {
		encoding: "utf8",
	});
	assert.equal(ok.status, 0, ok.stderr);
	const out = JSON.parse(ok.stdout);
	assert.deepEqual(out.data, ["A.MD"]);
	assert.equal(out.truncated, true);
	const loop = spawnSync(process.execPath, [...base, "--unsafe-allow-js", "--query", "while (true) {}"], {
		encoding: "utf8",
		timeout: 20000,
	});
	assert.equal(loop.status, 1);
	assert.match(loop.stderr, /^INVALID_QUERY|LIMIT_EXCEEDED/);
});

test("--opposite adds implied edges in the CLI", async (t) => {
	const root = await mkdtemp(path.join(os.tmpdir(), "query-cli-opp-"));
	t.after(() => rm(root, { recursive: true, force: true }));
	await writeFile(path.join(root, "a.md"), "---\nup: b\n---\n");
	await writeFile(path.join(root, "b.md"), "# b\n");
	const run = (...extra: string[]) =>
		spawnSync(process.execPath, [cli, "--vault", root, "--edge-field", "up", ...extra], { encoding: "utf8" });
	const ok = run("--opposite", "up:down", "neighbors", "b.md", "--edge-type", "down");
	assert.equal(ok.status, 0, ok.stderr);
	assert.deepEqual(JSON.parse(ok.stdout).data, [{ source: "b.md", target: "a.md", type: "down", implied: true }]);
	const bad = run("--opposite", "nocolon", "neighbors", "b.md");
	assert.equal(bad.status, 1);
	assert.equal(JSON.parse(bad.stderr).error.code, "INVALID_OPTIONS");
});

test("describe prints capabilities without a vault", async () => {
	const out = await exec(process.execPath, [cli, "describe"]);
	const d = JSON.parse(out.stdout);
	assert.equal(out.stderr, "");
	assert.ok(d.operations.some((o: { name: string }) => o.name === "cycles"));
	assert.equal(d.defaultLimits.maxResults, 1000);
	assert.ok(d.errorCodes.includes("UNRESOLVED_EDGE"));
	assert.deepEqual(d.exportFormats, ["json", "csv", "dot", "mermaid", "graphml"]);
});

test("--config supplies options and rejects unsafe or unknown keys", async (t) => {
	const root = await mkdtemp(path.join(os.tmpdir(), "query-cli-cfg-"));
	t.after(() => rm(root, { recursive: true, force: true }));
	await writeFile(path.join(root, "a.md"), "---\nup: '[[b]]'\n---\n");
	await writeFile(path.join(root, "b.md"), "# b\n");
	const good = path.join(os.tmpdir(), `cfg-${process.pid}.json`);
	const bad = path.join(os.tmpdir(), `cfg-bad-${process.pid}.json`);
	t.after(() => rm(good, { force: true }));
	t.after(() => rm(bad, { force: true }));
	await writeFile(
		good,
		JSON.stringify({
			edgeFields: ["up"],
			allowWikilinks: true,
			oppositeFields: { up: "down" },
		}),
	);
	await writeFile(bad, JSON.stringify({ unsafeJavaScript: true }));
	const run = (config: string) =>
		spawnSync(process.execPath, [cli, "--vault", root, "--config", config, "graph", "stats"], { encoding: "utf8" });
	const ok = run(good);
	assert.equal(ok.status, 0, ok.stderr);
	assert.equal(JSON.parse(ok.stdout).edgeCount, 2);
	const rejected = run(bad);
	assert.equal(rejected.status, 1);
	assert.match(JSON.parse(rejected.stderr).error.message, /unsafeJavaScript/);
	assert.equal(run(path.join(root, "missing.json")).status, 1);
});

test("graph neighbors accepts its own --edge-field", async (t) => {
	const root = await mkdtemp(path.join(os.tmpdir(), "query-cli-sub-"));
	t.after(() => rm(root, { recursive: true, force: true }));
	await writeFile(path.join(root, "a.md"), "---\nup: b\n---\n");
	await writeFile(path.join(root, "b.md"), "# b\n");
	const out = spawnSync(process.execPath, [cli, "--vault", root, "graph", "neighbors", "a.md", "--edge-field", "up"], {
		encoding: "utf8",
	});
	assert.equal(out.status, 0, out.stderr);
	assert.equal(JSON.parse(out.stdout).data[0].target, "b.md");
});
