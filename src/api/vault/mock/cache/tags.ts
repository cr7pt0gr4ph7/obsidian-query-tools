import type { CacheItem } from "./types.js";

/**
 * A tag in the note.
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
 * @since 0.9.7
 */
export interface TagCache extends CacheItem {
	/**
	 * The tag, including the `#`.
	 * @example #foo
	 * @public
	 */
	tag: string;
}
