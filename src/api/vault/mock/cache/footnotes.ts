import { CacheItem, SubpathResult } from "./types.js";

/**
 * A footnote in the note.
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
 */
export interface FootnoteCache extends CacheItem {
    /**
     * The footnote ID.
     * @example
     * ```ts
     * console.log(footnoteCache.id); // 1
     * console.log(footnoteCache.id); // qux
     * ```
     * @public
     */
    id: string;
}

/**
 * A footnote reference in the note.
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
 */
export interface FootnoteRefCache extends CacheItem {
    /**
     * The footnote ID.
     * @example
     * ```ts
     * console.log(footnoteRefCache.id); // 1
     * console.log(footnoteRefCache.id); // qux
     * ```
     * @public
     */
    id: string;
}

/**
 * Subpath result for a footnote from {@link resolveSubpath}.
 * @public
 * @since 1.7.2
 */
export interface FootnoteSubpathResult extends SubpathResult {
    /**
     * The type of the subpath result.
     * @public
     */
    type: "footnote";
    /**
     * The footnote.
     * @public
     */
    footnote: FootnoteCache;
}
