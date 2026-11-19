import { constants } from "node:fs";
import type { Stats } from "node:fs";
import { lstat, open, opendir, realpath } from "node:fs/promises";
import type { FileHandle } from "node:fs/promises";
import path from "node:path";
import { parseDocument } from "yaml";

const defaults = Object.freeze({
  maxEntries: 100_000,
  maxFiles: 10_000,
  maxFileBytes: 1_048_576,
  maxEdges: 100_000,
  maxResults: 1_000,
});

export interface VaultLimits {
  maxEntries: number;
  maxFiles: number;
  maxFileBytes: number;
  maxEdges: number;
  maxResults: number;
}

export interface VaultOptions {
  edgeFields?: string[];
  limits?: Partial<VaultLimits>;
}

export interface ListOptions {
  limit?: number;
}

export interface NeighborOptions extends ListOptions {
  direction?: "outgoing" | "incoming";
  types?: string[];
}

export interface Edge {
  source: string;
  target: string;
  type: string;
}

export interface QueryResult<T> {
  generation: number;
  data: T[];
  diagnostics: { code: string; message: string }[];
  truncated: boolean;
}

export interface Vault {
  list(query: string, options?: ListOptions): QueryResult<string>;
  neighbors(node: string, options?: NeighborOptions): QueryResult<Edge>;
  refresh(): Promise<number>;
  close(): void;
}

interface Config {
  edgeFields: string[];
  limits: VaultLimits;
}

const compare = (a: string, b: string): number => (a < b ? -1 : a > b ? 1 : 0);
const fdPath = (handle: FileHandle): string => `/proc/self/fd/${handle.fd}`;

export class VaultQueryError extends Error {
  readonly code: string;
  declare readonly path?: string;

  constructor(code: string, message: string, relativePath?: string) {
    super(message);
    this.name = "VaultQueryError";
    this.code = code;
    if (relativePath !== undefined) this.path = relativePath;
  }
}

function fail(code: string, message: string, relativePath?: string): never {
  throw new VaultQueryError(code, message, relativePath);
}

function validatePath(value: string, allowEmpty = false): string {
  if (
    typeof value !== "string" ||
    (!allowEmpty && !value) ||
    value.includes("\\") ||
    value.includes("\0") ||
    value.startsWith("/") ||
    /^[a-z]:/i.test(value) ||
    (value && value.split("/").some(part => !part || part === "." || part === ".."))
  ) {
    fail("INVALID_PATH", "Expected a vault-relative POSIX path.");
  }
  return value;
}

function optionsForOpen(options: VaultOptions): Config {
  if (!options || typeof options !== "object" || Array.isArray(options)) {
    fail("INVALID_OPTIONS", "Options must be an object.");
  }
  for (const key of Object.keys(options)) {
    if (!["edgeFields", "limits"].includes(key)) fail("INVALID_OPTIONS", `Unknown option: ${key}`);
  }
  const edgeFields = options.edgeFields ?? [];
  if (!Array.isArray(edgeFields) || edgeFields.some(x => typeof x !== "string" || !x.trim()) ||
      new Set(edgeFields).size !== edgeFields.length) {
    fail("INVALID_OPTIONS", "edgeFields must be an array of unique nonempty strings.");
  }
  const limits = options.limits ?? {};
  if (!limits || typeof limits !== "object" || Array.isArray(limits)) {
    fail("INVALID_OPTIONS", "limits must be an object.");
  }
  for (const [key, value] of Object.entries(limits)) {
    if (!Object.hasOwn(defaults, key) || !Number.isSafeInteger(value) || value < 1) {
      fail("INVALID_OPTIONS", `Invalid limit: ${key}`);
    }
  }
  return { edgeFields: [...edgeFields], limits: { ...defaults, ...limits } };
}

function signature(stat: Stats): string {
  return `${stat.dev}:${stat.ino}:${stat.size}:${stat.mtimeMs}:${stat.ctimeMs}`;
}

async function readFile(parent: FileHandle, name: string, relativePath: string, limit: number): Promise<string> {
  const anchored = path.join(fdPath(parent), name);
  const stat = await lstat(anchored);
  if (!stat.isFile() || stat.isSymbolicLink()) {
    fail("UNSAFE_PATH", "Symlinks and special files are not allowed.", relativePath);
  }
  if (stat.size > limit) fail("LIMIT_EXCEEDED", "Markdown file exceeds the byte limit.", relativePath);
  const file = await open(anchored, constants.O_RDONLY | constants.O_NOFOLLOW | constants.O_NONBLOCK);
  try {
    const before = await file.stat();
    if (!before.isFile() || signature(stat) !== signature(before)) {
      fail("VAULT_CHANGED", "File changed while indexing.", relativePath);
    }
    const buffer = Buffer.alloc(before.size + 1);
    let length = 0;
    while (length < buffer.length) {
      const { bytesRead } = await file.read(buffer, length, buffer.length - length, length);
      if (!bytesRead) break;
      length += bytesRead;
    }
    if (length > limit) fail("LIMIT_EXCEEDED", "Markdown file exceeds the byte limit.", relativePath);
    const after = await file.stat();
    const current = await lstat(anchored);
    if (!current.isFile() || signature(before) !== signature(after) || signature(after) !== signature(current)) {
      fail("VAULT_CHANGED", "File changed while indexing.", relativePath);
    }
    try {
      return new TextDecoder("utf-8", { fatal: true }).decode(buffer.subarray(0, length));
    } catch {
      fail("INVALID_ENCODING", "Markdown file is not valid UTF-8.", relativePath);
    }
  } finally {
    await file.close();
  }
}

