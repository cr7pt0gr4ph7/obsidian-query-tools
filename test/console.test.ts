import assert from "node:assert/strict";
import test from "node:test";
import { runConsole } from "../dist/console.js";
import type { ConsoleRequest, ConsoleResult } from "../dist/console.js";

function harness(result: ConsoleResult = {
  data: ["one", "two"],
  diagnostics: [],
  truncated: false,
  generation: 3,
}) {
  const calls: ConsoleRequest[] = [];
  let stdout = "";
  let stderr = "";
  const dependencies = {
    api: {
      query(request: ConsoleRequest) {
        calls.push(request);
        return result;
      },
    },
    stdout: { write(value: string) { stdout += value; } },
    stderr: { write(value: string) { stderr += value; } },
    version: "2.3.4",
  };
  return {
    dependencies,
    calls,
    stdout: () => stdout,
    stderr: () => stderr,
  };
}

async function* stdin(...chunks: string[]) {
  for (const chunk of chunks) yield Buffer.from(chunk);
}

test("passes inline source, vault, and current-file context to the mocked API", async () => {
  const h = harness();
  const status = await runConsole([
    "query", "--vault", "/private/vault", "--type", "dataview",
    "--query", 'LIST FROM "Projects"', "--file", "Projects/Index.md",
  ], h.dependencies);
  assert.equal(status, 0);
  assert.deepEqual(h.calls, [{
    vault: "/private/vault",
    type: "dataview",
    query: 'LIST FROM "Projects"',
    file: "Projects/Index.md",
  }]);
  assert.deepEqual(JSON.parse(h.stdout()), {
    data: ["one", "two"],
    diagnostics: [],
    truncated: false,
    generation: 3,
  });
  assert.equal(h.stderr(), "");
});

test("reads multiline stdin unchanged and maps dql to the same API operation", async () => {
  const h = harness();
  const status = await runConsole([
    "query", "--vault", "vault", "--type", "dql", "--stdin",
  ], { ...h.dependencies, stdin: stdin('LIST FROM "Folder"\n', "SORT file.name") });
  assert.equal(status, 0);
  assert.deepEqual(h.calls, [{
    vault: "vault",
    type: "dataview",
    query: 'LIST FROM "Folder"\nSORT file.name',
  }]);
});

test("both declarative aliases and input sources invoke the same API mode", async () => {
  for (const type of ["dataview", "dql"]) {
    for (const source of ["query", "stdin"]) {
      const h = harness();
      const args = ["query", "--vault", "vault", "--type", type];
      if (source === "query") args.push("--query", "TABLE file.name");
      else args.push("--stdin");
      assert.equal(await runConsole(args, {
        ...h.dependencies,
        ...(source === "stdin" ? { stdin: stdin("TABLE ", "file.name") } : {}),
      }), 0);
      assert.deepEqual(h.calls, [{
        vault: "vault",
        type: "dataview",
        query: "TABLE file.name",
      }]);
    }
  }
});

test("defaults to JSON and includes diagnostics and truncation metadata", async () => {
  const h = harness({
    data: ["partial"],
    diagnostics: [{ code: "LIMIT", message: "Output was bounded." }],
    truncated: true,
  });
  assert.equal(await runConsole([
    "query", "--vault", "vault", "--type", "dql", "--query", "query",
  ], h.dependencies), 0);
  assert.deepEqual(JSON.parse(h.stdout()), {
    data: ["partial"],
    diagnostics: [{ code: "LIMIT", message: "Output was bounded." }],
    truncated: true,
  });
  assert.equal(h.stderr(), "");
});

test("formats simple result lists and reports diagnostics outside stdout", async () => {
  const h = harness({
    data: ["one|two", "three\nfour"],
    diagnostics: [{ code: "NOTICE", message: "Some data may have changed." }],
    truncated: true,
  });
  assert.equal(await runConsole([
    "query", "--vault", "vault", "--type", "dataview",
    "--query", "query", "--format", "markdown",
  ], h.dependencies), 0);
  assert.equal(h.stdout(), "- one|two\n- three four\n");
  assert.equal(h.stderr(), "NOTICE: Some data may have changed.\nResult truncated.\n");
});

test("formats records as a Markdown table with escaped pipes", async () => {
  const h = harness({ data: [{ Name: "A|B", Count: 2 }], diagnostics: [], truncated: false });
  assert.equal(await runConsole([
    "query", "--vault", "vault", "--type", "dataview",
    "--query", "query", "--format", "markdown",
  ], h.dependencies), 0);
  assert.equal(h.stdout(), "| Name | Count |\n| --- | --- |\n| A\\|B | 2 |\n");
});

