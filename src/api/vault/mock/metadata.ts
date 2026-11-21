import { type EventRef, Events } from "../../../host/obsidian/base/events.js";
import type { TFile } from "../../../host/obsidian/files/files.js";
import type { BlockSubpathResult } from "./cache/blocks.js";
import type { CachedMetadata } from "./cache/cache.js";
import type { FootnoteSubpathResult } from "./cache/footnotes.js";
import type { HeadingSubpathResult } from "./cache/headings.js";
import type { ReferenceCache } from "./cache/reference.js";
import type { Reference } from "./cache/types.js";

/**
 * Iterate links and embeds.
 * If callback returns true, the iteration process will be interrupted.
 * @param cache The cached metadata.
 * @param cb Called for each link and embed.
 * @returns `true` if callback ever returns `true`, `false` otherwise.
 * @public
 * @deprecated
 */
export function iterateCacheRefs(cache: CachedMetadata, cb: (ref: ReferenceCache) => boolean | undefined): boolean;

/**
 * If callback returns true, the iteration process will be interrupted.
 * @param refs The references.
 * @param cb Called for each reference.
 * @returns `true` if callback ever returns `true`, `false` otherwise.
 * @public
 */
export function iterateRefs(refs: Reference[], cb: (ref: Reference) => boolean | undefined): boolean;

/**
 * Provides access to the cached metadata of the files in the vault.
 *
 * Linktext is any internal link that is composed of a path and a subpath, such as 'My note#Heading'
 * Linkpath (or path) is the path part of a linktext
 * Subpath is the heading/block ID part of a linktext.
 * @public
 */
export class MetadataCache extends Events {
	/**
	 * Get the best match for a linkpath.
	 * @param linkpath The linkpath.
	 * @param sourcePath The path of the file containing the link, used to resolve relative links.
	 * @returns The file, or `null` if no file matches.
	 * @example
	 * ```ts
	 * console.log(metadataCache.getFirstLinkpathDest('foo/bar', 'baz/qux.md')); // `TFile` with path: 'baz/foo/bar.md' or 'some/other/path/foo/bar.md'
	 * ```
	 * @public
	 * @since 0.12.5
	 */
	getFirstLinkpathDest(linkpath: string, sourcePath: string): TFile | null {
		throw new Error("Method not implemented.");
	}

	/**
	 * Get the cached metadata for a file.
	 * @param file The file.
	 * @returns The cached metadata, or `null` if it is not cached.
	 * @public
	 * @since 0.9.21
	 */
	getFileCache(file: TFile): CachedMetadata | null {
		throw new Error("Method not implemented.");
	}

	/**
	 * Get the cached metadata for a path.
	 * @param path The path of the file.
	 * @returns The cached metadata, or `null` if it is not cached.
	 * @public
	 * @since 0.14.5
	 */
	getCache(path: string): CachedMetadata | null {
		throw new Error("Method not implemented.");
	}

	/**
	 * Generates a linktext for a file.
	 *
	 * If file name is unique, use the filename.
	 * If not unique, use full path.
	 * @param file The file.
	 * @param sourcePath The path of the file where the link will be inserted, used to generate relative paths.
	 * @param omitMdExtension Whether to omit the `.md` extension.
	 * @example
	 * ```ts
	 * console.log(metadataCache.fileToLinktext(file, 'baz/qux.md')); // 'bar' or 'foo/bar' depending on whether the file name is unique
	 * ```
	 * @public
	 */
	fileToLinktext(file: TFile, sourcePath: string, omitMdExtension?: boolean): string {
		throw new Error("Method not implemented.");
	}

	/**
	 * Contains all resolved links. This object maps each source file's path to an object of destination file paths with the link count.
	 * Source and destination paths are all vault absolute paths that comes from `TFile.path` and can be used with `Vault.getAbstractFileByPath(path)`.
	 * @public
	 */
	resolvedLinks: Record<string, Record<string, number>>;

	/**
	 * Contains all unresolved links. This object maps each source file to an object of unknown destinations with count.
	 * Source paths are all vault absolute paths, similar to {@link MetadataCache.resolvedLinks}.
	 * @public
	 */
	unresolvedLinks: Record<string, Record<string, number>>;

	/**
	 * Called when a file has been indexed, and its (updated) cache is now available.
	 *
	 * Note: This is not called when a file is renamed for performance reasons.
	 * You must hook the {@link Vault.on | Vault.on(name: 'rename')} event for those.
	 * @public
	 */
	on(name: "changed", callback: (file: TFile, data: string, cache: CachedMetadata) => any, ctx?: any): EventRef;

	/**
	 * Called when a file has been deleted. A best-effort previous version of the cached metadata is presented,
	 * but it could be `null` in case the file was not successfully cached previously.
	 * @public
	 */
	on(name: "deleted", callback: (file: TFile, prevCache: CachedMetadata | null) => any, ctx?: any): EventRef;

	/**
	 * Called when a file has been resolved for {@link MetadataCache.resolvedLinks} and {@link MetadataCache.unresolvedLinks}.
	 * This happens sometimes after a file has been indexed.
	 * @public
	 */
	on(name: "resolve", callback: (file: TFile) => any, ctx?: any): EventRef;

	/**
	 * Called when all files have been resolved. This will be fired each time files get modified after the initial load.
	 * @public
	 */
	on(name: "resolved", callback: () => any, ctx?: any): EventRef {
		throw new Error("Method not implemented.");
	}
}

/**
 * Resolve the given subpath to a reference in the MetadataCache.
 * @param cache The cached metadata of the note.
 * @param subpath The subpath, starting with `#`.
 * @returns The result, or `null` if the subpath is not found.
 * @public
 */
export function resolveSubpath(
	cache: CachedMetadata,
	subpath: string,
): HeadingSubpathResult | BlockSubpathResult | FootnoteSubpathResult | null;