function readEdges(contents: string, relativePath: string, fields: string[], maxEdges: number, edges: Edge[]): void {
  const lines = contents.split(/\r?\n/);
  if (lines[0] !== "---") return;
  const end = lines.indexOf("---", 1);
  if (end < 0) fail("INVALID_FRONTMATTER", "Unclosed frontmatter.", relativePath);
  const document = parseDocument(lines.slice(1, end).join("\n"), { uniqueKeys: true });
  if (document.errors.length || document.warnings.length) {
    fail("INVALID_FRONTMATTER", "Invalid or unsupported YAML frontmatter.", relativePath);
  }
  let frontmatter: unknown;
  try {
    frontmatter = document.toJS({ maxAliasCount: 0 });
  } catch {
    fail("INVALID_FRONTMATTER", "Unsupported YAML frontmatter.", relativePath);
  }
  if (frontmatter === null) return;
  if (typeof frontmatter !== "object" || Array.isArray(frontmatter)) {
    fail("INVALID_FRONTMATTER", "Frontmatter must be a mapping.", relativePath);
  }
  for (const type of fields) {
    if (!Object.hasOwn(frontmatter, type)) continue;
    const value: unknown = Reflect.get(frontmatter, type);
    const targets = Array.isArray(value) ? value : [value];
    for (const target of targets) {
      if (typeof target !== "string" || target.includes("[[") || target.includes("]]")) {
        fail("INVALID_EDGE", "Edge fields must contain vault-relative Markdown paths.", relativePath);
      }
      let normalized;
      try {
        normalized = validatePath(target);
      } catch {
        fail("INVALID_EDGE", "Edge fields must contain vault-relative Markdown paths.", relativePath);
      }
      if (!normalized.toLowerCase().endsWith(".md")) normalized += ".md";
      if (edges.length >= maxEdges) fail("LIMIT_EXCEEDED", "Edge limit exceeded.", relativePath);
      edges.push({ source: relativePath, target: normalized, type });
    }
  }
}

async function buildIndex(root: string, config: Config): Promise<{ files: string[]; edges: Edge[] }> {
  const files: string[] = [];
  const edges: Edge[] = [];
  let entries = 0;
  async function visit(directory: FileHandle, relativePath: string): Promise<void> {
    const before = await directory.stat();
    const dir = await opendir(fdPath(directory));
    for await (const entry of dir) {
      if (++entries > config.limits.maxEntries) fail("LIMIT_EXCEEDED", "Directory entry limit exceeded.");
      const name = relativePath ? `${relativePath}/${entry.name}` : entry.name;
      validatePath(name);
      if (entry.isSymbolicLink()) fail("UNSAFE_PATH", "Symlinks are not allowed.", name);
      if (entry.isDirectory()) {
        const anchored = path.join(fdPath(directory), entry.name);
        const original = await lstat(anchored);
        if (!original.isDirectory() || original.isSymbolicLink()) {
          fail("UNSAFE_PATH", "Symlinks and special files are not allowed.", name);
        }
        const child = await open(anchored, constants.O_RDONLY | constants.O_DIRECTORY | constants.O_NOFOLLOW);
        try {
          if (signature(original) !== signature(await child.stat())) {
            fail("VAULT_CHANGED", "Directory changed while indexing.", name);
          }
          await visit(child, name);
          const current = await lstat(anchored);
          if (!current.isDirectory() || signature(current) !== signature(await child.stat())) {
            fail("VAULT_CHANGED", "Directory changed while indexing.", name);
          }
        } finally {
          await child.close();
        }
      }
      else if (entry.isFile()) {
        if (!name.toLowerCase().endsWith(".md")) continue;
        if (files.length >= config.limits.maxFiles) fail("LIMIT_EXCEEDED", "Markdown file limit exceeded.");
        const contents = await readFile(directory, entry.name, name, config.limits.maxFileBytes);
        files.push(name);
        readEdges(contents, name, config.edgeFields, config.limits.maxEdges, edges);
      } else fail("UNSAFE_PATH", "Special files are not allowed.", name);
    }
    const after = await directory.stat();
    if (signature(before) !== signature(after)) fail("VAULT_CHANGED", "Directory changed while indexing.", relativePath);
  }
  try {
    if (process.platform !== "linux" || constants.O_NOFOLLOW === undefined || constants.O_DIRECTORY === undefined) {
      fail("UNSUPPORTED_PLATFORM", "Linux with /proc/self/fd and O_NOFOLLOW is required.");
    }
    const original = await lstat(root);
    const directory = await open(root, constants.O_RDONLY | constants.O_DIRECTORY | constants.O_NOFOLLOW);
    try {
      if (signature(original) !== signature(await directory.stat())) {
        fail("VAULT_CHANGED", "Vault root changed while indexing.");
      }
      await visit(directory, "");
      if (signature(await lstat(root)) !== signature(await directory.stat())) {
        fail("VAULT_CHANGED", "Vault root changed while indexing.");
      }
    } finally {
      await directory.close();
    }
  } catch (error) {
    if (error instanceof VaultQueryError) throw error;
    fail("VAULT_READ_ERROR", "Could not read the vault; it may be unreadable or changing.");
  }
  files.sort(compare);
  const paths = new Set(files);
  for (const edge of edges) {
    if (!paths.has(edge.target)) fail("UNRESOLVED_EDGE", "Edge target is not an indexed Markdown file.", edge.source);
  }
  edges.sort((a, b) => compare(a.source, b.source) || compare(a.target, b.target) || compare(a.type, b.type));
  return { files, edges };
}

