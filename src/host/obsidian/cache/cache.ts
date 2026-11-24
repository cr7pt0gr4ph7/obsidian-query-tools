import { type EventRef, Events } from "../base/events.js";
import type { TFile } from "../files/files.js";
import type { BlockCache, BlockSubpathResult } from "./blocks.js";
import type { EmbedCache } from "./embeds.js";
import type { FootnoteCache, FootnoteRefCache, FootnoteSubpathResult } from "./footnotes.js";
import type { FrontMatterCache, FrontmatterLinkCache } from "./frontmatter.js";
import type { HeadingCache, HeadingSubpathResult } from "./headings.js";
import type { LinkCache } from "./links.js";
import type { ListItemCache } from "./lists.js";
import type { ReferenceCache, ReferenceLinkCache } from "./reference.js";
import type { SectionCache } from "./sections.js";
import type { TagCache } from "./tags.js";
import type { Pos, Reference } from "./types.js";

/**
 * Combines all tags from frontmatter and note content into a single array.
 * @example
 * For the following note:
 * ```markdown
 * ---
 * tags:
 *   - foo
 *   - bar
 * ---
 *
 * #baz
 * ```
 * Usage:
 * ```ts
 * console.log(getAllTags(cache)); // ['#foo', '#bar', '#baz']
 * ```
 * @public
 */
export function getAllTags(cache: CachedMetadata): string[] | null {
	// TODO: Discard duplicates?
	return [...(getFrontmatterTags(cache) ?? []), ...(getBodyTags(cache) ?? [])];
}

function getFrontmatterTags(cache: CachedMetadata) {
	const tags = cache.frontmatter?.tags;
	if (tags === null) {
		return null;
	} else if (Array.isArray(tags)) {
		return tags.map((tag) => (!tag || tag.startsWith("#") ? tag : `#${tag}`));
	} else {
		return [];
	}
}

function getBodyTags(cache: CachedMetadata) {
	return cache.tags?.map((tag) => tag.tag);
}

/**
 * Cached metadata for a note.
 * @public
 */
export interface CachedMetadata {
	/**
	 * The links in the note.
	 * ```markdown
	 * [[wikilink]]
	 * [[wikilink|alias]]
	 * [alias](markdown-link)
	 * ```
	 * @public
	 */
	links?: LinkCache[];

	/**
	 * The embeds in the note.
	 * ```markdown
	 * ![[wikilink]]
	 * ![[wikilink|alias]]
	 * ![alias](markdown-link)
	 * ```
	 * @public
	 */
	embeds?: EmbedCache[];

	/**
	 * The tags in the note.
	 * ```markdown
	 * ---
	 * tags:
	 *   - foo
	 *   - bar
	 * ---
	 *
	 * #baz
	 * ```
	 * @public
	 */
	tags?: TagCache[];

	/**
	 * The headings in the note.
	 * ```markdown
	 * # foo
	 * ## bar
	 * ### baz
	 * ```
	 * @public
	 */
	headings?: HeadingCache[];

	/**
	 * The footnotes in the note.
	 * ```markdown
	 * foo [^1]
	 *
	 * [^1]: bar
	 *
	 * baz [^qux]
	 *
	 * [^qux]: quux
	 * ```
	 * @public
	 * @since 1.6.6
	 */
	footnotes?: FootnoteCache[];

	/**
	 * The footnote references in the note.
	 * ```markdown
	 * foo [^1]
	 *
	 * [^1]: bar
	 *
	 * baz [^qux]
	 *
	 * [^qux]: quux
	 * ```
	 * @public
	 * @since 1.8.7
	 */
	footnoteRefs?: FootnoteRefCache[];

	/**
	 * The reference links in the note.
	 * ```markdown
	 * [google]
	 *
	 * [google]: https://google.com
	 * ```
	 * @public
	 * @since 1.8.7
	 */
	referenceLinks?: ReferenceLinkCache[];

	/**
	 * The sections of the note.
	 * Sections are root level Markdown blocks, which can be used to divide the document up.
	 * ```markdown
	 * # Heading section
	 *
	 * Paragraph section
	 *
	 * > [!NOTE]
	 * > Callout section
	 * ```
	 * @public
	 */
	sections?: SectionCache[];

	/**
	 * The list items in the note.
	 * ```markdown
	 * - Unordered List Item 1
	 * - Unordered List Item 2
	 * - Unordered List Item 3
	 *
	 * 1. Ordered List Item 1
	 * 2. Ordered List Item 2
	 * 3. Ordered List Item 3
	 * ```
	 * @public
	 */
	listItems?: ListItemCache[];

	/**
	 * The frontmatter of the note.
	 * ```markdown
	 * ---
	 * key1: "value1"
	 * key2: 42
	 * ---
	 * ```
	 * @public
	 */
	frontmatter?: FrontMatterCache;

	/**
	 * Position of the frontmatter in the file.
	 * ```markdown
	 * ---
	 * key1: "value1"
	 * key2: 42
	 * ---
	 * ```
	 * @public
	 * @since 1.4.0
	 */
	frontmatterPosition?: Pos;

	/**
	 * The links in the frontmatter.
	 * ```markdown
	 * ---
	 * key1: "[[wikilink]]"
	 * key2: "[[wikilink|alias]]"
	 * ---
	 * ```
	 * @public
	 * @since 1.4.0
	 */
	frontmatterLinks?: FrontmatterLinkCache[];

