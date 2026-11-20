import { CacheItem, SubpathResult } from "./types.js";

/**
 * A heading in the note.
 * ```markdown
 * # foo
 * ## bar
 * ### baz
 * ```
 * @public
 */
export interface HeadingCache extends CacheItem {
	/**
	 * The heading text.
	 * @example
	 * ```ts
	 * console.log(headingCache.heading); // foo
	 * ```
	 * @public
	 */
	heading: string;
	/**
	 * Number between 1 and 6.
	 * @example
	 * ```ts
	 * console.log(headingCache.level); // 1
	 * ```
	 * @public
	 */
	level: number;
}

/**
 * Subpath result for a heading from {@link resolveSubpath}.
 * @example
 * ```ts
 * console.log(resolveSubpath(myNoteCache, '#foo'));
 * ```
 * @public
 * @since 0.9.16
 */
export interface HeadingSubpathResult extends SubpathResult {
	/**
	 * The type of the subpath result.
	 * @public
	 * @since 0.9.16
	 */
	type: "heading";
	/**
	 * The heading.
	 * @public
	 * @since 0.9.16
	 */
	current: HeadingCache;
	/**
	 * The next heading on the same or a higher level.
	 * @public
	 * @since 0.9.16
	 */
	next: HeadingCache;
}