function result<T>(generation: number, values: T[], limit: number): QueryResult<T> {
  return {
    generation,
    data: values.slice(0, limit),
    diagnostics: [{ code: "NON_ATOMIC_SNAPSHOT", message: "The filesystem may change during indexing." }],
    truncated: values.length > limit,
  };
}

function requestLimit(options: ListOptions, max: number, keys: string[]): number {
  if (!options || typeof options !== "object" || Array.isArray(options)) fail("INVALID_OPTIONS", "Options must be an object.");
  for (const key of Object.keys(options)) {
    if (!keys.includes(key)) fail("INVALID_OPTIONS", `Unknown option: ${key}`);
  }
  const limit = options.limit ?? max;
  if (!Number.isSafeInteger(limit) || limit < 1 || limit > max) fail("INVALID_OPTIONS", "Invalid result limit.");
  return limit;
}

export async function openVault(root: string, options: VaultOptions = {}): Promise<Vault> {
  if (typeof root !== "string" || !root) fail("INVALID_VAULT", "A vault root is required.");
  const config = optionsForOpen(options);
  let canonical;
  try {
    canonical = await realpath(root);
    if (!(await lstat(canonical)).isDirectory()) fail("INVALID_VAULT", "Vault root must be a directory.");
  } catch (error) {
    if (error instanceof VaultQueryError) throw error;
    fail("INVALID_VAULT", "Vault root is not an accessible directory.");
  }
  let index = await buildIndex(canonical, config);
  let generation = 1;
  let closed = false;
  let refreshing = false;
  function ensureOpen() {
    if (closed) fail("VAULT_CLOSED", "Vault is closed.");
  }
  return {
    list(query: string, options: ListOptions = {}) {
      ensureOpen();
      const limit = requestLimit(options, config.limits.maxResults, ["limit"]);
      if (typeof query !== "string") fail("INVALID_QUERY", "Expected LIST FROM \"<folder>\".");
      const match = /^\s*list\s+from\s+"([^"]*)"\s*$/i.exec(query);
      if (!match) fail("INVALID_QUERY", "Only LIST FROM \"<folder>\" is supported.");
      const folder = validatePath(match[1], true);
      return result(generation, index.files.filter(file => !folder || file.startsWith(`${folder}/`)), limit);
    },
    neighbors(node: string, options: NeighborOptions = {}) {
      ensureOpen();
      const limit = requestLimit(options, config.limits.maxResults, ["limit", "direction", "types"]);
      validatePath(node);
      const direction = options.direction ?? "outgoing";
      if (!["outgoing", "incoming"].includes(direction)) fail("INVALID_OPTIONS", "Invalid direction.");
      const types = options.types ?? config.edgeFields;
      if (!Array.isArray(types) || types.some(type => !config.edgeFields.includes(type))) {
        fail("INVALID_OPTIONS", "types must contain configured edge fields.");
      }
      if (!index.files.includes(node)) fail("NOT_FOUND", "Node is not an indexed Markdown file.", node);
      const values = index.edges.filter(edge => edge[direction === "outgoing" ? "source" : "target"] === node && types.includes(edge.type));
      return result(generation, values.map(edge => ({ ...edge })), limit);
    },
    async refresh() {
      ensureOpen();
      if (refreshing) fail("REFRESH_IN_PROGRESS", "A refresh is already in progress.");
      refreshing = true;
      try {
        const next = await buildIndex(canonical, config);
        ensureOpen();
        index = next;
        return ++generation;
      } finally {
        refreshing = false;
      }
    },
    close() {
      closed = true;
    },
  };
}
