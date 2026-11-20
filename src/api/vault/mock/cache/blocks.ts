import { ListItemCache } from "./lists.js";
import { CacheItem, SubpathResult } from "./types.js";

/**
 * A block with an ID in the note.
 * ```markdown
 * foo ^bar
 * ```
 * @public
 * @since 0.11.13
 */
export interface BlockCache extends CacheItem {
	/**
	 * The block ID.
	 * @example
	 * ```ts
	 * console.log(blockCache.id); // bar
	 * ```
	 * @public
	 */
	id: string;
}

/**
 * Subpath result for a block from {@link resolveSubpath}.
 * @example
 * ```ts
 * console.log(resolveSubpath(myNoteCache, '#^foo'));
 * ```
 * @public
 * @since 0.13.26
 */
export interface BlockSubpathResult extends SubpathResult {
	/**
	 * The type of the subpath result.
	 * @public
	 */
	type: "block";

	/**
	 * The block.
	 * @public
	 */
	block: BlockCache;

	/**
	 * The list item, if the block is a list item.
	 * @public
	 */
	list?: ListItemCache;
}
