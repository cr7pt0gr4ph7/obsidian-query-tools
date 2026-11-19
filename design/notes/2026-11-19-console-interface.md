# Console interface specification

Status: proposed target, not a claim that the shared API implements its query
modes. An injectable command runner and mocked-API contract tests are in
`src/console.ts` and `test/console.test.ts`; they do not add a package
executable or production adapter. The API-ready approval for this test work
does not authorize implementing broader query semantics. The console must
not implement its own query semantics.

The runner limits query input to 1 MiB. Its current Markdown test seam handles
scalar values, scalar lists, and flat records with matching columns; values
outside those shapes fail explicitly until the API's result schemas and
lossless renderings are specified.

## Invocation

```text
obsidian-query query --vault <directory> --type <mode>
  (--query <source> | --stdin) [--file <vault-relative-path>]
  [--format <json|markdown>]
```

- `--vault` is required and selects one local vault root. Resolve it once
  and apply the shared API's vault boundary and read-only policies. No
  network access or vault mutation is implied.
- `--type` is required: `dataview`, `dql`, `dataviewjs`, or `dqljs`.
  `dataview` and `dql` select the same declarative query language; `dataviewjs`
  and `dqljs` select the same JavaScript mode. These are CLI selectors, not
  a claim that all four are upstream code-block names.
- Supply exactly one query source: `--query` takes a single shell argument;
  `--stdin` reads UTF-8 through EOF, including newlines. Pass the supplied
  source unchanged to the selected shared API operation. The source is the
  **body** of a code block, without Markdown fences or inline-query prefixes.
  Empty input, malformed UTF-8, conflicting sources, and unknown options are
  errors. Apply a documented input-size limit before execution.
- `--file` optionally specifies an existing Markdown file relative to the
  vault root as the query's current-file context. It is not a query file to
  execute. Reject absolute paths, traversal, missing files, non-Markdown
  files, and paths or symlinks that violate the vault boundary. Resolve
  current-file references and relative links through the shared API. Without
  `--file`, use no current-file context; a query requiring one must fail
  explicitly, not silently choose a file or invent a context.
- `--format json` requests structured output; `--format markdown` requests
  human-readable plain text/Markdown. The default is `json`, independent of
  whether stdout is a terminal. Unsupported format/result combinations fail
  rather than silently changing format.
- `--help` describes the options and `--version` reports the installed
  version; neither requires a vault. Normal query execution never prompts.
  Arguments, particularly `--query`, may be visible in shell history and
  process listings; use `--stdin` where that matters.

Examples (target syntax, not promises of current support):

```sh
obsidian-query query --vault ./vault --type dataview \
  --query 'TABLE rating FROM #books SORT rating DESC' --format markdown
printf '%s\n' 'LIST FROM #books' |
  obsidian-query query --vault ./vault --type dql --stdin --format json
obsidian-query query --vault ./vault --file Projects/Index.md --type dql \
  --query 'LIST FROM "Projects"'
```

## Query semantics and compatibility

The declarative modes target the same query-body input as an upstream
`dataview` code block, including its query types and expressions; JavaScript
modes target the body of an upstream `dataviewjs` block and its `dv` API.
Inline DQL and inline JavaScript are different upstream interfaces and are
not selected by these four modes. The CLI must not strip fences, rewrite
queries, execute shell substitutions, or treat a file context as a source
of executable query text.

Compatibility is a target, not a parity claim. Features not implemented or
not permitted by the safety policy must produce an explicit unsupported
error, never be ignored or approximated as a successful complete result.
Before claiming support for a feature, record the exact upstream revision,
integration method, license and deviations, and compare representative
non-sensitive fixtures with that revision in Obsidian. The
[upstream research](2026-11-19-upstream.md) records the current evidence and
standalone limitations. At the examined Dataview revision,
[`src/main.ts`](https://github.com/blacksmithgu/obsidian-dataview/blob/5ad0994ff384cbb797de382e7edff2388141b73a/src/main.ts)
registers `dataview` and a configurable JavaScript code-block keyword
(default `dataviewjs`); `dql` and `dqljs` here are console aliases.
See also the [Dataview query forms documentation](https://blacksmithgu.github.io/obsidian-dataview/queries/dql-js-inline/).

### JavaScript execution gate

The requested JavaScript selectors are part of the target interface, but
execution is **not authorized by this specification**. The current project
prohibits DataviewJS and vault-supplied scripts. Until a separately approved
design defines an enforceable execution and authorization boundary, both
selectors must fail explicitly as unsupported, without evaluating the input.
An eventual design must preserve the prohibition on executing vault-supplied
JavaScript, remain read-only and local by default, protect vault data from
network access, and address arbitrary JavaScript's access to the host, its
filesystem and resources. A Node `vm` alone is not a security boundary.
Explicitly supplied code is not automatically safe, and stdin provenance
cannot be assumed. Approval must resolve how executable input is authorized
and how vault-supplied scripts are excluded before implementation. This gate
does not authorize changing the existing security requirements.

For a future approved JavaScript mode, accept the same body for both aliases,
provide a documented `dv` context and supported rendering operations through
the shared API, and capture their ordered output as structured results.
Operations that cannot be represented or safely supported must fail
explicitly. Do not promise DOM/Obsidian UI behavior or arbitrary plugin APIs.

## Output and errors

For a successful query, stdout contains exactly one result, ending in a
newline. JSON is one valid JSON document with an object envelope containing
`data`, `diagnostics`, and boolean `truncated`; include a `generation` when
the shared API exposes an index generation. `data` preserves the query's
result kind and structure, including table columns and rows, list items,
tasks or calendar entries where supported; document the exact per-kind
schema and tagged encodings for links, dates, missing values and other
non-JSON values before supporting them. Preserve explicit query ordering;
otherwise use deterministic ordering and serialization. Never silently
drop an unrepresentable value or emit invalid JSON.

Markdown renders the same result and preserves its order and meaning, using
appropriate headings, lists, tables and escaped text as applicable. It is
plain Markdown, not an Obsidian UI or HTML execution environment. If the
result cannot be represented without material loss, fail explicitly instead
of omitting content. Emit diagnostics and any truncation notice to stderr so
they cannot be mistaken for query data; JSON includes both in the envelope.
Document result limits, apply them in the shared API, and explicitly mark
truncation in both formats.

Errors, including invalid vaults, contexts, queries, disabled JavaScript,
limits and unsupported features, produce no success result on stdout, a
concise actionable diagnostic on stderr and a nonzero exit status. Avoid
printing vault contents or query source in diagnostics by default. Exit `0`
only when a result is produced; a truncated result is successful but must
be marked as such. Help and version output go to stdout and exit `0`.
No progress or log messages may contaminate stdout.

## Acceptance before implementation is considered complete

- Exercise all four selectors and both input sources, including multiline
  bodies, alias equivalence, invalid combinations, and disabled modes. Tests
  must not execute JavaScript while the gate is closed. Unit tests use an
  injected API mock and verify that disabled JavaScript modes never call it.
- Verify explicit and absent file contexts, invalid and escaping paths,
  relative references, default and selected formats, empty and structured
  results, escaping, diagnostics, truncation and exit statuses.
- Compare the console with the shared API using the same fixtures, and
  validate stdout as JSON or Markdown as requested. Verify no vault writes,
  external transmission, or execution of vault-supplied JavaScript.
- Publish the supported feature matrix, limits, exact output schemas and
  compatibility evidence before making a release or upstream-parity claim.
