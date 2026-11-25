import { Worker } from "node:worker_threads";
import {
	DataviewApi,
	type DataviewSource,
	DateTime,
	DEFAULT_DATAVIEW_SETTINGS,
	Duration,
	FullIndex,
	Link,
	PageMetadata,
	parsePage,
	QUERY_LANGUAGE,
	Widget,
} from "obsidian-dataview";
import { DataviewManifest } from "../../host/dataview/manifest.js";
import { App } from "../../host/obsidian/app.js";
import { Component } from "../../host/obsidian/base/component.js";
import { BoundedDataAdapter } from "../../host/obsidian/files/adapter_bounded.js";
import { Errors } from "../utils/errors.js";
import type { VaultLimits } from "../vault/vault.js";

/** JSON-safe Dataview result value. */
export type DataviewValue = null | boolean | number | string | DataviewValue[] | { [key: string]: DataviewValue };

/** Typed LIST or TABLE data produced by Dataview. */
export type DataviewQueryData =
	| { type: "list"; values: DataviewValue[] }
	| { type: "table"; headers: string[]; values: DataviewValue[][] };

/** Bounded Dataview query result. */
export interface DataviewQueryResult {
	/** Published index generation. */
	generation: number;
	/** Typed query data. */
	data: DataviewQueryData;
	/** Non-fatal conditions associated with the index. */
	diagnostics: { code: string; message: string }[];
	/** Whether the result limit omitted rows. */
	truncated: boolean;
}

/** Options for a Dataview query. */
export interface DataviewQueryOptions {
	/** Maximum returned rows. */
	limit?: number;
	/** Optional vault-relative Markdown file context. */
	file?: string;
}

function serialize(value: unknown): DataviewValue {
	if (value === null || value === undefined) return null;
	if (typeof value === "string" || typeof value === "boolean") return value;
	if (typeof value === "number") {
		if (!Number.isFinite(value))
			throw Errors.General.UnsupportedFeature("Non-finite query values cannot be serialized.");
		return value;
	}
	if (value instanceof Link) {
		return {
			type: "link",
			path: value.path,
			linkType: value.type,
			embed: value.embed,
			subpath: value.subpath ?? null,
			display: value.display ?? null,
		};
	}
	if (
		(value instanceof DateTime || value instanceof Duration) &&
		typeof value === "object" &&
		"toISO" in value &&
		typeof value.toISO === "function"
	) {
		const iso: unknown = value.toISO();
		if (typeof iso === "string" || iso === null) return iso;
		throw Errors.General.UnsupportedFeature("This Dataview date cannot be serialized.");
	}
	if (value instanceof Widget) {
		if (value.$widget === "dataview:list-pair" && "key" in value && "value" in value) {
			return { type: "list-pair", key: serialize(value.key), value: serialize(value.value) };
		}
		throw Errors.General.UnsupportedFeature("This Dataview widget cannot be serialized.");
	}
	if (Array.isArray(value)) return value.map(serialize);
	if (typeof value === "object" && Object.getPrototypeOf(value) === Object.prototype) {
		return Object.fromEntries(Object.entries(value).map(([key, item]) => [key, serialize(item)]));
	}
	throw Errors.General.UnsupportedFeature("This Dataview value cannot be serialized.");
}

function containsCsv(source: DataviewSource): boolean {
	if (source.type === "csv") return true;
	if (source.type === "binaryop") return containsCsv(source.left) || containsCsv(source.right);
	if (source.type === "negate") return containsCsv(source.child);
	return false;
}

/** Dataview index and resources belonging to one published generation. */
export interface DataviewIndex {
	/** Vault-relative paths captured by the host. */
	files: string[];
	/**
	 * Execute a query using the captured generation.
	 *
	 * @param source DQL query.
	 * @param origin Optional current-file context.
	 * @param generation Published generation number.
	 * @param limit Maximum result rows.
	 * @returns The typed bounded query result.
	 */
	query(source: string, origin: string | undefined, generation: number, limit: number): Promise<DataviewQueryResult>;
	/**
	 * Release upstream workers and timers.
	 *
	 * @returns Nothing.
	 */
	close(): void;
}

