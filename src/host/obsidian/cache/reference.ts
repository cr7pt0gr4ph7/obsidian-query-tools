import type { CacheItem, Reference } from "./types.js";

/**
 * A {@link Reference} with a position in the note.
 * @public
 */
export interface ReferenceCache extends Reference, CacheItem {}

/**
 * A reference link in the note.
 * ```markdown
 * [google]
 *
 * [google]: https://google.com
 * ```
 * @public
 * @since 1.8.7
 */
export interface ReferenceLinkCache extends CacheItem {
	/**
	 * The reference ID.
	 * @example
	 * ```ts
	 * console.log(referenceLinkCache.id); // google
	 * ```
	 * @public
	 */
	id: string;

	/**
	 * The link destination.
	 * @example
	 * ```ts
	 * console.log(referenceLinkCache.link); // https://google.com
	 * ```
	 * @public
	 */
	link: string;
}
