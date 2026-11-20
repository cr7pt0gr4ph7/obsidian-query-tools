import type { BlockCache } from "./blocks.js";
import type { EmbedCache } from "./embeds.js";
import type { FootnoteCache, FootnoteRefCache } from "./footnotes.js";
import { type FrontMatterCache, FrontMatterInfo, type FrontmatterLinkCache } from "./frontmatter.js";
import type { HeadingCache } from "./headings.js";
import type { LinkCache } from "./links.js";
import type { ListItemCache } from "./lists.js";
import type { ReferenceLinkCache } from "./reference.js";
import type { SectionCache } from "./sections.js";
import type { TagCache } from "./tags.js";
import type { Pos } from "./types.js";

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