/**
 * Construct the pinned Dataview engine from a read-only host snapshot.
 *
 * @param root Canonical vault root.
 * @param limits Vault indexing limits.
 * @returns A ready-to-query Dataview index.
 */
export async function buildDataviewIndex(root: string, limits: VaultLimits): Promise<DataviewIndex> {
	const adapter = await BoundedDataAdapter.create(root, limits);
	const app = new App({ appId: "obsidian-query-tools", basePath: root, adapter });
	await app.vault.initialize();
	await app.metadataCache.initialize();
	const component = new Component();
	component.load();
	try {
		const index = component.addChild(FullIndex.create(app, DataviewManifest.indexVersion, () => {}));
		const workers: unknown = Reflect.get(index.importer, "workers");
		if (!Array.isArray(workers) || !workers.every((worker) => worker instanceof Worker)) {
			throw Errors.Vault.ReadError("Could not initialize Dataview workers.");
		}
		let workerFailed = false;
		let closing = false;
		for (const worker of workers) {
			worker.on("error", () => {
				workerFailed = true;
			});
			worker.on("exit", (code) => {
				if (!closing && code !== 0) workerFailed = true;
			});
		}
		index.csv.get = async () => {
			throw Errors.General.UnsupportedFeature("CSV sources are disabled.");
		};
		const files = app.vault.getMarkdownFiles();
		for (const file of files) {
			const metadata = app.metadataCache.getFileCache(file);
			if (!metadata) throw Errors.Vault.ReadError("File metadata is unavailable.", file.path);
			let imported: PageMetadata;
			try {
				imported = parsePage(file.path, await app.vault.read(file), file.stat, metadata);
			} catch {
				throw Errors.Vault.ReadError("Could not import Markdown metadata.", file.path);
			}
			const page = PageMetadata.canonicalize(imported, (link) => {
				const resolved = app.metadataCache.getFirstLinkpathDest(link.path, file.path);
				return resolved ? link.withPath(resolved.path) : link;
			});
			index.pages.set(file.path, page);
			index.tags.set(file.path, page.fullTags());
			index.etags.set(file.path, page.tags);
			index.links.set(file.path, new Set(page.links.map((link) => link.path)));
		}
		index.initialized = true;
		const api = new DataviewApi(app, index, DEFAULT_DATAVIEW_SETTINGS, DataviewManifest.pluginVersion);
		return {
			files: files.map((file) => file.path).sort(),
			async query(source, origin, generation, limit) {
				if (workerFailed) throw Errors.Vault.ReadError("A Dataview worker failed.");
				if (typeof source !== "string" || !source.trim()) throw Errors.Query.InvalidQuery("Query must not be empty.");
				const parsed = QUERY_LANGUAGE.query.parse(source);
				if (!parsed.status) throw Errors.Query.InvalidQuery("Invalid Dataview query.");
				if (parsed.value.header.type !== "list" && parsed.value.header.type !== "table") {
					throw Errors.General.UnsupportedFeature("Only LIST and TABLE queries are supported.");
				}
				if (containsCsv(parsed.value.source)) throw Errors.General.UnsupportedFeature("CSV sources are disabled.");
				const executed = await api.query(parsed.value, origin);
				if (workerFailed) throw Errors.Vault.ReadError("A Dataview worker failed.");
				if (!executed.successful) throw Errors.Query.InvalidQuery("Dataview query execution failed.");
				const output = executed.value;
				if (output.type !== "list" && output.type !== "table") {
					throw Errors.General.UnsupportedFeature("Only LIST and TABLE queries are supported.");
				}
				const values = output.values.slice(0, limit);
				return {
					generation,
					data:
						output.type === "list"
							? { type: "list", values: values.map(serialize) }
							: {
									type: "table",
									headers: output.headers,
									values: output.values.slice(0, limit).map((row) => row.map(serialize)),
								},
					diagnostics: [{ code: "NON_ATOMIC_SNAPSHOT", message: "The filesystem may change during indexing." }],
					truncated: output.values.length > limit,
				};
			},
			close() {
				closing = true;
				component.unload();
			},
		};
	} catch (error) {
		component.unload();
		throw error;
	}
}