test("disabled JavaScript aliases fail explicitly without invoking the API", async () => {
  for (const type of ["dataviewjs", "dqljs"]) {
    for (const source of ["query", "stdin"]) {
      const h = harness();
      const args = ["query", "--vault", "vault", "--type", type];
      if (source === "query") args.push("--query", "dv.list('x')");
      else args.push("--stdin");
      assert.equal(await runConsole(args, {
        ...h.dependencies,
        ...(source === "stdin" ? { stdin: stdin("dv.list('x')") } : {}),
      }), 1);
      assert.deepEqual(h.calls, []);
      assert.equal(h.stdout(), "");
      assert.match(h.stderr(), /^UNSUPPORTED_FEATURE: JavaScript query modes are disabled\.\n$/);
      assert.doesNotMatch(h.stderr(), /dv\.list/);
    }
  }
});

test("help and version do not call the API or require a vault", async () => {
  const h = harness();
  assert.equal(await runConsole(["--help"], h.dependencies), 0);
  assert.match(h.stdout(), /Usage: obsidian-query query/);
  assert.match(h.stdout(), /1 MiB/);
  assert.deepEqual(h.calls, []);
  const version = harness();
  assert.equal(await runConsole(["--version"], version.dependencies), 0);
  assert.equal(version.stdout(), "2.3.4\n");
  assert.deepEqual(version.calls, []);
});

test("rejects conflicting, missing, empty, and unknown input options without API calls", async () => {
  const cases = [
    ["query", "--vault", "vault", "--type", "dql"],
    ["query", "--vault", "vault", "--type", "dql", "--query", "x", "--stdin"],
    ["query", "--vault", "vault", "--type", "dql", "--query", ""],
    ["query", "--vault", "vault", "--type", "dql", "--stdin"],
    ["query", "--vault", "vault", "--type", "dql", "--query", "x", "--unexpected"],
    ["query", "--vault", "vault", "--type", "dql", "--query", "x", "--format", "yaml"],
  ];
  for (const args of cases) {
    const h = harness();
    assert.equal(await runConsole(args, h.dependencies), 1, args.join(" "));
    assert.deepEqual(h.calls, []);
    assert.equal(h.stdout(), "");
    assert.notEqual(h.stderr(), "");
  }
});

test("rejects malformed or oversized stdin before invoking the API", async () => {
  const malformed = harness();
  assert.equal(await runConsole([
    "query", "--vault", "vault", "--type", "dql", "--stdin",
  ], { ...malformed.dependencies, stdin: (async function* () { yield Uint8Array.of(0xff); })() }), 1);
  assert.deepEqual(malformed.calls, []);
  assert.match(malformed.stderr(), /^INVALID_INPUT: Stdin must contain valid UTF-8\./);

  const oversized = harness();
  assert.equal(await runConsole([
    "query", "--vault", "vault", "--type", "dql", "--stdin",
  ], { ...oversized.dependencies, stdin: stdin("x".repeat(1_048_577)) }), 1);
  assert.deepEqual(oversized.calls, []);
  assert.match(oversized.stderr(), /^LIMIT_EXCEEDED:/);
});

test("API failures produce no success output and do not echo query source", async () => {
  const h = harness();
  h.dependencies.api.query = () => {
    throw Object.assign(new Error("Invalid query private query: current file is outside the vault."), { code: "INVALID_PATH" });
  };
  assert.equal(await runConsole([
    "query", "--vault", "vault", "--type", "dql", "--query", "private query",
    "--file", "../outside.md",
  ], h.dependencies), 1);
  assert.equal(h.stdout(), "");
  assert.equal(h.stderr(), "INVALID_PATH: Invalid query [query]: current file is outside the vault.\n");
  assert.doesNotMatch(h.stderr(), /private query/);
});

test("rejects Markdown output when the result cannot be represented faithfully", async () => {
  const h = harness({ data: [{ nested: { value: "x" } }], diagnostics: [], truncated: false });
  assert.equal(await runConsole([
    "query", "--vault", "vault", "--type", "dataview",
    "--query", "query", "--format", "markdown",
  ], h.dependencies), 1);
  assert.equal(h.stdout(), "");
  assert.match(h.stderr(), /^UNSUPPORTED_FORMAT:/);
});