	/**
	 * The blocks with IDs in the note, keyed by ID.
	 * ```markdown
	 * foo ^bar
	 * ```
	 * @public
	 */
	blocks?: Record<string, BlockCache>;
}

/**
 * Iterate links and embeds.
 * If callback returns true, the iteration process will be interrupted.
 * @param cache The cached metadata.
 * @param cb Called for each link and embed.
 * @returns `true` if callback ever returns `true`, `false` otherwise.
 * @public
 * @deprecated
 */
export function iterateCacheRefs(cache: CachedMetadata, cb: (ref: ReferenceCache) => boolean | undefined): boolean {
	for (const ref of [...(cache.links ?? []), ...(cache.embeds ?? [])]) {
		if (cb(ref)) {
			return true;
		}
	}
	return false;
}

/**
 * If callback returns true, the iteration process will be interrupted.
 * @param refs The references.
 * @param cb Called for each reference.
 * @returns `true` if callback ever returns `true`, `false` otherwise.
 * @public
 */
export function iterateRefs(refs: Reference[], cb: (ref: Reference) => boolean | undefined): boolean {
	for (const ref of refs) {
		if (cb(ref as ReferenceCache)) {
			return true;
		}
	}
	return false;
}

/**
 * Provides access to the cached metadata of the files in the vault.
 *
 * Linktext is any internal link that is composed of a path and a subpath, such as 'My note#Heading'
 * Linkpath (or path) is the link to a file with a subpath.
 * Subpath is the heading/block ID part of a linktext.
 * @public
 */
export class MetadataCache extends Events {
	/**
	 * Get the best match for a linkpath.
	 * @param linkpath The linkpath.
	 * @param sourcePath The path of the file containing the link.
	 * @returns The file, or `null` if no file matches.
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
	 * @param file The file.
	 * @param sourcePath The path of the file where the link will be inserted.
	 * @param omitMdExtension Whether to omit the Markdown extension.
	 * @returns The generated linktext.
	 * @public
	 */
	fileToLinktext(file: TFile, sourcePath: string, omitMdExtension?: boolean): string {
		throw new Error("Method not implemented.");
	}

	/**
	 * Contains all resolved links.
	 * @public
	 */
	resolvedLinks: Record<string, Record<string, number>> = {};

	/**
	 * Contains all unresolved links.
	 * @public
	 */
	unresolvedLinks: Record<string, Record<string, number>> = {};

	/**
	 * Called when a file has been indexed.
	 * @param name The event name.
	 * @param callback The listener.
	 * @param ctx The `this` value for the callback.
	 * @returns An event reference.
	 * @public
	 */
	on(name: "changed", callback: (file: TFile, data: string, cache: CachedMetadata) => any, ctx?: any): EventRef;

	/**
	 * Called when a file has been deleted.
	 * @param name The event name.
	 * @param callback The listener.
	 * @param ctx The `this` value for the callback.
	 * @returns An event reference.
	 * @public
	 */
	on(name: "deleted", callback: (file: TFile, prevCache: CachedMetadata | null) => any, ctx?: any): EventRef;

	/**
	 * Called when a file has been resolved.
	 * @param name The event name.
	 * @param callback The listener.
	 * @param ctx The `this` value for the callback.
	 * @returns An event reference.
	 * @public
	 */
	on(name: "resolve", callback: (file: TFile) => any, ctx?: any): EventRef;

	/**
	 * Called when all files have been resolved.
	 * @param name The event name.
	 * @param callback The listener.
	 * @param ctx The `this` value for the callback.
	 * @returns An event reference.
	 * @public
	 */
	on(name: "resolved", callback: () => any, ctx?: any): EventRef;

	/** @inheritDoc */
	on(name: string, callback: (...args: any[]) => any, ctx?: any): EventRef;

	on(name: string, callback: (...args: any[]) => any, ctx?: any): EventRef {
		return super.on(name, callback, ctx);
	}
}

/**
 * Resolve a subpath to a reference in the metadata cache.
 * @param cache The cached metadata of the note.
 * @param subpath The subpath, starting with `#`.
 * @returns The result, or `null` if the subpath is not found.
 * @public
 */
export function resolveSubpath(
	cache: CachedMetadata,
	subpath: string,
): HeadingSubpathResult | BlockSubpathResult | FootnoteSubpathResult | null {
	if (!subpath.startsWith("#")) {
		return null;
	}
	const target = subpath.slice(1);
	if (target.startsWith("^")) {
		const blockId = target.slice(1);
		const block = cache.blocks?.[blockId];
		if (block) {
			return { type: "block", block, start: block.position.start, end: block.position.end };
		}
		return null;
	}
	const footnote = cache.footnotes?.find((item) => item.id === target);
	if (footnote) {
		return { type: "footnote", footnote, start: footnote.position.start, end: footnote.position.end };
	}
	const headingIndex = cache.headings?.findIndex((item) => item.heading === target);
	if (headingIndex === undefined || headingIndex < 0) {
		return null;
	}
	// biome-ignore lint/style/noNonNullAssertion: This is intentional
	const heading = cache.headings![headingIndex];
	// biome-ignore lint/style/noNonNullAssertion: This is intentional
	const next = cache.headings!.slice(headingIndex + 1).find((item) => item.level <= heading.level);
	if (!next) {
		return null;
	}
	return {
		type: "heading",
		current: heading,
		next,
		start: heading.position.start,
		end: heading.position.end,
	};
}
